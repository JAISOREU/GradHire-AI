import { Injectable, Logger } from '@nestjs/common';
import { IStorageService, UploadedFile } from './storage.service';
import { join, dirname, basename } from 'node:path';
import { promises as fs } from 'node:fs';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly basePath: string;

  constructor() {
    this.basePath = process.env.STORAGE_LOCAL_PATH ?? './uploads';
  }

  private sanitizeKey(key: string): string {
    const cleaned = basename(key).replace(/[^a-zA-Z0-9._-]/g, '_');
    if (cleaned !== key && !key.startsWith(this.basePath)) {
      throw new Error('Invalid storage key');
    }
    const resolved = join(this.basePath, cleaned);
    if (!resolved.startsWith(join(process.cwd(), this.basePath))) {
      throw new Error('Storage path traversal detected');
    }
    return resolved;
  }

  async upload(file: UploadedFile, key: string): Promise<string> {
    const fullPath = this.sanitizeKey(key);
    const dir = dirname(fullPath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, file.buffer);

    this.logger.debug({ key, size: file.size }, 'File uploaded to local storage');
    return key;
  }

  async remove(key: string): Promise<void> {
    const fullPath = this.sanitizeKey(key);
    try {
      await fs.unlink(fullPath);
    } catch {
      // ignore missing files
    }
  }

  async get(key: string): Promise<Buffer | null> {
    const fullPath = this.sanitizeKey(key);
    try {
      return await fs.readFile(fullPath);
    } catch {
      return null;
    }
  }
}
