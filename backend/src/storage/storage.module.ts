import { Module } from '@nestjs/common';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';
import { R2StorageService } from './r2-storage.service';

export const STORAGE_SERVICE = 'STORAGE_SERVICE';

@Module({
  providers: [
    {
      provide: STORAGE_SERVICE,
      useFactory: () => {
        const provider = process.env.STORAGE_PROVIDER ?? 'local';
        if (provider === 's3') {
          return new S3StorageService();
        }
        if (provider === 'r2') {
          return new R2StorageService();
        }
        return new LocalStorageService();
      },
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
