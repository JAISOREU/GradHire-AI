import { Injectable, BadRequestException, NotFoundException, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IStorageService } from '../storage/storage.service';
import { STORAGE_SERVICE } from '../storage/storage.module';
import { extname } from 'node:path';
import { createReadStream, stat } from 'node:fs';
import { Readable } from 'node:stream';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService, @Inject(STORAGE_SERVICE) private readonly storage: IStorageService) {}

  async getAvatar(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    if (!user?.avatarUrl) {
      throw new NotFoundException('Avatar not found');
    }

    return { avatarUrl: user.avatarUrl };
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type. Please upload JPEG, PNG, or WebP.');
    }

    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException('Unsupported file extension. Please upload .jpg, .jpeg, .png, or .webp.');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File is too large. Maximum size is 5 MB.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const key = `avatars/${userId}${ext}`;

    if (user.avatarUrl) {
      try {
        await this.storage.remove(user.avatarUrl);
      } catch {
        this.logger.warn(`Failed to remove old avatar: ${user.avatarUrl}`);
      }
    }

    await this.storage.upload(
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
      key,
    );

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: key },
      select: { avatarUrl: true },
    });

    return { avatarUrl: updated.avatarUrl };
  }

  async deleteAvatar(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    if (!user?.avatarUrl) {
      throw new NotFoundException('Avatar not found');
    }

    try {
      await this.storage.remove(user.avatarUrl);
    } catch {
      this.logger.warn(`Failed to remove avatar: ${user.avatarUrl}`);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
      select: { avatarUrl: true },
    });

    return { avatarUrl: null };
  }

  async serveAvatar(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    if (!user?.avatarUrl) {
      return null;
    }

    const mimeType = this.getMimeType(user.avatarUrl);
    const stream = createReadStream(user.avatarUrl);

    return { stream, contentType: mimeType };
  }

  private getMimeType(key: string): string {
    const ext = extname(key).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }
}
