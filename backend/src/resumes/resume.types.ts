export type ParsedResume = {
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  focus: string;
  summary: string;
};

/**
 * Slice of an Express.Multer.File we depend on.
 * Defined locally so we don't need @types/multer for parsing logic.
 */
export type UploadedFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

