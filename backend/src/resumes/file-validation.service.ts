import { Injectable, Logger } from '@nestjs/common';

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedFilename: string;
  detectedMime: string;
}

@Injectable()
export class FileValidationService {
  private readonly logger = new Logger(FileValidationService.name);

  private static readonly ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ]);

  private static readonly ALLOWED_EXTENSIONS = new Set([
    'pdf',
    'docx',
    'txt',
  ]);

  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024;

  private static readonly TEXT_EXTENSIONS = new Set(['txt']);

  validate(file: { buffer: Buffer; originalname: string; mimetype: string; size: number }): FileValidationResult {
    const errors: string[] = [];
    const originalname = file.originalname || '';
    const sanitizedFilename = originalname.replace(/\0/g, '').trim() || 'resume';
    const ext = sanitizedFilename.split('.').pop()?.toLowerCase() ?? '';
    const mime = (file.mimetype || '').toLowerCase();

    if (!sanitizedFilename || sanitizedFilename === 'resume') {
      errors.push('Filename is missing or invalid.');
    }

    if (file.size > FileValidationService.MAX_FILE_SIZE) {
      errors.push(`File size exceeds the ${FileValidationService.MAX_FILE_SIZE / 1024 / 1024} MB limit.`);
    }

    if (file.size === 0) {
      errors.push('File is empty.');
    }

    const hasAllowedExtension = FileValidationService.ALLOWED_EXTENSIONS.has(ext);
    const hasAllowedMime =
      FileValidationService.ALLOWED_MIME_TYPES.has(mime) ||
      (ext === 'txt' && mime === 'text/plain');

    if (!hasAllowedExtension && !hasAllowedMime) {
      errors.push(`Unsupported file type. Allowed: PDF, DOCX, TXT. Got: .${ext} / ${mime || 'unknown'}`);
    }

    if (ext === 'doc') {
      errors.push('Legacy .doc format is not supported. Please upload a .docx or PDF file.');
    }

    if (!this.hasValidFileSignature(file.buffer, ext)) {
      errors.push('File content does not match its extension. The file may be corrupted or disguised.');
    }

    if (/\0/.test(originalname) || /\0/.test(sanitizedFilename)) {
      errors.push('Filename contains invalid null bytes.');
    }

    const textSample = file.buffer.toString('utf-8', 0, Math.min(file.size, 8192));
    if (/\0/.test(textSample) && !FileValidationService.TEXT_EXTENSIONS.has(ext)) {
      errors.push('File content contains null bytes. The file may be corrupted.');
    }

    const detectedMime = this.detectMimeFromSignature(file.buffer, ext) || mime || 'application/octet-stream';

    return {
      valid: errors.length === 0,
      errors,
      sanitizedFilename,
      detectedMime,
    };
  }

  private hasValidFileSignature(buffer: Buffer, ext: string): boolean {
    if (ext === 'pdf') {
      return buffer.toString('ascii', 0, 5) === '%PDF-';
    }
    if (ext === 'docx') {
      const signature = buffer.readUInt32LE(0);
      return signature === 0x504B0304 || buffer.toString('ascii', 0, 2) === 'PK';
    }
    if (ext === 'txt') {
      return true;
    }
    return true;
  }

  private detectMimeFromSignature(buffer: Buffer, ext: string): string | null {
    if (ext === 'pdf' && buffer.toString('ascii', 0, 5) === '%PDF-') {
      return 'application/pdf';
    }
    if (ext === 'docx' && buffer.toString('ascii', 0, 2) === 'PK') {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    if (ext === 'txt') {
      return 'text/plain';
    }
    return null;
  }
}
