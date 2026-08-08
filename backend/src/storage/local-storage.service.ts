import { Injectable, Logger } from '@nestjs/common';
import { IStorageService, UploadedFile } from './storage.service';
import { join, dirname } from 'node:path';
import { promises as fs } from 'node:fs';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly basePath: string;

  constructor() {
    this.basePath = process.env.STORAGE_LOCAL_PATH ?? './uploads';
  }

  async upload(file: UploadedFile, key: string): Promise<string> {
    const fullPath = join(this.basePath, key);
    const dir = dirname(fullPath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, file.buffer);

    this.logger.debug({ key, size: file.size }, 'File uploaded to local storage');
    return key;
  }

  async remove(key: string): Promise<void> {
    const fullPath = join(this.basePath, key);
    try {
      await fs.unlink(fullPath);
    } catch {
      // ignore missing files
    }
  }
}
