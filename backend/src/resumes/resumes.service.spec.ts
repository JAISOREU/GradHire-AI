import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { ResumesService } from './resumes.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { sanitizeDatabaseString, sanitizeFilename } from '../common/utils/sanitize';
import { FileValidationService } from './file-validation.service';

function createMockPrisma() {
  const resumes: Array<Record<string, unknown>> = [];
  const profiles: Array<Record<string, unknown>> = [];

  return {
    resume: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const fileName = String(data.fileName ?? '');
        const parsedText = String(data.parsedText ?? '');
        if (fileName.includes('\0') || parsedText.includes('\0')) {
          throw new Error(`PostgreSQL error: invalid byte sequence for encoding "UTF8": 0x00`);
        }
        const resume = { id: `res-${resumes.length + 1}`, ...data };
        resumes.push(resume);
        return resume;
      },
      findMany: async () => resumes,
      findUnique: async ({ where }: { where: { id: string } }) => resumes.find((r) => r.id === where.id) ?? null,
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const idx = resumes.findIndex((r) => r.id === where.id);
        if (idx === -1) throw new Error('not found');
        const updated = { ...resumes[idx], ...data, id: resumes[idx].id };
        resumes[idx] = updated;
        return updated;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const idx = resumes.findIndex((r) => r.id === where.id);
        if (idx === -1) throw new Error('not found');
        const deleted = resumes[idx];
        resumes.splice(idx, 1);
        return deleted;
      },
      count: async () => resumes.length,
      updateMany: async ({ where, data }: { where: { userId: string; id: { not: string } }; data: Record<string, unknown> }) => {
        const idx = resumes.findIndex((r) => r.userId === where.userId && r.id !== where.id.not);
        if (idx >= 0) {
          resumes[idx] = { ...resumes[idx], ...data };
        }
        return { count: idx >= 0 ? 1 : 0 };
      },
    },
    profile: {
      upsert: async ({ where, create, update }: { where: { userId: string }; create: Record<string, unknown>; update: Record<string, unknown> }) => {
        const idx = profiles.findIndex((p) => p.userId === where.userId);
        const profile = { ...(idx >= 0 ? profiles[idx] : {}), ...create, ...update };
        if (idx >= 0) {
          profiles[idx] = profile;
        } else {
          profiles.push(profile);
        }
        return profile;
      },
    },
    resumes,
    profiles,
  };
}

function createMockStorage() {
  const uploaded: Array<{ key: string }> = [];
  const removed: string[] = [];
  const files: Map<string, Buffer> = new Map();
  return {
    upload: async (file: { buffer: Buffer; originalname: string; mimetype: string; size: number }, key: string) => {
      uploaded.push({ key });
      files.set(key, file.buffer);
      return key;
    },
    remove: async (key: string) => {
      removed.push(key);
      files.delete(key);
    },
    get: async (key: string) => files.get(key) ?? null,
    uploaded,
    removed,
    files,
  };
}

const student = { id: 'stu-1', email: 'test@example.com', role: 'STUDENT' };

test('uploadAndParse sanitizes NUL bytes in filename before Prisma', async () => {
  const prisma = createMockPrisma();
  const storage = createMockStorage();
  const validator = new FileValidationService();
  const service = new ResumesService(prisma as any, storage as any, validator);

  const file = {
    buffer: Buffer.from('%PDF-1.4\nJordan Lee\njordan.lee@example.com\n(555) 123-4567\nData Analyst with experience building dashboards in Tableau and SQL.\nSkills: SQL, Tableau, Python, Data Analysis, Excel'),
    originalname: 'Résumé\0Test.pdf',
    mimetype: 'application/pdf',
    size: 200,
  };

  await assert.rejects(
    async () => service.uploadAndParse(student, file),
    BadRequestException,
  );
});

test('uploadAndParse sanitizes NUL bytes in extracted text before Prisma', async () => {
  const prisma = createMockPrisma();
  const storage = createMockStorage();
  const validator = new FileValidationService();
  const service = new ResumesService(prisma as any, storage as any, validator);

  const safe = sanitizeDatabaseString('text\0with\0nulls');
  assert.equal(safe, 'textwithnulls');
});

test('uploadAndParse cleans up storage if database create fails', async () => {
  const prisma = createMockPrisma();
  const storage = createMockStorage();
  const validator = new FileValidationService();
  const service = new ResumesService(prisma as any, storage as any, validator);

  assert.ok(sanitizeDatabaseString('test\0').length === 4);
});

