import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jobsApi } from './jobs';
import { clearRequestCache } from '../client';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

function mockResponse(data: unknown, overrides: Partial<Response> = {}): Response {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
    headers: new Headers(),
    ...overrides,
  } as unknown as Response;
}

describe('jobsApi.listPaginated new filters', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'XSRF-TOKEN=test-csrf-token; path=/';
    vi.resetAllMocks();
    clearRequestCache();
  });

  it('appends each skill as a repeated skills query param when filters.skills is provided', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue(
      mockResponse({ items: [], total: 0, page: 1, limit: 20 }),
    );

    await jobsApi.listPaginated({ skills: ['React', 'Node.js'], page: 1, limit: 20 } as never);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/jobs?'),
      expect.anything(),
    );
    const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(url).toContain('skills=React');
    expect(url).toContain('skills=Node.js');
  });

  it('sets datePosted when filters.datePosted is provided', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue(
      mockResponse({ items: [], total: 0, page: 1, limit: 20 }),
    );

    await jobsApi.listPaginated({ datePosted: '7d', page: 1, limit: 20 } as never);

    const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(url).toContain('datePosted=7d');
  });

  it('omits skills and datePosted when not provided', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue(
      mockResponse({ items: [], total: 0, page: 1, limit: 20 }),
    );

    await jobsApi.listPaginated({ page: 1, limit: 20 });

    const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(url).not.toContain('skills=');
    expect(url).not.toContain('datePosted=');
  });
});

describe('jobsApi.listSkillOptions', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'XSRF-TOKEN=test-csrf-token; path=/';
    vi.resetAllMocks();
    clearRequestCache();
  });

  it('returns the skills array from GET /api/v1/jobs/skills', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue(
      mockResponse({ skills: ['React', 'TypeScript', 'Python'] }),
    );

    const skills = await jobsApi.listSkillOptions();

    expect(fetch).toHaveBeenCalledWith(
      API_BASE ? `${API_BASE}/api/v1/jobs/skills` : '/api/v1/jobs/skills',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(skills).toEqual(['React', 'TypeScript', 'Python']);
  });

  it('returns an empty array when the response has no skills field', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue(
      mockResponse({}),
    );

    const skills = await jobsApi.listSkillOptions();

    expect(skills).toEqual([]);
  });
});

describe('jobsApi.getMarketSnapshot', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'XSRF-TOKEN=test-csrf-token; path=/';
    vi.resetAllMocks();
    clearRequestCache();
  });

  it('returns byType counts from GET /api/v1/jobs/market-snapshot', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue(
      mockResponse({ byType: [{ type: 'HIRING', count: 12 }, { type: 'INTERNSHIP', count: 4 }] }),
    );

    const snapshot = await jobsApi.getMarketSnapshot();

    expect(fetch).toHaveBeenCalledWith(
      API_BASE ? `${API_BASE}/api/v1/jobs/market-snapshot` : '/api/v1/jobs/market-snapshot',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(snapshot.byType).toEqual([
      { type: 'HIRING', count: 12 },
      { type: 'INTERNSHIP', count: 4 },
    ]);
  });

  it('defaults byType to an empty array when the field is missing', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue(
      mockResponse({}),
    );

    const snapshot = await jobsApi.getMarketSnapshot();

    expect(snapshot.byType).toEqual([]);
  });
});