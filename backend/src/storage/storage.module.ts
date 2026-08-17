import { Module } from '@nestjs/common';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';
import { R2StorageService } from './r2-storage.service';
import { Logger } from '@nestjs/common';

export const STORAGE_SERVICE = 'STORAGE_SERVICE';

@Module({
  providers: [
    {
      provide: STORAGE_SERVICE,
      useFactory: () => {
        const provider = process.env.STORAGE_PROVIDER ?? 'local';
        const logger = new Logger('StorageModule');
        try {
          if (provider === 's3') {
            const service = new S3StorageService();
            logger.log('Storage provider: S3');
            return service;
          }
          if (provider === 'r2') {
            const service = new R2StorageService();
            logger.log('Storage provider: R2');
            return service;
          }
          logger.log('Storage provider: local');
          return new LocalStorageService();
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          logger.warn(`Storage provider ${provider} failed to initialize: ${message}. Falling back to local storage.`);
          return new LocalStorageService();
        }
      },
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
