export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface IStorageService {
  upload(file: UploadedFile, key: string): Promise<string>;
  remove(key: string): Promise<void>;
  get(key: string): Promise<Buffer | null>;
}
