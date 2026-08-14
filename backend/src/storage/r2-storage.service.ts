import { Injectable, Logger } from '@nestjs/common';
import { IStorageService, UploadedFile } from './storage.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class R2StorageService implements IStorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.R2_BUCKET ?? 'gradhire-uploads';
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY;
    const secretAccessKey = process.env.R2_SECRET_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error('R2_ACCOUNT_ID, R2_ACCESS_KEY, and R2_SECRET_KEY must be configured');
    }

    const endpoint = process.env.R2_ENDPOINT ?? `https://${accountId}.r2.cloudflarestorage.com`;

    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async upload(file: UploadedFile, key: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    this.logger.debug({ key, bucket: this.bucket }, 'File uploaded to R2');
    return key;
  }

  async remove(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      const chunks: Uint8Array[] = [];
      for await (const chunk of (response.Body as AsyncIterable<Uint8Array>)) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch {
      return null;
    }
  }
}
