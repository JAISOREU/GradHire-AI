import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CacheService } from '../cache/cache.service';

import type { Prisma, FeedPost, FeedPostComment, User, Profile, EmployerProfile, Job } from '@prisma/client';

export type FeedAuthorDto = {
  id: string;
  name: string;
  title: string;
  avatar?: string | null;
  verified?: boolean;
};

export type FeedJobRowDto = {
  title: string;
  company: string;
  location?: string | null;
};

export type FeedPostDto = {
  id: string;
  author: FeedAuthorDto;
  content: string;
  createdAt: string;
  image?: string | null;
  job?: FeedJobRowDto | null;
  likes: number;
  comments: number;
  shares: number;
  likedByMe: boolean;
};

export type FeedCommentDto = {
  id: string;
  author: FeedAuthorDto;
  content: string;
  createdAt: string;
};

type PostRow = FeedPost & {
  author: User & { profile: Profile | null; employerProfile: EmployerProfile | null };
  job: Job | null;
  _count: { likes: number; comments: number };
};

type CommentRow = FeedPostComment & {
  author: User & { profile: Profile | null; employerProfile: EmployerProfile | null };
};

@Injectable()
export class FeedService {
  private readonly authorInclude = {
    profile: true,
    employerProfile: true,
  } satisfies Prisma.UserInclude;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async getFeed(user: { id: string }, limit = 50): Promise<FeedPostDto[]> {
    const follows = await this.prisma.userFollow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });
    const authorIds = [user.id, ...follows.map((f) => f.followingId)];

    const posts = await this.prisma.feedPost.findMany({
      where: { authorId: { in: authorIds } },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 100),
      include: {
        author: { include: this.authorInclude },
        job: true,
        _count: { select: { likes: true, comments: true } },
      },
    });

    const likedRows = await this.prisma.feedPostLike.findMany({
      where: { postId: { in: posts.map((p) => p.id) }, userId: user.id },
      select: { postId: true },
    });
    const likedSet = new Set(likedRows.map((l) => l.postId));

    return posts.map((p) => this.serializePost(p, likedSet.has(p.id)));
  }

  async createPost(
    user: { id: string; email: string; role: string },
    input: { content: string; imageUrl?: string | null; jobId?: string | null },
  ): Promise<FeedPostDto> {
    const content = input.content?.trim();
    if (!content) {
      throw new BadRequestException('Post content is required');
    }
    if (input.jobId) {
      const job = await this.prisma.job.findUnique({ where: { id: input.jobId }, select: { id: true } });
      if (!job) throw new NotFoundException('Job not found');
    }
    const post = await this.prisma.feedPost.create({
      data: {
        authorId: user.id,
        content,
        imageUrl: input.imageUrl ?? null,
        jobId: input.jobId ?? null,
      },
      include: {
        author: { include: this.authorInclude },
        job: true,
        _count: { select: { likes: true, comments: true } },
      },
    });
    await this.invalidate();
    return this.serializePost(post, false);
  }

  async deletePost(user: { id: string; role: string }, postId: string): Promise<{ ok: true }> {
    const post = await this.prisma.feedPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own posts');
    }
    await this.prisma.feedPost.delete({ where: { id: postId } });
    await this.invalidate();
    return { ok: true };
  }

  async toggleLike(user: { id: string }, postId: string): Promise<FeedPostDto> {
    const existing = await this.prisma.feedPostLike.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
    });
    if (existing) {
      await this.prisma.feedPostLike.delete({ where: { id: existing.id } });
    } else {
      const post = await this.prisma.feedPost.findUnique({ where: { id: postId }, select: { id: true } });
      if (!post) throw new NotFoundException('Post not found');
      await this.prisma.feedPostLike.create({ data: { postId, userId: user.id } });
    }
    await this.invalidate();
    return this.getSerialized(user.id, postId);
  }

  async addComment(user: { id: string }, postId: string, content: string): Promise<FeedPostDto> {
    const trimmed = content?.trim();
    if (!trimmed) throw new BadRequestException('Comment content is required');
    const post = await this.prisma.feedPost.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) throw new NotFoundException('Post not found');
    await this.prisma.feedPostComment.create({ data: { postId, authorId: user.id, content: trimmed } });
    await this.invalidate();
    return this.getSerialized(user.id, postId);
  }

  async getComments(user: { id: string }, postId: string): Promise<FeedCommentDto[]> {
    const post = await this.prisma.feedPost.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) throw new NotFoundException('Post not found');
    const comments = await this.prisma.feedPostComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: { author: { include: this.authorInclude } },
    });
    return comments.map((c) => this.serializeComment(c));
  }

  private async getSerialized(userId: string, postId: string): Promise<FeedPostDto> {
    const post = await this.prisma.feedPost.findUnique({
      where: { id: postId },
      include: {
        author: { include: this.authorInclude },
        job: true,
        _count: { select: { likes: true, comments: true } },
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    const liked = await this.prisma.feedPostLike.findUnique({
      where: { postId_userId: { postId, userId } },
      select: { id: true },
    });
    return this.serializePost(post, !!liked);
  }

  private serializeAuthor(author: PostRow['author']): FeedAuthorDto {
    const title = author.profile?.focus || author.employerProfile?.companyName || '';
    return {
      id: author.id,
      name: author.profile?.name ?? author.email.replace(/@.*/, ''),
      title,
      avatar: author.avatarUrl,
      verified: author.employerProfile?.verified ?? false,
    };
  }

  private serializePost(post: PostRow, likedByMe: boolean): FeedPostDto {
    return {
      id: post.id,
      author: this.serializeAuthor(post.author),
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      image: post.imageUrl,
      job: post.job
        ? {
            title: post.job.title,
            company: post.job.company ?? '',
            location: [post.job.city, post.job.country].filter(Boolean).join(', ') || null,
          }
        : null,
      likes: post._count.likes,
      comments: post._count.comments,
      shares: 0,
      likedByMe,
    };
  }

  private serializeComment(comment: CommentRow): FeedCommentDto {
    return {
      id: comment.id,
      author: this.serializeAuthor(comment.author),
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
    };
  }

  private async invalidate(): Promise<void> {
    try {
      await this.cache.invalidate('feed:*');
    } catch {
      // cache invalidation is best effort
    }
  }
}