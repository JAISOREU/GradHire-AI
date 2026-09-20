import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'DemoPassword123!';

async function hashPassword(): Promise<string> {
  return bcrypt.hash(DEMO_PASSWORD, 12);
}

async function main() {
  const passwordHash = await hashPassword();

  const employer = await prisma.user.upsert({
    where: { email: 'employer@demo.gradhire.ai' },
    update: {},
    create: {
      email: 'employer@demo.gradhire.ai',
      passwordHash,
      role: 'EMPLOYER',
      employerProfile: {
        create: {
          companyName: 'Acme Corp',
          industry: 'Technology',
          location: 'San Francisco, CA',
          description: 'Demo employer account',
        },
      },
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@demo.gradhire.ai' },
    update: {},
    create: {
      email: 'student@demo.gradhire.ai',
      passwordHash,
      role: 'STUDENT',
      profile: {
        create: {
          name: 'Demo Student',
          focus: 'Software engineering',
          summary: 'Demo student account',
          skills: ['TypeScript', 'React', 'Node.js'],
        },
      },
    },
  });

  const company = await prisma.company.upsert({
    where: { name: 'Acme Corp' },
    update: { size: '501-1000' },
    create: {
      name: 'Acme Corp',
      industry: 'Technology',
      location: 'San Francisco, CA',
      description: 'Demo company',
      size: '501-1000',
    },
  });

  const job = await prisma.job.upsert({
    where: { id: 'seed-job-1' },
    update: {},
    create: {
      id: 'seed-job-1',
      employerId: employer.id,
      companyId: company.id,
      title: 'Junior Software Engineer',
      company: 'Acme Corp',
      country: 'USA',
      region: 'California',
      city: 'San Francisco',
      location: {
        create: {
          country: 'USA',
          region: 'California',
          city: 'San Francisco',
        },
      },
      type: 'HIRING',
      experienceLevel: 'ENTRY_LEVEL',
      workplaceType: 'ONSITE',
      description: 'Build awesome products.',
      responsibilities: 'Develop and maintain web applications.',
      requiredQualifications: 'Bachelor degree in Computer Science or related field.',
      requiredSkills: ['TypeScript', 'React', 'Node.js'],
      status: 'PUBLISHED',
    },
  });

  const existingThread = await prisma.message.count({
    where: { OR: [{ senderId: student.id, recipientId: employer.id }, { senderId: employer.id, recipientId: student.id }] },
  });

  if (existingThread === 0) {
    await prisma.message.createMany({
      data: [
        {
          senderId: employer.id,
          recipientId: student.id,
          body: 'Hi Demo Student, thanks for applying to Junior Software Engineer at Acme Corp. We would love to schedule a quick chat to learn more about your experience.',
          read: false,
        },
        {
          senderId: student.id,
          recipientId: employer.id,
          body: 'Hi! Thanks for reaching out — I would be happy to talk. My schedule is flexible this week.',
          read: true,
        },
        {
          senderId: employer.id,
          recipientId: student.id,
          body: "Great. I'll send over a couple of time slots for tomorrow.",
          read: false,
        },
      ],
    });
  }

  await prisma.notification.deleteMany({
    where: { recipientId: { in: [student.id, employer.id] } },
  });

  {
    const minutes = (m: number) => new Date(Date.now() - m * 60 * 1000);
    await prisma.notification.createMany({
      data: [
        {
          recipientId: student.id,
          message: 'Your application for Junior Software Engineer at Acme Corp moved to under review.',
          type: 'APPLICATION',
          read: false,
          createdAt: minutes(60 * 24 * 2),
        },
        {
          recipientId: student.id,
          message: 'Your application for Junior Software Engineer at Acme Corp moved to Interview.',
          type: 'INTERVIEW',
          read: false,
          createdAt: minutes(60 * 3),
        },
        {
          recipientId: student.id,
          message: 'New message from Acme Corp: Great. I will send over a couple of time slots for tomorrow.',
          type: 'MESSAGE',
          read: false,
          createdAt: minutes(45),
        },
        {
          recipientId: student.id,
          message: 'Welcome to GradTure! Complete your profile to unlock better job matches.',
          type: 'GENERIC',
          read: true,
          createdAt: minutes(60 * 24 * 5),
        },
        {
          recipientId: employer.id,
          message: 'New application received for Junior Software Engineer at Acme Corp.',
          type: 'APPLICATION',
          read: false,
          createdAt: minutes(60 * 24),
        },
        {
          recipientId: employer.id,
          message: 'Interview scheduled for Junior Software Engineer at Acme Corp with Demo Student.',
          type: 'INTERVIEW',
          read: false,
          createdAt: minutes(60 * 3),
        },
        {
          recipientId: employer.id,
          message: 'New message from Demo Student: Hi! Thanks for reaching out — I would be happy to talk.',
          type: 'MESSAGE',
          read: true,
          createdAt: minutes(30),
        },
        {
          recipientId: employer.id,
          message: 'Welcome to GradTure! Post your first job to start receiving applications.',
          type: 'GENERIC',
          read: true,
          createdAt: minutes(60 * 24 * 6),
        },
      ],
    });
  }

  const peers = await seedNetwork(student.id, employer.id, passwordHash);

  console.log('Seed complete:', { employer: employer.email, student: student.email, job: job.title, network: peers.length, feed: 7, demoPassword: DEMO_PASSWORD });
}

async function seedNetwork(studentId: string, employerId: string, passwordHash: string) {
  type Peer = {
    email: string;
    role: 'STUDENT' | 'EMPLOYER';
    name: string;
    focus: string;
    skills: string[];
    education?: { institution: string; degree: string };
    experience?: { company: string; jobTitle: string };
    companyName?: string;
  };

  const peers: Peer[] = [
    { email: 'priya@demo.gradhire.ai', role: 'STUDENT', name: 'Priya Sharma', focus: 'Backend engineering', skills: ['Node.js', 'PostgreSQL', 'Docker', 'GitHub Actions'], education: { institution: 'Georgia Tech', degree: 'B.S. Computer Science' } },
    { email: 'lucas@demo.gradhire.ai', role: 'STUDENT', name: 'Lucas Meyer', focus: 'Data analytics', skills: ['SQL', 'Python', 'Power BI', 'Excel'], education: { institution: 'University of Texas at Austin', degree: 'B.B.A. Information Systems' } },
    { email: 'amara@demo.gradhire.ai', role: 'STUDENT', name: 'Amara Okafor', focus: 'Full-stack development', skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'], education: { institution: 'Carnegie Mellon University', degree: 'B.S. Computer Engineering' } },
    { email: 'ryan@demo.gradhire.ai', role: 'STUDENT', name: 'Ryan Kim', focus: 'Mobile engineering', skills: ['Swift', 'Flutter', 'Kotlin', 'Firebase'], education: { institution: 'University of Washington', degree: 'B.S. Software Engineering' } },
    { email: 'sarah@demo.gradhire.ai', role: 'EMPLOYER', name: 'Sarah Chen', focus: 'Technical recruiting', skills: ['Sourcing', 'AI Sourcing', 'ATS', 'Employer Branding'], experience: { company: 'Acme Corp', jobTitle: 'Talent Acquisition Specialist' }, companyName: 'Acme Corp' },
    { email: 'david@demo.gradhire.ai', role: 'EMPLOYER', name: 'David Patel', focus: 'Engineering leadership', skills: ['Team Leadership', 'Recruiting', 'System Design', 'Agile'], experience: { company: 'Globex', jobTitle: 'Engineering Manager' }, companyName: 'Globex' },
    { email: 'maria@demo.gradhire.ai', role: 'EMPLOYER', name: 'Maria Lopez', focus: 'Product design', skills: ['Figma', 'Usability Testing', 'Prototyping', 'Design Systems'], experience: { company: 'Nimbus', jobTitle: 'Product Designer' }, companyName: 'Nimbus' },
    { email: 'james@demo.gradhire.ai', role: 'EMPLOYER', name: 'James O\u2019Brien', focus: 'ML engineering', skills: ['Python', 'PyTorch', 'SQL', 'Machine Learning'], experience: { company: 'Quantia', jobTitle: 'Data Scientist' }, companyName: 'Quantia' },
    { email: 'emily@demo.gradhire.ai', role: 'EMPLOYER', name: 'Emily Zhao', focus: 'Cloud architecture', skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'], experience: { company: 'CloudPeak', jobTitle: 'Cloud Architect' }, companyName: 'CloudPeak' },
    { email: 'daniel@demo.gradhire.ai', role: 'EMPLOYER', name: 'Daniel Wu', focus: 'Frontend engineering', skills: ['React', 'TypeScript', 'Tailwind', 'Next.js'], experience: { company: 'Globex', jobTitle: 'Frontend Engineer' }, companyName: 'Globex' },
    { email: 'grace@demo.gradhire.ai', role: 'EMPLOYER', name: 'Grace Martinez', focus: 'University recruiting', skills: ['Employer Branding', 'Campus Recruiting', 'ATS', 'Talent Sourcing'], experience: { company: 'Acme Corp', jobTitle: 'University Recruiting Lead' }, companyName: 'Acme Corp' },
    { email: 'tom@demo.gradhire.ai', role: 'EMPLOYER', name: 'Tom Haddad', focus: 'Platform engineering', skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS'], experience: { company: 'CloudPeak', jobTitle: 'DevOps Engineer' }, companyName: 'CloudPeak' },
    { email: 'nina@demo.gradhire.ai', role: 'EMPLOYER', name: 'Nina Petrova', focus: 'Product management', skills: ['Roadmapping', 'User Research', 'Agile', 'A/B Testing'], experience: { company: 'Nimbus', jobTitle: 'Product Manager' }, companyName: 'Nimbus' },
    { email: 'felix@demo.gradhire.ai', role: 'EMPLOYER', name: 'Felix Alvarez', focus: 'Backend engineering', skills: ['Go', 'PostgreSQL', 'gRPC', 'Docker'], experience: { company: 'Globex', jobTitle: 'Software Engineer' }, companyName: 'Globex' },
  ];

  const ids: string[] = [];
  for (const peer of peers) {
    const u = await prisma.user.upsert({
      where: { email: peer.email },
      update: {},
      create: { email: peer.email, passwordHash, role: peer.role },
    });
    ids.push(u.id);

    await prisma.profile.upsert({
      where: { userId: u.id },
      update: { name: peer.name, focus: peer.focus, skills: peer.skills },
      create: { userId: u.id, name: peer.name, focus: peer.focus, summary: `${peer.name} — ${peer.focus}.`, skills: peer.skills },
    });

    if (peer.education) {
      await prisma.education.upsert({
        where: { id: `edu-${u.id}` },
        update: {},
        create: { id: `edu-${u.id}`, userId: u.id, institution: peer.education.institution, degree: peer.education.degree, startDate: new Date('2021-09-01') },
      });
    }
    if (peer.experience) {
      await prisma.experience.upsert({
        where: { id: `exp-${u.id}` },
        update: {},
        create: { id: `exp-${u.id}`, userId: u.id, company: peer.experience.company, jobTitle: peer.experience.jobTitle, startDate: new Date('2022-06-01') },
      });
    }
    if (peer.companyName) {
      await prisma.employerProfile.upsert({
        where: { userId: u.id },
        update: {},
        create: { userId: u.id, companyName: peer.companyName, industry: 'Technology' },
      });
    }
  }

  // Clear any previous network relationships involving this cohort (idempotent
  // re-seed). QA runs may create edges with non-prefixed ids, so purge by user.
  const seedUserIds = [studentId, employerId, ...ids];
  await prisma.connection.deleteMany({
    where: {
      OR: [
        { requesterId: { in: seedUserIds } },
        { addresseeId: { in: seedUserIds } },
      ],
    },
  });
  await prisma.userFollow.deleteMany({
    where: {
      OR: [
        { followerId: { in: seedUserIds } },
        { followingId: { in: seedUserIds } },
      ],
    },
  });
  await prisma.companyFollow.deleteMany({
    where: { userId: { in: seedUserIds } },
  });

  const [priya, lucas, amara, ryan, sarah, david, maria, james, emily, daniel, grace, tom, nina, felix] = ids;

  const accepted: Array<[string, string]> = [
    [studentId, priya],
    [studentId, lucas],
    [studentId, amara],
    [priya, lucas],
    [priya, amara],
    [lucas, amara],
    [employerId, sarah],
    [employerId, david],
    [sarah, grace],
    [sarah, david],
    [david, daniel],
    [david, felix],
    [emily, maria],
    [emily, james],
  ];

  await prisma.connection.createMany({
    data: accepted.map(([a, b], i) => ({
      id: `seed-con-${i + 1}`,
      requesterId: a,
      addresseeId: b,
      status: 'ACCEPTED',
    })),
  });

  await prisma.connection.createMany({
    data: [
      { id: 'seed-con-p1', requesterId: emily, addresseeId: studentId, status: 'PENDING' },
      { id: 'seed-con-p2', requesterId: james, addresseeId: studentId, status: 'PENDING' },
      { id: 'seed-con-p3', requesterId: tom, addresseeId: employerId, status: 'PENDING' },
      { id: 'seed-con-p4', requesterId: nina, addresseeId: employerId, status: 'PENDING' },
      { id: 'seed-con-p5', requesterId: studentId, addresseeId: maria, status: 'PENDING' },
    ],
  });

  await prisma.userFollow.createMany({
    data: [
      { id: 'seed-fol-1', followerId: studentId, followingId: maria },
      { id: 'seed-fol-2', followerId: studentId, followingId: emily },
      { id: 'seed-fol-3', followerId: employerId, followingId: felix },
      { id: 'seed-fol-4', followerId: employerId, followingId: grace },
      { id: 'seed-fol-5', followerId: studentId, followingId: priya },
      { id: 'seed-fol-6', followerId: studentId, followingId: amara },
      { id: 'seed-fol-7', followerId: employerId, followingId: sarah },
    ],
  });

  // Feed posts below reference jobs by id (`seed-nimbus-job-1`,
  // `seed-cloudpeak-job-1`). Those jobs are NOT created anywhere else, so a
  // fresh database would otherwise fail the FeedPost_jobId_fkey constraint.
  // Create their companies and jobs here (idempotent, mirrors seed-job-1).
  const nimbusCompany = await prisma.company.upsert({
    where: { name: 'Nimbus' },
    update: {},
    create: {
      name: 'Nimbus',
      industry: 'Design & Technology',
      location: 'Austin, TX',
      description: 'Demo company',
      size: '51-200',
    },
  });
  const cloudpeakCompany = await prisma.company.upsert({
    where: { name: 'CloudPeak' },
    update: {},
    create: {
      name: 'CloudPeak',
      industry: 'Cloud Computing',
      location: 'Remote',
      description: 'Demo company',
      size: '201-500',
    },
  });

  await prisma.job.upsert({
    where: { id: 'seed-nimbus-job-1' },
    update: {},
    create: {
      id: 'seed-nimbus-job-1',
      employerId: maria,
      companyId: nimbusCompany.id,
      title: 'Junior Product Designer',
      company: 'Nimbus',
      country: 'USA',
      region: 'Texas',
      city: 'Austin',
      location: {
        create: {
          country: 'USA',
          region: 'Texas',
          city: 'Austin',
        },
      },
      type: 'HIRING',
      experienceLevel: 'ENTRY_LEVEL',
      workplaceType: 'HYBRID',
      description: 'Junior product designer opening at our Austin studio.',
      responsibilities: 'Design intuitive product experiences for our customers.',
      requiredQualifications: 'Portfolio required; degree welcome but not required.',
      requiredSkills: ['Figma', 'Prototyping', 'Design Systems'],
      status: 'PUBLISHED',
    },
  });

  await prisma.job.upsert({
    where: { id: 'seed-cloudpeak-job-1' },
    update: {},
    create: {
      id: 'seed-cloudpeak-job-1',
      employerId: emily,
      companyId: cloudpeakCompany.id,
      title: 'Graduate DevOps & Cloud Engineer',
      company: 'CloudPeak',
      country: 'USA',
      region: 'Remote',
      city: 'Remote',
      location: {
        create: {
          country: 'USA',
          region: 'Remote',
          city: 'Remote',
        },
      },
      type: 'HIRING',
      experienceLevel: 'ENTRY_LEVEL',
      workplaceType: 'REMOTE',
      description: 'Fully remote graduate pathway for DevOps and cloud.',
      responsibilities: 'Build and operate cloud infrastructure for our platform.',
      requiredQualifications: 'No years-of-experience requirement; structured mentorship provided.',
      requiredSkills: ['AWS', 'Kubernetes', 'Docker'],
      status: 'PUBLISHED',
    },
  });

  // ============================================================
  // Feed: seed posts, likes, comments (idempotent re-seed)
  // ============================================================
  const feedUserIds = [studentId, employerId, priya, lucas, amara, ryan, sarah, david, maria, james, emily];

  await prisma.feedPostComment.deleteMany({ where: { authorId: { in: feedUserIds } } });
  await prisma.feedPostLike.deleteMany({ where: { userId: { in: feedUserIds } } });
  await prisma.feedPost.deleteMany({ where: { authorId: { in: feedUserIds } } });

  const minutes = (m: number) => new Date(Date.now() - m * 60 * 1000);

  await prisma.feedPost.createMany({
    data: [
      { id: 'seed-feed-1', authorId: studentId, content: 'Just wrapped up my final semester of computer science — officially a fresh graduate! Open to backend and full-stack opportunities starting immediately.', createdAt: minutes(60 * 26) },
      { id: 'seed-feed-2', authorId: amara, content: 'Pro tip for grads: apply in the first 48 hours of a posting. We reviewed 200+ applications last week and screening starts as submissions come in.', imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200', createdAt: minutes(60 * 20) },
      { id: 'seed-feed-3', authorId: maria, content: 'I\'m hiring a junior product designer to join our Austin studio. Portfolio > degree — bring your case studies! DM me and I\'ll share the link.', jobId: 'seed-nimbus-job-1', createdAt: minutes(60 * 15) },
      { id: 'seed-feed-4', authorId: emily, content: 'CloudPeak now offers a fully remote graduate pathway for DevOps and cloud. Structured mentorship, no years-of-experience requirement.', jobId: 'seed-cloudpeak-job-1', createdAt: minutes(60 * 12) },
      { id: 'seed-feed-5', authorId: priya, content: 'Celebrating 3 months in my first backend role — and two of my team\'s internships convert to full-time offers this fall. Keep pushing, it\'s worth it.', createdAt: minutes(60 * 8) },
      { id: 'seed-feed-6', authorId: sarah, content: 'Acme Corp is sponsoring a free resume workshop at our SF office on Friday. Sign up through the link — we\'ll review your ATS compatibility live.', createdAt: minutes(60 * 4) },
      { id: 'seed-feed-7', authorId: employerId, content: 'We just posted a Junior Software Engineer opening at Acme Corp. Early-career friendly, hybrid in San Francisco. Happy to answer questions in the comments!', jobId: 'seed-job-1', createdAt: minutes(60 * 1) },
    ],
  });

  await prisma.feedPostLike.createMany({
    data: [
      { id: 'seed-f-like-1', postId: 'seed-feed-1', userId: amara },
      { id: 'seed-f-like-2', postId: 'seed-feed-1', userId: emily },
      { id: 'seed-f-like-3', postId: 'seed-feed-2', userId: studentId },
      { id: 'seed-f-like-4', postId: 'seed-feed-2', userId: lucas },
      { id: 'seed-f-like-5', postId: 'seed-feed-3', userId: studentId },
      { id: 'seed-f-like-6', postId: 'seed-feed-3', userId: ryan },
      { id: 'seed-f-like-7', postId: 'seed-feed-4', userId: studentId },
      { id: 'seed-f-like-8', postId: 'seed-feed-6', userId: employerId },
      { id: 'seed-f-like-9', postId: 'seed-feed-7', userId: priya },
      { id: 'seed-f-like-10', postId: 'seed-feed-7', userId: amara },
    ],
  });

  await prisma.feedPostComment.createMany({
    data: [
      { id: 'seed-f-comment-1', postId: 'seed-feed-1', authorId: maria, content: 'Congratulations! Send me your portfolio — our team is hiring in Austin.', createdAt: minutes(60 * 25) },
      { id: 'seed-f-comment-2', postId: 'seed-feed-1', authorId: emily, content: 'Congrats! CloudPeak is hiring remotely if you want to explore cloud roles.', createdAt: minutes(60 * 24) },
      { id: 'seed-f-comment-3', postId: 'seed-feed-7', authorId: studentId, content: 'Applied this morning — very excited about the mentorship program!', createdAt: minutes(60 * 0.5) },
    ],
  });

  // Companies available to follow
  const upsertCompany = (name: string, industry: string, location: string, description: string, size: string) =>
    prisma.company.upsert({
      where: { name },
      update: { size },
      create: { name, industry, location, description, size },
    });
  const [globex, nimbus, cloudpeak, quantia] = await Promise.all([
    upsertCompany('Globex', 'Technology', 'New York, NY', 'Global technology company.', '1001-5000'),
    upsertCompany('Nimbus', 'Software', 'Austin, TX', 'Cloud software platforms.', '201-500'),
    upsertCompany('CloudPeak', 'Infrastructure', 'Seattle, WA', 'Cloud infrastructure provider.', '51-200'),
    upsertCompany('Quantia', 'AI', 'Boston, MA', 'Applied AI and data science.', '201-500'),
  ]);

  // Open roles per company so company discovery shows real activity (varied
  // industries, locations, and work arrangements for the filters).
  const upsertJob = (id: string, employerId: string, companyId: string, companyName: string, title: string, workplaceType: 'REMOTE' | 'HYBRID' | 'ONSITE', requiredSkills: string[]) =>
    prisma.job.upsert({
      where: { id },
      update: { status: 'PUBLISHED' },
      create: {
        id,
        employerId,
        companyId,
        company: companyName,
        title,
        workplaceType,
        requiredSkills,
        description: `Open role at ${companyName}.`,
        responsibilities: 'Ship meaningful work with a supportive team.',
        requiredQualifications: 'Relevant degree or equivalent experience.',
        status: 'PUBLISHED',
      },
    });
  await Promise.all([
    upsertJob('seed-globex-job-1', david, globex.id, 'Globex', 'Frontend Engineer', 'REMOTE', ['React', 'TypeScript', 'Next.js']),
    upsertJob('seed-globex-job-2', felix, globex.id, 'Globex', 'Backend Engineer', 'HYBRID', ['Go', 'PostgreSQL', 'Docker']),
    upsertJob('seed-nimbus-job-1', maria, nimbus.id, 'Nimbus', 'Product Designer', 'HYBRID', ['Figma', 'Design Systems']),
    upsertJob('seed-cloudpeak-job-1', emily, cloudpeak.id, 'CloudPeak', 'DevOps Engineer', 'REMOTE', ['Docker', 'Kubernetes', 'AWS']),
    upsertJob('seed-cloudpeak-job-2', tom, cloudpeak.id, 'CloudPeak', 'Cloud Architect', 'HYBRID', ['AWS', 'Terraform']),
    upsertJob('seed-quantia-job-1', james, quantia.id, 'Quantia', 'Data Scientist', 'REMOTE', ['Python', 'SQL', 'Machine Learning']),
  ]);

  // Followers so follower counts render meaningfully.
  const acmeRow = await prisma.company.findUnique({ where: { name: 'Acme Corp' } });
  await prisma.companyFollow.createMany({
    data: [
      ...(acmeRow ? [
        { id: 'seed-cf-acme-1', userId: studentId, companyId: acmeRow.id },
        { id: 'seed-cf-acme-2', userId: priya, companyId: acmeRow.id },
        { id: 'seed-cf-acme-3', userId: sarah, companyId: acmeRow.id },
      ] : []),
      { id: 'seed-cf-globex-1', userId: studentId, companyId: globex.id },
      { id: 'seed-cf-globex-2', userId: amara, companyId: globex.id },
      { id: 'seed-cf-nimbus-1', userId: lucas, companyId: nimbus.id },
      { id: 'seed-cf-cloudpeak-1', userId: tom, companyId: cloudpeak.id },
      { id: 'seed-cf-quantia-1', userId: james, companyId: quantia.id },
      { id: 'seed-cf-quantia-2', userId: lucas, companyId: quantia.id },
    ],
  });

  return ids;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
