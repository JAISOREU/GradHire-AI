import type { FeedPost } from '../types';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const ago = (ms: number): string => new Date(Date.now() - ms).toISOString();

const IMG = (label: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="100%" height="100%" fill="#1e293b"/><text x="50%" y="50%" fill="#94a3b8" font-family="sans-serif" font-size="28" text-anchor="middle">${label}</text></svg>`,
  )}`;

export const SEED_POSTS: FeedPost[] = [
  {
    id: 'seed-1',
    author: { id: 'u-1', name: 'Amara Okafor', title: 'Talent Partner at Nova Labs', verified: true },
    content: 'We just opened 12 new graduate roles at Nova Labs — full-stack, data, and product engineering. Strong emphasis on mentorship and structured onboarding. Applications close Friday. Good luck, grads!',
    createdAt: ago(6 * MIN),
    job: { title: 'Graduate Software Engineer', company: 'Nova Labs', location: 'Remote — EMEA', matchScore: 91 },
    likes: 84,
    comments: 12,
    shares: 19,
  },
  {
    id: 'seed-2',
    author: { id: 'u-2', name: 'Diego Marin', title: 'Backend Engineer · ex-Fintech', verified: false },
    content: 'A practical tip that took me too long to learn: your cover letter should answer three questions — what you built, at what scale, and how you verified it worked. Everything else is noise.',
    createdAt: ago(1 * HOUR),
    likes: 142,
    comments: 37,
    shares: 54,
  },
  {
    id: 'seed-3',
    author: { id: 'u-3', name: 'Priya Raghavan', title: 'Career Coach · 500+ hires advised', verified: true },
    content: 'Interview prep thread: here is the one-page framework I give every student before a system-design round. Practice the template, not the memorized answers.',
    createdAt: ago(3 * HOUR),
    image: IMG('System Design Cheat Sheet'),
    likes: 96,
    comments: 23,
    shares: 41,
  },
  {
    id: 'seed-4',
    author: { id: 'u-4', name: 'Tomás Ferreira', title: 'Computer Science Graduate · Class of 2025', verified: false },
    content: 'Officially signed my offer letter today. 6 months, 140 applications, 9 interviews, 1 offer. Thankful for every rejection — each one sharpened the next attempt. You can do it too.',
    createdAt: ago(8 * HOUR),
    likes: 312,
    comments: 88,
    shares: 25,
  },
  {
    id: 'seed-5',
    author: { id: 'u-5', name: 'Nova Labs', title: 'Company · Software & AI', verified: true },
    content: 'What we actually score in a take-home: clean structure, tests on the unhappy path, and a short README explaining trade-offs. Perfect code is not the bar — thoughtful engineering is.',
    createdAt: ago(1 * DAY),
    likes: 67,
    comments: 9,
    shares: 13,
  },
  {
    id: 'seed-6',
    author: { id: 'u-6', name: 'Sana Khalid', title: 'Product Manager · Grad cohort mentor', verified: true },
    content: 'Reminder for everyone entering the job market: you are also interviewing the company. Ask about onboarding, review culture, and who your manager really is. Fit beats prestige.',
    createdAt: ago(2 * DAY),
    likes: 154,
    comments: 41,
    shares: 60,
  },
];