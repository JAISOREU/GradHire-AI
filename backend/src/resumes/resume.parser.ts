import type { ParsedResume, UploadedFile } from './resume.types';

const SKILLS_LIST = [
  'TypeScript',
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'Go',
  'SQL',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Git',
  'REST',
  'GraphQL',
  'Machine Learning',
  'TensorFlow',
  'PyTorch',
  'Data Analysis',
  'Tableau',
  'Figma',
  'UX Research',
  'Product Design',
  'Agile',
  'Scrum',
  'HTML',
  'CSS',
];

const FOCUS_KEYWORDS: Array<{ focus: string; keywords: string[] }> = [
  {
    focus: 'Data analytics and dashboards',
    keywords: ['data', 'analytics', 'sql', 'tableau', 'dashboard', 'bi', 'excel'],
  },
  {
    focus: 'AI and machine learning',
    keywords: ['machine learning', 'ai', 'tensorflow', 'pytorch', 'nlp', 'deep learning', 'llm', 'model'],
  },
  {
    focus: 'Product design and UX research',
    keywords: ['design', 'product', 'figma', 'ux', 'ui', 'research'],
  },
  {
    focus: 'Full-stack development and software engineering',
    keywords: ['full-stack', 'full stack', 'react', 'node', 'typescript', 'javascript', 'frontend', 'backend', 'software'],
  },
];

export function extractEmail(text: string): string | null {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase() : null;
}

export function extractPhone(text: string): string | null {
  const match = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return match ? match[0] : null;
}

export function extractName(text: string): string | null {
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    // Skip lines that look like emails, phones, URLs, or section headers
    if (/@|https?:\/\/|www\.|^\+?\d|^#/.test(line)) continue;
    // Match "First Last" style names (2+ capitalized words)
    if (/^[A-Z][a-zA-Z'-]+(\s+[A-Z][a-zA-Z'-]+)+$/.test(line)) {
      return line.slice(0, 80);
    }
  }
  return null;
}

export function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  return SKILLS_LIST.filter((skill) => lower.includes(skill.toLowerCase()));
}

export function inferFocus(text: string): string {
  const lower = text.toLowerCase();
  let best = { focus: 'Software engineering', count: 0 };
  for (const entry of FOCUS_KEYWORDS) {
    const count = entry.keywords.reduce((acc, kw) => (lower.includes(kw) ? acc + 1 : acc), 0);
    if (count > best.count) best = { focus: entry.focus, count };
  }
  return best.focus;
}

export function parseResumeText(text: string): ParsedResume {
  const name = extractName(text);
  const email = extractEmail(text);
  const phone = extractPhone(text);
  const skills = extractSkills(text);
  const focus = inferFocus(text);

  const summary = [
    name ? `Candidate ${name}.` : 'Candidate profile.',
    `Primary focus: ${focus}.`,
    skills.length > 0 ? `Top skills: ${skills.slice(0, 8).join(', ')}.` : 'Skills not detected.',
  ].join(' ');

  return { name, email, phone, skills, focus, summary };
}

/**
 * Extracts raw text from an uploaded file buffer.
 * - PDF -> pdf-parse
 * - DOCX -> mammoth
 * - Everything else -> utf-8 text
 * Falls back to utf-8 text if a parsing library is unavailable or fails.
 */
export async function extractTextFromFile(file: UploadedFile): Promise<string> {
  const mime = (file.mimetype ?? '').toLowerCase();
  const name = file.originalname.toLowerCase();

  try {
    if (mime === 'application/pdf' || name.endsWith('.pdf')) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(file.buffer);
      return String(result?.text ?? '');
    }

    if (
      mime.includes('word') ||
      mime.includes('officedocument') ||
      name.endsWith('.doc') ||
      name.endsWith('.docx')
    ) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return String(result?.value ?? '');
    }

    return file.buffer.toString('utf-8');
  } catch {
    return file.buffer.toString('utf-8');
  }
}

