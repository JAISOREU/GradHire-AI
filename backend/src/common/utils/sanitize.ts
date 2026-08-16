export function sanitizeDatabaseString(value: unknown): string {
  if (value == null) {
    return '';
  }

  if (typeof value !== 'string') {
    const coerced = String(value);
    return sanitizeDatabaseString(coerced);
  }

  return value
    .replace(/\0/g, '')
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

export function sanitizeFilename(originalname: string): string {
  const withoutNulls = originalname.replace(/\0/g, '');
  const sanitized = withoutNulls.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.{2,}/g, '_');
  return sanitized || 'resume';
}
