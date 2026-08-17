export type ParsedResume = {
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  focus: string;
  summary: string;
  address: string | null;
  education: string | null;
  experience: string | null;
  projects: string | null;
};

export type UploadedFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};
