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
    if (/@|https?:\/\/|www\.|^\+?\d|^#/.test(line)) continue;
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

export function extractAddress(text: string): string | null {
  const addressPatterns = [
    /(?:address|location|addr)[:\s]+([^\n]+)/i,
    /\d+\s+[A-Za-z0-0\s]+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Ln|Lane|Dr|Drive|Way|Court|Ct)[^\n]*/i,
    /(?:suite|apt|unit|floor|fl)[^\n]*/i,
  ];

  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 10 || trimmed.length > 200) continue;
    for (const pattern of addressPatterns) {
      const match = trimmed.match(pattern);
      if (match && match[0].length > 5) {
        return trimmed.slice(0, 200);
      }
    }
  }

  return null;
}

export function extractEducation(text: string): string | null {
  const educationKeywords = [
    'bachelor', 'master', 'phd', 'doctorate', 'associate', 'diploma', 'degree',
    'b.s.', 'b.a.', 'm.s.', 'm.a.', 'mba', 'bs', 'ba', 'ms', 'ma',
    'university', 'college', 'institute', 'school', 'faculty',
    'graduated', 'graduation', 'gpa', 'cum laude', 'honors',
  ];

  const lines = text.split(/\r?\n/);
  const educationLines: string[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (educationKeywords.some((kw) => lower.includes(kw))) {
      educationLines.push(line.trim());
    }
  }

  if (educationLines.length === 0) return null;
  return educationLines.slice(0, 5).join('; ');
}

export function extractExperience(text: string): string | null {
  const lines = text.split(/\r?\n/);
  const experienceLines: string[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('experience') || lower.includes('work history') || lower.includes('employment')) {
      const afterHeader = line.replace(/^.*?(experience|work history|employment)[:\s]*/i, '').trim();
      if (afterHeader) {
        experienceLines.push(afterHeader);
      }
      continue;
    }
    if (experienceLines.length > 0 && (lower.includes('education') || lower.includes('skills') || lower.includes('project'))) {
      continue;
    }
    if (experienceLines.length > 0 && line.trim()) {
      experienceLines.push(line.trim());
    }
  }

  if (experienceLines.length === 0) return null;
  return experienceLines.slice(0, 10).join('; ');
}

export function extractProjects(text: string): string | null {
  const lines = text.split(/\r?\n/);
  const projectLines: string[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('project')) {
      const afterHeader = line.replace(/^.*?project[s]?[:\s]*/i, '').trim();
      if (afterHeader) {
        projectLines.push(afterHeader);
      }
      continue;
    }
    if (projectLines.length > 0 && (lower.includes('experience') || lower.includes('education') || lower.includes('skills'))) {
      continue;
    }
    if (projectLines.length > 0 && line.trim()) {
      projectLines.push(line.trim());
    }
  }

  if (projectLines.length === 0) return null;
  return projectLines.slice(0, 5).join('; ');
}

export function parseResumeText(text: string): ParsedResume {
  const name = extractName(text);
  const email = extractEmail(text);
  const phone = extractPhone(text);
  const skills = extractSkills(text);
  const focus = inferFocus(text);
  const address = extractAddress(text);
  const education = extractEducation(text);
  const experience = extractExperience(text);
  const projects = extractProjects(text);

  const summaryParts = [
    name ? `Candidate ${name}.` : 'Candidate profile.',
    `Primary focus: ${focus}.`,
    address ? `Location: ${address}.` : '',
    skills.length > 0 ? `Top skills: ${skills.slice(0, 8).join(', ')}.` : 'Skills not detected.',
    education ? `Education: ${education}.` : '',
  ].filter(Boolean);

  const summary = summaryParts.join(' ');

  return {
    name,
    email,
    phone,
    skills,
    focus,
    summary,
    address,
    education,
    experience,
    projects,
  };
}

export async function extractTextFromFile(file: UploadedFile): Promise<string> {
  const mime = (file.mimetype ?? '').toLowerCase();
  const name = file.originalname.toLowerCase();

  try {
    if (mime === 'application/pdf' || name.endsWith('.pdf')) {
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
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return String(result?.value ?? '');
    }

    return file.buffer.toString('utf-8');
  } catch {
    return file.buffer.toString('utf-8');
  }
}
