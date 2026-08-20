/**
 * GradTure — End-to-End Workflow QA Test Suite
 * Tests complete real-world workflows against the running API.
 */

const BASE_URL = 'http://localhost:3001/api/v1';

let talentToken = '';
let employerToken = '';
let adminToken = '';
let talentUserId = '';
let employerUserId = '';
let adminUserId = '';
let testEmployerJobId = '';
let testBrowsedJobId = '';
let testApplicationId = '';
let testSavedJobId = '';
let testInterviewId = '';
let testCompanyId = '';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(status: string, message: string) {
  const symbol = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '→';
  const color = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.blue;
  console.log(`${color}${symbol} ${message}${colors.reset}`);
}

let csrfToken = '';

async function api(path: string, options: { method?: string; body?: unknown; headers?: Record<string, string>; requiresAuth?: boolean; token?: string } = {}) {
  const { method = 'GET', body, headers = {}, requiresAuth = true, token } = options;
  
  const fetchHeaders: Record<string, string> = { 'Content-Type': 'application/json', ...headers };
  
  if (requiresAuth && token) {
    fetchHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
    if (csrfToken) {
      fetchHeaders['X-XSRF-TOKEN'] = csrfToken;
    }
  }
  
  const res = await fetch(`${BASE_URL}${path}`, {
    method: method as RequestInit['method'],
    headers: fetchHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  
  const csrfHeader = res.headers.get('X-CSRF-TOKEN');
  if (csrfHeader) {
    csrfToken = csrfHeader;
  }
  
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function getCsrfToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/csrf-token`, { method: 'GET', credentials: 'include' });
  const csrfHeader = res.headers.get('X-CSRF-TOKEN');
  if (csrfHeader) {
    csrfToken = csrfHeader;
    return csrfHeader;
  }
  return '';
}

function isoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ============================================================
// TALENT WORKFLOW
// ============================================================

async function testTalentWorkflow() {
  log('info', '\n========================================');
  log('info', 'TALENT WORKFLOW');
  log('info', '========================================\n');

  await getCsrfToken();

  // 1. Register
  log('info', 'Step 1: Register talent account');
  const registerRes = await api('/auth/register', {
    method: 'POST',
    requiresAuth: false,
    body: {
      email: `talent-${Date.now()}@test.com`,
      password: 'Test1234!',
      role: 'STUDENT',
    },
  });
  
  if (registerRes.status === 201 || registerRes.status === 200) {
    log('PASS', `Register talent: ${registerRes.status}`);
    talentToken = (registerRes.data as any)?.accessToken || (registerRes.data as any)?.token;
    talentUserId = (registerRes.data as any)?.user?.id || (registerRes.data as any)?.id;
  } else {
    log('FAIL', `Register talent failed: ${registerRes.status} - ${JSON.stringify(registerRes.data)}`);
    throw new Error('Talent registration failed');
  }

  // 2. Login
  log('info', 'Step 2: Login talent');
  await getCsrfToken();
  const loginRes = await api('/auth/login', {
    method: 'POST',
    requiresAuth: false,
    body: {
      email: (registerRes.data as any)?.user?.email || `talent-${Date.now()}@test.com`,
      password: 'Test1234!',
    },
  });
  
  if (loginRes.status === 200) {
    log('PASS', `Login talent: ${loginRes.status}`);
    talentToken = (loginRes.data as any)?.accessToken || talentToken;
    talentUserId = (loginRes.data as any)?.user?.id || talentUserId;
  } else {
    log('FAIL', `Login talent failed: ${loginRes.status} - ${JSON.stringify(loginRes.data)}`);
  }

  // 3. Complete profile
  log('info', 'Step 3: Complete talent profile');
  await getCsrfToken();
  const profileRes = await api('/students/me', {
    method: 'PUT',
    token: talentToken,
    body: {
      name: 'Test Talent',
      focus: 'Software Engineering',
      summary: 'Passionate developer',
      phone: '+1234567890',
      location: 'Manila, Philippines',
      skills: ['JavaScript', 'React', 'Node.js'],
      education: 'BS Computer Science',
      experience: '2 years at TechCorp',
    },
  });
  
  if (profileRes.status === 200) {
    log('PASS', `Update profile: ${profileRes.status}`);
  } else {
    log('FAIL', `Update profile failed: ${profileRes.status} - ${JSON.stringify(profileRes.data)}`);
  }

  // 4. Upload resume
  log('info', 'Step 4: Upload resume');
  const resumesRes = await api('/resumes/me', { token: talentToken, requiresAuth: true });
  if (resumesRes.status === 200) {
    log('PASS', `List resumes endpoint works: ${resumesRes.status}`);
  } else {
    log('FAIL', `List resumes failed: ${resumesRes.status} - ${JSON.stringify(resumesRes.data)}`);
  }

  // 5. Browse jobs
  log('info', 'Step 5: Browse jobs');
  const jobsRes = await api('/jobs', { requiresAuth: false });
  if (jobsRes.status === 200) {
    log('PASS', `Browse jobs: ${jobsRes.status}, found ${(jobsRes.data as any)?.items?.length || 0} jobs`);
  } else {
    log('FAIL', `Browse jobs failed: ${jobsRes.status} - ${JSON.stringify(jobsRes.data)}`);
  }

  // 6. Search/filter jobs
  log('info', 'Step 6: Search/filter jobs');
  const searchRes = await api('/jobs?type=HIRING&page=1&limit=5', { requiresAuth: false });
  if (searchRes.status === 200) {
    log('PASS', `Search jobs: ${searchRes.status}`);
  } else {
    log('FAIL', `Search jobs failed: ${searchRes.status} - ${JSON.stringify(searchRes.data)}`);
  }

  // 7. Open job detail
  log('info', 'Step 7: Open job detail');
  const jobId = (jobsRes.data as any)?.items?.[0]?.id;
  if (jobId) {
    const detailRes = await api(`/jobs/${jobId}`, { requiresAuth: false });
    if (detailRes.status === 200) {
      log('PASS', `Job detail: ${detailRes.status}`);
      testBrowsedJobId = jobId;
    } else {
      log('FAIL', `Job detail failed: ${detailRes.status} - ${JSON.stringify(detailRes.data)}`);
    }
  } else {
    log('FAIL', 'No job ID available for detail view (no jobs in database)');
  }

  // 8. Save job
  log('info', 'Step 8: Save job');
  if (testBrowsedJobId) {
    await getCsrfToken();
    const saveRes = await api('/saved-jobs', {
      method: 'POST',
      token: talentToken,
      body: { jobId: testBrowsedJobId },
    });
    if (saveRes.status === 201 || saveRes.status === 200) {
      log('PASS', `Save job: ${saveRes.status}`);
      testSavedJobId = (saveRes.data as any)?.id;
    } else {
      log('FAIL', `Save job failed: ${saveRes.status} - ${JSON.stringify(saveRes.data)}`);
    }
  } else {
    log('FAIL', 'Skip save job - no job ID');
  }

  // 9. Apply to job
  log('info', 'Step 9: Apply to job');
  if (testBrowsedJobId) {
    await getCsrfToken();
    const applyRes = await api('/applications', {
      method: 'POST',
      token: talentToken,
      body: { jobId: testBrowsedJobId, coverLetter: 'I am interested in this position.' },
    });
    if (applyRes.status === 201 || applyRes.status === 200) {
      log('PASS', `Apply to job: ${applyRes.status}`);
      testApplicationId = (applyRes.data as any)?.id;
    } else {
      log('FAIL', `Apply to job failed: ${applyRes.status} - ${JSON.stringify(applyRes.data)}`);
    }
  } else {
    log('FAIL', 'Skip apply - no job ID');
  }

  // 10. Track application
  log('info', 'Step 10: Track applications');
  const myAppsRes = await api('/applications/me', { token: talentToken });
  if (myAppsRes.status === 200) {
    log('PASS', `My applications: ${myAppsRes.status}, count: ${(myAppsRes.data as any)?.items?.length || 0}`);
  } else {
    log('FAIL', `My applications failed: ${myAppsRes.status} - ${JSON.stringify(myAppsRes.data)}`);
  }

  // 11. Check saved jobs
  log('info', 'Step 11: Check saved jobs');
  const savedRes = await api('/saved-jobs/me', { token: talentToken });
  if (savedRes.status === 200) {
    log('PASS', `Saved jobs: ${savedRes.status}, count: ${(savedRes.data as any)?.items?.length || 0}`);
  } else {
    log('FAIL', `Saved jobs failed: ${savedRes.status} - ${JSON.stringify(savedRes.data)}`);
  }

  // 12. Get recommendations
  log('info', 'Step 12: Get recommendations');
  const recsRes = await api('/recommendations/ai?top_k=5', { token: talentToken });
  if (recsRes.status === 200) {
    log('PASS', `recommendations: ${recsRes.status}, ready: ${(recsRes.data as any)?.ready}`);
  } else {
    log('FAIL', `recommendations failed: ${recsRes.status} - ${JSON.stringify(recsRes.data)}`);
  }

  // 13. Add education
  log('info', 'Step 13: Add education');
  await getCsrfToken();
  const eduRes = await api('/profile/education', {
    method: 'POST',
    token: talentToken,
    body: {
      institution: 'Test University',
      degree: 'BS Computer Science',
      fieldOfStudy: 'Computer Science',
      startDate: isoDate(new Date('2020-01-01')),
      endDate: isoDate(new Date('2024-01-01')),
      currentlyStudying: false,
    },
  });
  if (eduRes.status === 201 || eduRes.status === 200) {
    log('PASS', `Add education: ${eduRes.status}`);
  } else {
    log('FAIL', `Add education failed: ${eduRes.status} - ${JSON.stringify(eduRes.data)}`);
  }

  // 14. Add skill
  log('info', 'Step 14: Add skill');
  await getCsrfToken();
  const skillRes = await api('/profile/skills', {
    method: 'POST',
    token: talentToken,
    body: { name: 'Python', category: 'Programming', level: 'INTERMEDIATE' },
  });
  if (skillRes.status === 201 || skillRes.status === 200) {
    log('PASS', `Add skill: ${skillRes.status}`);
  } else {
    log('FAIL', `Add skill failed: ${skillRes.status} - ${JSON.stringify(skillRes.data)}`);
  }

  // 15. Add experience
  log('info', 'Step 15: Add experience');
  await getCsrfToken();
  const expRes = await api('/profile/experience', {
    method: 'POST',
    token: talentToken,
    body: {
      jobTitle: 'Software Engineer',
      company: 'TechCorp',
      employmentType: 'FULL_TIME',
      location: 'Manila',
      startDate: isoDate(new Date('2022-01-01')),
      currentlyWorking: true,
    },
  });
  if (expRes.status === 201 || expRes.status === 200) {
    log('PASS', `Add experience: ${expRes.status}`);
  } else {
    log('FAIL', `Add experience failed: ${expRes.status} - ${JSON.stringify(expRes.data)}`);
  }

  // 16. Add career preference
  log('info', 'Step 16: Add career preference');
  await getCsrfToken();
  const prefRes = await api('/profile/preferences', {
    method: 'PUT',
    token: talentToken,
    body: {
      preferredJobTitles: ['Software Engineer', 'Full-Stack Developer'],
      industries: ['Technology'],
      preferredLocations: ['Manila', 'Remote'],
      workArrangement: 'FULL_TIME',
    },
  });
  if (prefRes.status === 200) {
    log('PASS', `Add career preference: ${prefRes.status}`);
  } else {
    log('FAIL', `Add career preference failed: ${prefRes.status} - ${JSON.stringify(prefRes.data)}`);
  }
}

// ============================================================
// EMPLOYER WORKFLOW
// ============================================================

async function testEmployerWorkflow() {
  log('info', '\n========================================');
  log('info', 'EMPLOYER WORKFLOW');
  log('info', '========================================\n');

  // 1. Register
  log('info', 'Step 1: Register employer account');
  await getCsrfToken();
  const registerRes = await api('/auth/register', {
    method: 'POST',
    requiresAuth: false,
    body: {
      email: `employer-${Date.now()}@test.com`,
      password: 'Test1234!',
      role: 'EMPLOYER',
    },
  });
  
  if (registerRes.status === 201 || registerRes.status === 200) {
    log('PASS', `Register employer: ${registerRes.status}`);
    employerToken = (registerRes.data as any)?.accessToken || (registerRes.data as any)?.token;
    employerUserId = (registerRes.data as any)?.user?.id || (registerRes.data as any)?.id;
  } else {
    log('FAIL', `Register employer failed: ${registerRes.status} - ${JSON.stringify(registerRes.data)}`);
    throw new Error('Employer registration failed');
  }

  // 2. Login
  log('info', 'Step 2: Login employer');
  await getCsrfToken();
  const loginRes = await api('/auth/login', {
    method: 'POST',
    requiresAuth: false,
    body: {
      email: (registerRes.data as any)?.user?.email || `employer-${Date.now()}@test.com`,
      password: 'Test1234!',
    },
  });
  
  if (loginRes.status === 200) {
    log('PASS', `Login employer: ${loginRes.status}`);
    employerToken = (loginRes.data as any)?.accessToken || employerToken;
    employerUserId = (loginRes.data as any)?.user?.id || employerUserId;
  } else {
    log('FAIL', `Login employer failed: ${loginRes.status} - ${JSON.stringify(loginRes.data)}`);
  }

  // 3. Complete company profile
  log('info', 'Step 3: Complete company profile');
  await getCsrfToken();
  const profileRes = await api('/employer/profile', {
    method: 'PUT',
    token: employerToken,
    body: {
      companyName: 'Test Corp',
      industry: 'Technology',
      location: 'Manila, Philippines',
      description: 'A great company to work for.',
      website: 'https://testcorp.com',
      phone: '+1234567890',
    },
  });
  
  if (profileRes.status === 200) {
    log('PASS', `Update company profile: ${profileRes.status}`);
  } else {
    log('FAIL', `Update company profile failed: ${profileRes.status} - ${JSON.stringify(profileRes.data)}`);
  }

  // 4. Create job
  log('info', 'Step 4: Create job');
  await getCsrfToken();
  const createJobRes = await api('/employer/jobs', {
    method: 'POST',
    token: employerToken,
    body: {
      title: 'Senior Software Engineer',
      company: 'Test Corp',
      type: 'HIRING',
      experienceLevel: 'MID_LEVEL',
      positions: 2,
      description: 'We are looking for a senior software engineer.',
      responsibilities: 'Develop and maintain web applications.',
      requiredQualifications: 'BS in Computer Science or related field.',
      preferredQualifications: 'Experience with React and Node.js.',
      requiredSkills: ['JavaScript', 'React', 'Node.js'],
      workplaceType: 'HYBRID',
      country: 'Philippines',
      region: 'Metro Manila',
      city: 'Manila',
      status: 'PUBLISHED',
    },
  });
  
  if (createJobRes.status === 201 || createJobRes.status === 200) {
    log('PASS', `Create job: ${createJobRes.status}`);
    testEmployerJobId = (createJobRes.data as any)?.id;
  } else {
    log('FAIL', `Create job failed: ${createJobRes.status} - ${JSON.stringify(createJobRes.data)}`);
  }

  // 5. View employer jobs
  log('info', 'Step 5: View employer jobs');
  const myJobsRes = await api('/employer/jobs', { token: employerToken });
  if (myJobsRes.status === 200) {
    log('PASS', `My jobs: ${myJobsRes.status}, count: ${(myJobsRes.data as any)?.items?.length || 0}`);
  } else {
    log('FAIL', `My jobs failed: ${myJobsRes.status} - ${JSON.stringify(myJobsRes.data)}`);
  }

  // 6. Get employer analytics
  log('info', 'Step 6: Get employer analytics');
  const analyticsRes = await api('/employer/analytics', { token: employerToken });
  if (analyticsRes.status === 200) {
    log('PASS', `Analytics: ${analyticsRes.status}`);
  } else {
    log('FAIL', `Analytics failed: ${analyticsRes.status} - ${JSON.stringify(analyticsRes.data)}`);
  }
}

// ============================================================
// TALENT APPLICATION TO EMPLOYER JOB
// ============================================================

async function testTalentApplyToEmployerJob() {
  log('info', '\n========================================');
  log('info', 'TALENT APPLY TO EMPLOYER JOB');
  log('info', '========================================\n');

  if (!testEmployerJobId || !talentToken) {
    log('FAIL', 'Cannot run application test - missing employer job ID or talent token');
    return;
  }

  // Apply to job
  log('info', 'Step 1: Apply to employer job');
  await getCsrfToken();
  const applyRes = await api('/applications', {
    method: 'POST',
    token: talentToken,
    body: { jobId: testEmployerJobId, coverLetter: 'I am interested in this position.' },
  });
  if (applyRes.status === 201 || applyRes.status === 200) {
    log('PASS', `Apply to job: ${applyRes.status}`);
    testApplicationId = (applyRes.data as any)?.id;
  } else {
    log('FAIL', `Apply to job failed: ${applyRes.status} - ${JSON.stringify(applyRes.data)}`);
  }

  // Track application
  log('info', 'Step 2: Track applications');
  const myAppsRes = await api('/applications/me', { token: talentToken });
  if (myAppsRes.status === 200) {
    log('PASS', `My applications: ${myAppsRes.status}, count: ${(myAppsRes.data as any)?.items?.length || 0}`);
  } else {
    log('FAIL', `My applications failed: ${myAppsRes.status} - ${JSON.stringify(myAppsRes.data)}`);
  }

  // Save job
  log('info', 'Step 3: Save job');
  await getCsrfToken();
  const saveRes = await api('/saved-jobs', {
    method: 'POST',
    token: talentToken,
    body: { jobId: testEmployerJobId },
  });
  if (saveRes.status === 201 || saveRes.status === 200) {
    log('PASS', `Save job: ${saveRes.status}`);
    testSavedJobId = (saveRes.data as any)?.id;
  } else {
    log('FAIL', `Save job failed: ${saveRes.status} - ${JSON.stringify(saveRes.data)}`);
  }

  // Check saved jobs
  log('info', 'Step 4: Check saved jobs');
  const savedRes = await api('/saved-jobs/me', { token: talentToken });
  if (savedRes.status === 200) {
    log('PASS', `Saved jobs: ${savedRes.status}, count: ${(savedRes.data as any)?.items?.length || 0}`);
  } else {
    log('FAIL', `Saved jobs failed: ${savedRes.status} - ${JSON.stringify(savedRes.data)}`);
  }
}

// ============================================================
// EMPLOYER REVIEW WORKFLOW
// ============================================================

async function testEmployerReviewWorkflow() {
  log('info', '\n========================================');
  log('info', 'EMPLOYER REVIEW WORKFLOW');
  log('info', '========================================\n');

  if (!testApplicationId || !employerToken) {
    log('FAIL', 'Cannot run review test - missing application ID or employer token');
    return;
  }

  // View applicants
  log('info', 'Step 1: View applicants');
  const applicantsRes = await api('/applications/employer/all', { token: employerToken });
  if (applicantsRes.status === 200) {
    log('PASS', `Applicants: ${applicantsRes.status}, count: ${(applicantsRes.data as any)?.items?.length || 0}`);
  } else {
    log('FAIL', `Applicants failed: ${applicantsRes.status} - ${JSON.stringify(applicantsRes.data)}`);
  }

  // Review application
  log('info', 'Step 2: Review application');
  const appDetailRes = await api(`/applications/${testApplicationId}`, { token: employerToken });
  if (appDetailRes.status === 200) {
    log('PASS', `Application detail: ${appDetailRes.status}`);
  } else {
    log('FAIL', `Application detail failed: ${appDetailRes.status} - ${JSON.stringify(appDetailRes.data)}`);
  }

  // Update application status
  log('info', 'Step 3: Update application status');
  await getCsrfToken();
  const statusRes = await api(`/applications/${testApplicationId}/status`, {
    method: 'PUT',
    token: employerToken,
    body: { status: 'UNDER_REVIEW', message: 'Reviewing your application.' },
  });
  if (statusRes.status === 200) {
    log('PASS', `Update status: ${statusRes.status}`);
  } else {
    log('FAIL', `Update status failed: ${statusRes.status} - ${JSON.stringify(statusRes.data)}`);
  }

  // Schedule interview
  log('info', 'Step 4: Schedule interview');
  await getCsrfToken();
  const interviewRes = await api('/interviews/schedule', {
    method: 'POST',
    token: employerToken,
    body: {
      applicationId: testApplicationId,
      type: 'VIDEO',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      durationMinutes: 60,
      timezone: 'Asia/Manila',
      meetingLink: 'https://meet.test.com/interview',
      interviewers: ['Hiring Manager'],
    },
  });
  if (interviewRes.status === 201 || interviewRes.status === 200) {
    log('PASS', `Schedule interview: ${interviewRes.status}`);
    testInterviewId = (interviewRes.data as any)?.id;
  } else {
    log('FAIL', `Schedule interview failed: ${interviewRes.status} - ${JSON.stringify(interviewRes.data)}`);
  }

  // Message candidate
  log('info', 'Step 5: Message candidate');
  await getCsrfToken();
  const messageRes = await api('/messages', {
    method: 'POST',
    token: employerToken,
    body: { to: talentUserId, body: 'Hello, we would like to schedule an interview.' },
  });
  if (messageRes.status === 201 || messageRes.status === 200) {
    log('PASS', `Send message: ${messageRes.status}`);
  } else {
    log('FAIL', `Send message failed: ${messageRes.status} - ${JSON.stringify(messageRes.data)}`);
  }
}

// ============================================================
// ADMIN WORKFLOW
// ============================================================

async function testAdminWorkflow() {
  log('info', '\n========================================');
  log('info', 'ADMIN WORKFLOW');
  log('info', '========================================\n');

  // 1. Test that registration endpoint rejects ADMIN role
  log('info', 'Step 1: Test admin registration rejection');
  const registerRes = await api('/auth/register', {
    method: 'POST',
    requiresAuth: false,
    body: {
      email: `admin-${Date.now()}@test.com`,
      password: 'Test1234!',
      role: 'ADMIN',
    },
  });
  
  if (registerRes.status === 409) {
    log('PASS', `Admin registration correctly rejected with 409: ${(registerRes.data as any)?.message}`);
  } else {
    log('FAIL', `Expected 409 but got: ${registerRes.status} - ${JSON.stringify(registerRes.data)}`);
  }

  // Create admin directly via Prisma with explicit DATABASE_URL
  log('info', 'Step 1b: Create admin via direct DB insert');
  const bcrypt = require('bcryptjs');
  process.env.DATABASE_URL = 'postgresql://postgres:@localhost:5432/gradhire_test';
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  const adminEmail = `admin-${Date.now()}@test.com`;
  const adminPasswordHash = await bcrypt.hash('Test1234!', 12);
  
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  adminUserId = adminUser.id;
  
  log('PASS', `Admin user created: ${adminUserId}`);

  // 2. Login admin
  log('info', 'Step 2: Login admin');
  await getCsrfToken();
  const loginRes = await api('/auth/login', {
    method: 'POST',
    requiresAuth: false,
    body: {
      email: adminEmail,
      password: 'Test1234!',
    },
  });
  
  if (loginRes.status === 200) {
    log('PASS', `Login admin: ${loginRes.status}`);
    adminToken = (loginRes.data as any)?.accessToken || (loginRes.data as any)?.token;
  } else {
    log('FAIL', `Login admin failed: ${loginRes.status} - ${JSON.stringify(loginRes.data)}`);
  }

  // 3. Admin dashboard
  log('info', 'Step 3: Admin dashboard');
  const dashboardRes = await api('/admin/dashboard', { token: adminToken });
  if (dashboardRes.status === 200) {
    log('PASS', `Dashboard: ${dashboardRes.status}`);
  } else {
    log('FAIL', `Dashboard failed: ${dashboardRes.status} - ${JSON.stringify(dashboardRes.data)}`);
  }

  // 4. Admin users
  log('info', 'Step 4: Admin users');
  const usersRes = await api('/admin/users', { token: adminToken });
  if (usersRes.status === 200) {
    log('PASS', `Users: ${usersRes.status}, count: ${(usersRes.data as any)?.items?.length || (usersRes.data as any)?.length || 0}`);
  } else {
    log('FAIL', `Users failed: ${usersRes.status} - ${JSON.stringify(usersRes.data)}`);
  }

  // 5. Admin companies
  log('info', 'Step 5: Admin companies');
  const companiesRes = await api('/admin/companies', { token: adminToken });
  if (companiesRes.status === 200) {
    log('PASS', `Companies: ${companiesRes.status}`);
    testCompanyId = (companiesRes.data as any)?.items?.[0]?.id || (companiesRes.data as any)?.[0]?.id;
  } else {
    log('FAIL', `Companies failed: ${companiesRes.status} - ${JSON.stringify(companiesRes.data)}`);
  }

  // 6. Admin jobs
  log('info', 'Step 6: Admin jobs');
  const jobsRes = await api('/admin/jobs', { token: adminToken });
  if (jobsRes.status === 200) {
    log('PASS', `Jobs: ${jobsRes.status}, count: ${(jobsRes.data as any)?.items?.length || (jobsRes.data as any)?.length || 0}`);
  } else {
    log('FAIL', `Jobs failed: ${jobsRes.status} - ${JSON.stringify(jobsRes.data)}`);
  }

  // 7. Admin applications
  log('info', 'Step 7: Admin applications');
  const appsRes = await api('/admin/applications', { token: adminToken });
  if (appsRes.status === 200) {
    log('PASS', `Applications: ${appsRes.status}`);
  } else {
    log('FAIL', `Applications failed: ${appsRes.status} - ${JSON.stringify(appsRes.data)}`);
  }

  // 8. Admin job sources
  log('info', 'Step 8: Admin job sources');
  const sourcesRes = await api('/admin/job-sources', { token: adminToken });
  if (sourcesRes.status === 200) {
    log('PASS', `Job sources: ${sourcesRes.status}`);
  } else {
    log('FAIL', `Job sources failed: ${sourcesRes.status} - ${JSON.stringify(sourcesRes.data)}`);
  }

  // 9. Admin job source runs
  log('info', 'Step 9: Admin job source runs');
  const runsRes = await api('/admin/job-source-runs', { token: adminToken });
  if (runsRes.status === 200) {
    log('PASS', `Job source runs: ${runsRes.status}`);
  } else {
    log('FAIL', `Job source runs failed: ${runsRes.status} - ${JSON.stringify(runsRes.data)}`);
  }

  // 10. Admin audit logs
  log('info', 'Step 10: Admin audit logs');
  const auditRes = await api('/admin/audit-logs', { token: adminToken });
  if (auditRes.status === 200) {
    log('PASS', `Audit logs: ${auditRes.status}`);
  } else {
    log('FAIL', `Audit logs failed: ${auditRes.status} - ${JSON.stringify(auditRes.data)}`);
  }

  // 11. Admin settings
  log('info', 'Step 11: Admin settings');
  const settingsRes = await api('/admin/settings', { token: adminToken });
  if (settingsRes.status === 200) {
    log('PASS', `Settings: ${settingsRes.status}`);
  } else {
    log('FAIL', `Settings failed: ${settingsRes.status} - ${JSON.stringify(settingsRes.data)}`);
  }

  // 12. Admin notifications
  log('info', 'Step 12: Admin notifications');
  const notifRes = await api('/admin/notifications', { token: adminToken });
  if (notifRes.status === 200) {
    log('PASS', `Notifications: ${notifRes.status}`);
  } else {
    log('FAIL', `Notifications failed: ${notifRes.status} - ${JSON.stringify(notifRes.data)}`);
  }

  await prisma.$disconnect();
}

// ============================================================
// ROLE SECURITY TESTS
// ============================================================

async function testRoleSecurity() {
  log('info', '\n========================================');
  log('info', 'ROLE SECURITY TESTS');
  log('info', '========================================\n');

  // Test that talent cannot access employer endpoints
  log('info', 'Test: Talent accessing employer endpoint');
  const talentEmployerRes = await api('/employer/profile', { token: talentToken });
  if (talentEmployerRes.status === 403) {
    log('PASS', 'Talent correctly blocked from employer endpoint');
  } else {
    log('FAIL', `Talent should be blocked from employer endpoint, got: ${talentEmployerRes.status}`);
  }

  // Test that talent cannot access admin endpoints
  log('info', 'Test: Talent accessing admin endpoint');
  const talentAdminRes = await api('/admin/dashboard', { token: talentToken });
  if (talentAdminRes.status === 403) {
    log('PASS', 'Talent correctly blocked from admin endpoint');
  } else {
    log('FAIL', `Talent should be blocked from admin endpoint, got: ${talentAdminRes.status}`);
  }

  // Test that employer cannot access admin endpoints
  log('info', 'Test: Employer accessing admin endpoint');
  const employerAdminRes = await api('/admin/dashboard', { token: employerToken });
  if (employerAdminRes.status === 403) {
    log('PASS', 'Employer correctly blocked from admin endpoint');
  } else {
    log('FAIL', `Employer should be blocked from admin endpoint, got: ${employerAdminRes.status}`);
  }

  // Test unauthenticated access
  log('info', 'Test: Unauthenticated access to protected endpoint');
  const unauthRes = await api('/auth/me', { requiresAuth: true });
  if (unauthRes.status === 401) {
    log('PASS', 'Unauthenticated correctly blocked');
  } else {
    log('FAIL', `Unauthenticated should be blocked, got: ${unauthRes.status}`);
  }

  // Test that employer cannot access talent profile
  log('info', 'Test: Employer accessing talent student endpoint');
  const employerStudentRes = await api('/students/me', { token: employerToken });
  if (employerStudentRes.status === 403) {
    log('PASS', 'Employer correctly blocked from student endpoint');
  } else {
    log('FAIL', `Employer should be blocked from student endpoint, got: ${employerStudentRes.status}`);
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log(`${colors.blue}GradTure — End-to-End Workflow QA Test Suite${colors.reset}`);
  console.log(`${colors.blue}Base URL: ${BASE_URL}${colors.reset}\n`);

  try {
    await testEmployerWorkflow();
    await testTalentWorkflow();
    await testTalentApplyToEmployerJob();
    await testEmployerReviewWorkflow();
    await testAdminWorkflow();
    await testRoleSecurity();
    
    console.log(`\n${colors.green}========================================${colors.reset}`);
    console.log(`${colors.green}ALL WORKFLOWS COMPLETED${colors.reset}`);
    console.log(`${colors.green}========================================${colors.reset}\n`);
  } catch (error) {
    console.error(`\n${colors.red}FATAL ERROR: ${(error as Error).message}${colors.reset}`);
    process.exit(1);
  }
}

main();
