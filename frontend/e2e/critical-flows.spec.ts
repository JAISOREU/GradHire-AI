import { test, expect } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3000/api/v1';
const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function registerUser(request: any, role: 'STUDENT' | 'EMPLOYER' = 'STUDENT') {
  const email = `e2e-${unique()}-${role.toLowerCase()}@example.com`;
  const res = await request.post(`${API_BASE}/auth/register`, {
    data: { email, password: 'SecurePass1!', name: `E2E ${role}`, role },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.accessToken).toBeDefined();
  return { token: body.accessToken, user: body.user };
}

async function authRequest(request: any, token: string) {
  return request.post(`${API_BASE}/auth/login`, {
    data: { email: `e2e-${unique()}-student@example.com`, password: 'SecurePass1!' },
  });
}

test.describe('Critical E2E flows', () => {
  test('register -> login -> get profile', async ({ request }) => {
    const email = `e2e-${unique()}-student@example.com`;
    const regRes = await request.post(`${API_BASE}/auth/register`, {
      data: { email, password: 'SecurePass1!', name: 'E2E Student', role: 'STUDENT' },
    });
    expect(regRes.ok()).toBeTruthy();
    const regBody = await regRes.json();
    expect(regBody.accessToken).toBeDefined();
    expect(regBody.user.email).toBe(email);

    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email, password: 'SecurePass1!' },
    });
    expect(loginRes.ok()).toBeTruthy();
    const loginBody = await loginRes.json();
    expect(loginBody.accessToken).toBeDefined();

    const profileRes = await request.get(`${API_BASE}/students/me`, {
      headers: { Authorization: `Bearer ${loginBody.accessToken}` },
    });
    expect(profileRes.ok()).toBeTruthy();
    const profile = await profileRes.json();
    expect(profile.name).toBe('E2E Student');
  });

  test('create job -> apply -> get applications', async ({ request }) => {
    const employer = await registerUser(request, 'EMPLOYER');
    const createRes = await request.post(`${API_BASE}/employer/jobs`, {
      headers: { Authorization: `Bearer ${employer.token}` },
      data: { title: 'E2E Test Job', company: 'TestCorp', location: 'Remote', type: 'HIRING', description: 'Test job for E2E' },
    });
    expect(createRes.ok()).toBeTruthy();
    const job = await createRes.json();
    expect(job.title).toBe('E2E Test Job');

    const student = await registerUser(request, 'STUDENT');
    const applyRes = await request.post(`${API_BASE}/applications`, {
      headers: { Authorization: `Bearer ${student.token}` },
      data: { jobId: job.id },
    });
    expect(applyRes.ok()).toBeTruthy();
    const application = await applyRes.json();
    expect(application.status).toBe('APPLIED');

    const appsRes = await request.get(`${API_BASE}/applications/me`, {
      headers: { Authorization: `Bearer ${student.token}` },
    });
    expect(appsRes.ok()).toBeTruthy();
    const apps = await appsRes.json();
    expect(apps.items.some((a: any) => a.jobId === job.id)).toBe(true);
  });

  test('upload resume -> parse -> update profile', async ({ request }) => {
    const student = await registerUser(request, 'STUDENT');
    const resumeText = `John Doe
john@example.com
+1-555-0199

Skills: React, TypeScript, Node.js, PostgreSQL, Docker
Experience: Software Engineer at TechCorp
Education: BS Computer Science`;

    const form = new FormData();
    form.append('file', new Blob([resumeText], { type: 'text/plain' }), 'resume.txt');

    const uploadRes = await request.post(`${API_BASE}/resumes`, {
      headers: {
        Authorization: `Bearer ${student.token}`,
      },
      multipart: form,
    });
    expect(uploadRes.ok()).toBeTruthy();
    const uploadBody = await uploadRes.json();
    expect(uploadBody.resume.fileName).toBe('resume.txt');
    expect(uploadBody.profile.skills.length).toBeGreaterThan(0);
  });

  test('send message -> check notifications', async ({ request }) => {
    const sender = await registerUser(request, 'STUDENT');
    const recipient = await registerUser(request, 'EMPLOYER');

    const msgRes = await request.post(`${API_BASE}/messages`, {
      headers: { Authorization: `Bearer ${sender.token}` },
      data: { to: recipient.user.id, body: 'Hello from E2E test' },
    });
    expect(msgRes.ok()).toBeTruthy();
    const msg = await msgRes.json();
    expect(msg.body).toBe('Hello from E2E test');

    const notifRes = await request.get(`${API_BASE}/notifications/me`, {
      headers: { Authorization: `Bearer ${recipient.token}` },
    });
    expect(notifRes.ok()).toBeTruthy();
    const notifs = await notifRes.json();
    expect(notifs.items.length).toBeGreaterThan(0);
  });

  test('get AI recommendations', async ({ request }) => {
    const student = await registerUser(request, 'STUDENT');
    const profileRes = await request.get(`${API_BASE}/students/me`, {
      headers: { Authorization: `Bearer ${student.token}` },
    });
    const profile = await profileRes.json();

    const recRes = await request.get(`${API_BASE}/recommendations/ai?top_k=3`, {
      headers: { Authorization: `Bearer ${student.token}` },
    });
    expect(recRes.ok()).toBeTruthy();
    const recs = await recRes.json();
    expect(Array.isArray(recs)).toBe(true);
    expect(recs.length).toBeLessThanOrEqual(3);
  });
});