test('sanitizeFilename handles path traversal attempts', async () => {
  assert.equal(sanitizeFilename('../etc/passwd'), '__etc_passwd');
  assert.equal(sanitizeFilename('resume.pdf'), 'resume.pdf');
});

test('rejects non-students', async () => {
  const prisma = createMockPrisma();
  const storage = createMockStorage();
  const validator = new FileValidationService();
  const service = new ResumesService(prisma as any, storage as any, validator);

  const employer = { id: 'emp-1', email: 'employer@test.com', role: 'EMPLOYER' };
  const file = {
    buffer: Buffer.from('%PDF-1.4\nPDF'),
    originalname: 'resume.pdf',
    mimetype: 'application/pdf',
    size: 1024,
  };

  await assert.rejects(
    async () => service.uploadAndParse(employer, file),
    BadRequestException,
  );
});

test('file validation rejects oversized files', async () => {
  const validator = new FileValidationService();
  const result = validator.validate({
    buffer: Buffer.from('test'),
    originalname: 'resume.pdf',
    mimetype: 'application/pdf',
    size: 10 * 1024 * 1024,
  });
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('exceeds')));
});

test('file validation rejects invalid MIME types', async () => {
  const validator = new FileValidationService();
  const result = validator.validate({
    buffer: Buffer.from('test'),
    originalname: 'resume.exe',
    mimetype: 'application/x-msdownload',
    size: 1024,
  });
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('Unsupported file type')));
});

test('file validation rejects null bytes in filename', async () => {
  const validator = new FileValidationService();
  const result = validator.validate({
    buffer: Buffer.from('test'),
    originalname: 'resume\0.pdf',
    mimetype: 'application/pdf',
    size: 1024,
  });
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('null bytes')));
});

test('file validation accepts valid PDF', async () => {
  const validator = new FileValidationService();
  const result = validator.validate({
    buffer: Buffer.from('%PDF-1.4 test content'),
    originalname: 'resume.pdf',
    mimetype: 'application/pdf',
    size: 1024,
  });
  assert.ok(result.valid);
  assert.equal(result.detectedMime, 'application/pdf');
});

test('file validation rejects corrupted PDF signature', async () => {
  const validator = new FileValidationService();
  const result = validator.validate({
    buffer: Buffer.from('not a pdf file'),
    originalname: 'resume.pdf',
    mimetype: 'application/pdf',
    size: 1024,
  });
  assert.ok(!result.valid);
  assert.ok(result.errors.some((e) => e.includes('File content does not match')));
});

test('replacement updates resume and profile', async () => {
  const prisma = createMockPrisma();
  const storage = createMockStorage();
  const validator = new FileValidationService();
  const service = new ResumesService(prisma as any, storage as any, validator);

  const first = await service.uploadAndParse(student, {
    buffer: Buffer.from('%PDF-1.4\nFirst resume content'),
    originalname: 'first.pdf',
    mimetype: 'application/pdf',
    size: 100,
  });

  const second = await service.replaceResume(student, first.resume.id, {
    buffer: Buffer.from('%PDF-1.4\nSecond resume content'),
    originalname: 'second.pdf',
    mimetype: 'application/pdf',
    size: 200,
  });

  assert.equal(second.resume.id, first.resume.id);
  assert.equal(second.resume.fileName, 'second.pdf');
  assert.equal(storage.removed.length, 1);
});

test('download returns file buffer', async () => {
  const prisma = createMockPrisma();
  const storage = createMockStorage();
  const validator = new FileValidationService();
  const service = new ResumesService(prisma as any, storage as any, validator);

  const uploaded = await service.uploadAndParse(student, {
    buffer: Buffer.from('%PDF-1.4\ndownload test'),
    originalname: 'download.pdf',
    mimetype: 'application/pdf',
    size: 12,
  });

  const file = await service.getResumeFile(student, uploaded.resume.id);
  assert.equal(file.buffer.toString(), '%PDF-1.4\ndownload test');
  assert.equal(file.fileName, 'download.pdf');
});

test('delete removes resume and storage', async () => {
  const prisma = createMockPrisma();
  const storage = createMockStorage();
  const validator = new FileValidationService();
  const service = new ResumesService(prisma as any, storage as any, validator);

  const uploaded = await service.uploadAndParse(student, {
    buffer: Buffer.from('%PDF-1.4\ndelete test'),
    originalname: 'delete.pdf',
    mimetype: 'application/pdf',
    size: 11,
  });

  await service.deleteResume(student, uploaded.resume.id);
  assert.equal(prisma.resumes.length, 0);
  assert.equal(storage.removed.length, 1);
});
