import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CacheService } from '../cache/cache.service';

import type { Prisma, User, Profile, Education, Experience } from '@prisma/client';

export type NetworkRelation = 'NONE' | 'PENDING_IN' | 'PENDING_OUT' | 'CONNECTED';

export type NetworkPerson = {
  id: string;
  name: string;
  avatarUrl: string | null;
  title: string;
  organization: string;
  skills: string[];
  mutualCount: number;
  relation: NetworkRelation;
  connectionId: string | null;
  followed: boolean;
  role: 'STUDENT' | 'EMPLOYER';
};

export type SidebarData = {
  peopleYouMayKnow: NetworkPerson[];
  companiesToFollow: Array<{ id: string; name: string; industry: string | null; logo: string | null; followed: boolean }>;
  popularSkills: string[];
};

type PersonRow = User & { profile: Profile | null; educations: Education[]; experiences: Experience[]; employerProfile: { companyName: string | null } | null };

@Injectable()
export class NetworkService {
  private readonly userInclude = {
    profile: true,
    educations: { orderBy: { startDate: 'desc' } as const, take: 1 },
    experiences: { orderBy: { startDate: 'desc' } as const, take: 1 },
    employerProfile: true,
  } satisfies Prisma.UserInclude;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async suggested(userId: string, limit = 12): Promise<NetworkPerson[]> {
    const [me, candidates] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }),
      this.prisma.user.findMany({
        where: { id: { not: userId }, role: { not: 'ADMIN' } },
        take: 100,
        include: this.userInclude,
      }),
    ]);
    const mySkills = new Set(me?.profile?.skills ?? []);

    const discoverable = candidates.filter((c) => c.profile?.visibility !== 'PRIVATE');
    const people = await this.decorate(userId, discoverable);
    const fresh = people.filter((p) => p.relation === 'NONE');
    return fresh
      .map((p) => ({ ...p, score: p.skills.filter((s) => mySkills.has(s)).length * 2 + p.mutualCount }))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, limit)
      .map(({ score: _score, ...p }) => p);
  }

  async search(userId: string, q: string, limit = 20): Promise<NetworkPerson[]> {
    const term = q.trim().toLowerCase();
    if (!term) return [];

    const users = await this.prisma.user.findMany({
      where: { id: { not: userId }, role: { not: 'ADMIN' } },
      take: 300,
      include: this.userInclude,
    });

    const discoverable = users.filter((u) => u.profile?.visibility !== 'PRIVATE');
    const matching = discoverable.filter((u) => {
      const name = u.profile?.name ?? u.email.replace(/@.*/, '');
      const title = u.profile?.focus ?? u.experiences[0]?.jobTitle ?? '';
      const organization = u.educations[0]?.institution || u.experiences[0]?.company || '';
      const haystack = [name, title, organization, u.employerProfile?.companyName ?? '']
        .concat(u.profile?.skills ?? [])
        .map((s) => String(s ?? '').toLowerCase());
      return haystack.some((h) => h.includes(term));
    }).slice(0, limit);

    const people = await this.decorate(userId, matching);
    const namedFirst = people
      .filter((p) => p.name.toLowerCase().includes(term))
      .concat(people.filter((p) => !p.name.toLowerCase().includes(term)));
    return namedFirst.slice(0, limit);
  }

  async connections(userId: string): Promise<NetworkPerson[]> {
    const conns = await this.prisma.connection.findMany({
      where: { status: 'ACCEPTED', OR: [{ requesterId: userId }, { addresseeId: userId }] },
      select: { requesterId: true, addresseeId: true },
    });
    const ids = [...new Set(conns.map((c) => (c.requesterId === userId ? c.addresseeId : c.requesterId)))];
    if (ids.length === 0) return [];
    const users = await this.prisma.user.findMany({ where: { id: { in: ids } }, include: this.userInclude });
    return this.decorate(userId, users);
  }

  async requests(userId: string): Promise<NetworkPerson[]> {
    const reqs = await this.prisma.connection.findMany({
      where: { addresseeId: userId, status: 'PENDING' },
      select: { requesterId: true },
      orderBy: { createdAt: 'desc' },
    });
    const ids = [...new Set(reqs.map((r) => r.requesterId))];
    if (ids.length === 0) return [];
    const users = await this.prisma.user.findMany({ where: { id: { in: ids } }, include: this.userInclude });
    return this.decorate(userId, users);
  }

  async following(userId: string): Promise<NetworkPerson[]> {
    const follows = await this.prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
      orderBy: { createdAt: 'desc' },
    });
    const ids = follows.map((f) => f.followingId);
    if (ids.length === 0) return [];
    const users = await this.prisma.user.findMany({ where: { id: { in: ids } }, include: this.userInclude });
    return this.decorate(userId, users);
  }

  async connect(userId: string, targetId: string): Promise<{ ok: true }> {
    this.assertCanTarget(userId, targetId);
    const reverse = await this.prisma.connection.findUnique({
      where: { requesterId_addresseeId: { requesterId: targetId, addresseeId: userId } },
    });
    if (reverse) {
      if (reverse.status === 'PENDING') {
        await this.prisma.connection.update({ where: { id: reverse.id }, data: { status: 'ACCEPTED' } });
        await this.invalidate();
      }
      return { ok: true };
    }
    const mine = await this.prisma.connection.findUnique({
      where: { requesterId_addresseeId: { requesterId: userId, addresseeId: targetId } },
    });
    if (!mine) {
      await this.prisma.connection.create({
        data: { requesterId: userId, addresseeId: targetId, status: 'PENDING' },
      });
      await this.invalidate();
    }
    return { ok: true };
  }

  async accept(userId: string, connectionId: string): Promise<{ ok: true }> {
    const conn = await this.prisma.connection.findUnique({ where: { id: connectionId } });
    if (!conn || conn.addresseeId !== userId) {
      throw new ForbiddenException('You cannot accept this request');
    }
    if (conn.status === 'PENDING') {
      await this.prisma.connection.update({ where: { id: connectionId }, data: { status: 'ACCEPTED' } });
      await this.invalidate();
    }
    return { ok: true };
  }

  async decline(userId: string, connectionId: string): Promise<{ ok: true }> {
    const conn = await this.prisma.connection.findUnique({ where: { id: connectionId } });
    if (!conn || conn.addresseeId !== userId) {
      throw new ForbiddenException('You cannot decline this request');
    }
    if (conn.status === 'PENDING') {
      await this.prisma.connection.delete({ where: { id: connectionId } });
      await this.invalidate();
    }
    return { ok: true };
  }

  async removeConnection(userId: string, targetId: string): Promise<{ ok: true }> {
    const conn = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: targetId },
          { requesterId: targetId, addresseeId: userId, status: 'ACCEPTED' },
        ],
      },
    });
    if (!conn) throw new NotFoundException('No connection to remove');
    await this.prisma.connection.delete({ where: { id: conn.id } });
    await this.invalidate();
    return { ok: true };
  }

  async follow(userId: string, targetId: string): Promise<{ followed: true }> {
    this.assertCanTarget(userId, targetId);
    await this.prisma.userFollow.upsert({
      where: { followerId_followingId: { followerId: userId, followingId: targetId } },
      update: {},
      create: { followerId: userId, followingId: targetId },
    });
    await this.invalidate();
    return { followed: true };
  }

  async unfollow(userId: string, targetId: string): Promise<{ followed: false }> {
    await this.prisma.userFollow.deleteMany({
      where: { followerId: userId, followingId: targetId },
    });
    await this.invalidate();
    return { followed: false };
  }

  async sidebar(userId: string): Promise<SidebarData> {
    const [suggestedPeople, myConnections] = await Promise.all([
      this.suggested(userId, 8),
      this.connections(userId),
    ]);

    const skillCount = new Map<string, number>();
    for (const p of [...suggestedPeople, ...myConnections]) {
      for (const s of p.skills) skillCount.set(s, (skillCount.get(s) ?? 0) + 1);
    }
    const popularSkills = [...skillCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name]) => name);

    const followedRows = await this.prisma.companyFollow.findMany({
      where: { userId },
      select: { companyId: true },
    });
    const followedIds = followedRows.map((f) => f.companyId);
    const companies = await this.prisma.company.findMany({
      where: followedIds.length ? { id: { notIn: followedIds } } : {},
      take: 3,
      include: { _count: { select: { followers: true } } },
    });

    return {
      peopleYouMayKnow: suggestedPeople.slice(0, 3),
      companiesToFollow: companies.map((c) => ({
        id: c.id,
        name: c.name,
        industry: c.industry ?? null,
        logo: c.logo ?? null,
        followed: false,
      })),
      popularSkills,
    };
  }

  private async assertCanTarget(userId: string, targetId: string): Promise<void> {
    if (userId === targetId) {
      throw new BadRequestException('You cannot connect with yourself');
    }
    const target = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!target || target.role === 'ADMIN') {
      throw new NotFoundException('User not found');
    }
  }

  private async invalidate(): Promise<void> {
    try {
      await this.cache.invalidate('network:*');
    } catch {
      // cache invalidation is best effort
    }
  }

  private async decorate(me: string, users: PersonRow[]): Promise<NetworkPerson[]> {
    if (users.length === 0) return [];
    const ids = users.map((u) => u.id);

    const [accepted, pendings, myFollows] = await Promise.all([
      this.prisma.connection.findMany({
        where: {
          status: 'ACCEPTED',
          OR: [{ requesterId: { in: [me, ...ids] } }, { addresseeId: { in: [me, ...ids] } }],
        },
        select: { requesterId: true, addresseeId: true },
      }),
      this.prisma.connection.findMany({
        where: { status: 'PENDING', OR: [{ requesterId: me }, { addresseeId: me }] },
        select: { id: true, requesterId: true, addresseeId: true },
      }),
      this.prisma.userFollow.findMany({
        where: { followerId: me },
        select: { followingId: true },
      }),
    ]);

    const partnerSet = (id: string): Set<string> => {
      const set = new Set<string>();
      for (const c of accepted) {
        if (c.requesterId === id) set.add(c.addresseeId);
        if (c.addresseeId === id) set.add(c.requesterId);
      }
      return set;
    };

    const mySet = partnerSet(me);
    const followedSet = new Set(myFollows.map((f) => f.followingId));

    return users.map((u) => {
      let relation: NetworkRelation = 'NONE';
      let connectionId: string | null = null;
      if (mySet.has(u.id)) {
        relation = 'CONNECTED';
      } else {
        const incoming = pendings.find((p) => p.requesterId === u.id && p.addresseeId === me);
        if (incoming) {
          relation = 'PENDING_IN';
          connectionId = incoming.id;
        } else {
          const outgoing = pendings.find((p) => p.requesterId === me && p.addresseeId === u.id);
          if (outgoing) {
            relation = 'PENDING_OUT';
            connectionId = outgoing.id;
          }
        }
      }

      const theirSet = partnerSet(u.id);
      let mutualCount = 0;
      for (const partner of theirSet) {
        if (mySet.has(partner)) mutualCount++;
      }

      const education = u.educations[0];
      const experience = u.experiences[0];
      return {
        id: u.id,
        name: u.profile?.name ?? u.email.replace(/@.*/, ''),
        avatarUrl: u.avatarUrl,
        title: u.profile?.focus || experience?.jobTitle || '',
        organization: education?.institution || experience?.company || '',
        skills: (u.profile?.skills ?? []).slice(0, 6),
        mutualCount,
        relation,
        connectionId,
        followed: followedSet.has(u.id),
        role: u.role === 'EMPLOYER' ? 'EMPLOYER' : 'STUDENT',
      };
    });
  }
}