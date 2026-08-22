import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { StudentLayout } from '../layouts/StudentLayout';
import { EmployerLayout } from '../layouts/EmployerLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PageTransition } from '../components/PageTransition';
import { LoadingState } from '../components/LoadingState';

const HomePage = lazy(() => import('../features/landing/HomePage').then((m) => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('../features/landing/AboutPage').then((m) => ({ default: m.AboutPage })));
const CompaniesPage = lazy(() => import('../features/landing/CompaniesPage').then((m) => ({ default: m.CompaniesPage })));
const CompanyDetailPage = lazy(() => import('../features/landing/CompanyDetailPage').then((m) => ({ default: m.CompanyDetailPage })));
const NotFoundPage = lazy(() => import('../features/landing/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const AdminDashboardPage = lazy(() => import('../features/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('../features/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminJobsPage = lazy(() => import('../features/admin/AdminJobsPage').then((m) => ({ default: m.AdminJobsPage })));
const AdminApplicationsPage = lazy(() => import('../features/admin/AdminApplicationsPage').then((m) => ({ default: m.AdminApplicationsPage })));
const AdminCompaniesPage = lazy(() => import('../features/admin/AdminCompaniesPage').then((m) => ({ default: m.AdminCompaniesPage })));
const AdminReportsPage = lazy(() => import('../features/admin/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })));
const AdminAnalyticsPage = lazy(() => import('../features/admin/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage })));
const AdminMonitoringPage = lazy(() => import('../features/admin/AdminMonitoringPage').then((m) => ({ default: m.AdminMonitoringPage })));
const AdminNotificationsPage = lazy(() => import('../features/admin/AdminNotificationsPage').then((m) => ({ default: m.AdminNotificationsPage })));
const AdminAuditLogsPage = lazy(() => import('../features/admin/AdminAuditLogsPage').then((m) => ({ default: m.AdminAuditLogsPage })));
const AdminSettingsPage = lazy(() => import('../features/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })));
const AdminDatabasePage = lazy(() => import('../features/admin/AdminDatabasePage').then((m) => ({ default: m.AdminDatabasePage })));
const AdminApiKeysPage = lazy(() => import('../features/admin/AdminApiKeysPage').then((m) => ({ default: m.AdminApiKeysPage })));
const AdminEmailTemplatesPage = lazy(() => import('../features/admin/AdminEmailTemplatesPage').then((m) => ({ default: m.AdminEmailTemplatesPage })));
const AdminCmsPage = lazy(() => import('../features/admin/AdminCmsPage').then((m) => ({ default: m.AdminCmsPage })));
const AdminFeatureFlagsPage = lazy(() => import('../features/admin/AdminFeatureFlagsPage').then((m) => ({ default: m.AdminFeatureFlagsPage })));
const AdminBackupsPage = lazy(() => import('../features/admin/AdminBackupsPage').then((m) => ({ default: m.AdminBackupsPage })));
const AdminSecurityPage = lazy(() => import('../features/admin/AdminSecurityPage').then((m) => ({ default: m.AdminSecurityPage })));
const AdminDeveloperToolsPage = lazy(() => import('../features/admin/AdminDeveloperToolsPage').then((m) => ({ default: m.AdminDeveloperToolsPage })));
const AdminJobSourcesPage = lazy(() => import('../features/admin/AdminJobSourcesPage').then((m) => ({ default: m.AdminJobSourcesPage })));
const AdminJobSourceRunsPage = lazy(() => import('../features/admin/AdminJobSourceRunsPage').then((m) => ({ default: m.AdminJobSourceRunsPage })));
const AdminLayout = lazy(() => import('../layouts/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AccountPage = lazy(() => import('../features/account/AccountPage').then((m) => ({ default: m.AccountPage })));
const JobListPage = lazy(() => import('../features/jobs/JobListPage').then((m) => ({ default: m.JobListPage })));
const StudentJobsPage = lazy(() => import('../features/student/StudentJobsPage').then((m) => ({ default: m.StudentJobsPage })));
const StudentCompaniesPage = lazy(() => import('../features/student/StudentCompaniesPage').then((m) => ({ default: m.StudentCompaniesPage })));
const EmployerCompaniesPage = lazy(() => import('../features/employer/EmployerCompaniesPage').then((m) => ({ default: m.EmployerCompaniesPage })));
const JobDetailPage = lazy(() => import('../features/jobs/JobDetailPage').then((m) => ({ default: m.JobDetailPage })));
const LoginPage = lazy(() => import('../features/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('../features/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../features/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import('../features/auth/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })));
const StudentDashboardPage = lazy(() => import('../features/student/StudentDashboardPage').then((m) => ({ default: m.StudentDashboardPage })));
const StudentResumePage = lazy(() => import('../features/student/StudentResumePage').then((m) => ({ default: m.StudentResumePage })));
const StudentApplicationsPage = lazy(() => import('../features/student/StudentApplicationsPage').then((m) => ({ default: m.StudentApplicationsPage })));
const StudentSavedJobsPage = lazy(() => import('../features/student/StudentSavedJobsPage').then((m) => ({ default: m.StudentSavedJobsPage })));
const StudentResumeBuilderPage = lazy(() => import('../features/student/StudentResumeBuilderPage').then((m) => ({ default: m.StudentResumeBuilderPage })));
const StudentRecommendedJobsPage = lazy(() => import('../features/student/StudentRecommendedJobsPage').then((m) => ({ default: m.StudentRecommendedJobsPage })));
const StudentNotificationsPage = lazy(() => import('../features/student/StudentNotificationsPage').then((m) => ({ default: m.StudentNotificationsPage })));
const StudentMessagesPage = lazy(() => import('../features/student/StudentMessagesPage').then((m) => ({ default: m.StudentMessagesPage })));
const StudentSettingsPage = lazy(() => import('../features/student/StudentSettingsPage').then((m) => ({ default: m.StudentSettingsPage })));
const StudentInterviewsPage = lazy(() => import('../features/student/StudentInterviewsPage').then((m) => ({ default: m.StudentInterviewsPage })));
const EmployerDashboardPage = lazy(() => import('../features/employer/EmployerDashboardPage').then((m) => ({ default: m.EmployerDashboardPage })));
const EmployerPostJobPage = lazy(() => import('../features/employer/EmployerPostJobPage').then((m) => ({ default: m.EmployerPostJobPage })));
const EmployerManageJobsPage = lazy(() => import('../features/employer/EmployerManageJobsPage').then((m) => ({ default: m.EmployerManageJobsPage })));
const EmployerApplicantsPage = lazy(() => import('../features/employer/EmployerApplicantsPage').then((m) => ({ default: m.EmployerApplicantsPage })));
const EmployerInterviewsPage = lazy(() => import('../features/employer/EmployerInterviewsPage').then((m) => ({ default: m.EmployerInterviewsPage })));
const EmployerMessagesPage = lazy(() => import('../features/employer/EmployerMessagesPage').then((m) => ({ default: m.EmployerMessagesPage })));
const EmployerAnalyticsPage = lazy(() => import('../features/employer/EmployerAnalyticsPage').then((m) => ({ default: m.EmployerAnalyticsPage })));
const EmployerNotificationsPage = lazy(() => import('../features/employer/EmployerNotificationsPage').then((m) => ({ default: m.EmployerNotificationsPage })));
const EmployerCompanyProfilePage = lazy(() => import('../features/employer/EmployerCompanyProfilePage').then((m) => ({ default: m.EmployerCompanyProfilePage })));
const EmployerSettingsPage = lazy(() => import('../features/employer/EmployerSettingsPage').then((m) => ({ default: m.EmployerSettingsPage })));
const EmployerEditJobPage = lazy(() => import('../features/employer/EmployerEditJobPage').then((m) => ({ default: m.EmployerEditJobPage })));

const Page = ({ children }: { children: React.ReactNode }) => <PageTransition>{children}</PageTransition>;

const LazyPage = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingState label="Loading…" />}>
    {children}
  </Suspense>
);

export const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<LazyPage><Page><HomePage /></Page></LazyPage>} />
      <Route path="/about" element={<LazyPage><Page><AboutPage /></Page></LazyPage>} />
      <Route path="/jobs" element={<LazyPage><Page><JobListPage /></Page></LazyPage>} />
      <Route path="/jobs/:id" element={<LazyPage><Page><JobDetailPage /></Page></LazyPage>} />
      <Route path="/companies" element={<LazyPage><Page><CompaniesPage /></Page></LazyPage>} />
      <Route path="/companies/:id" element={<LazyPage><Page><CompanyDetailPage /></Page></LazyPage>} />
      <Route path="/login" element={<LazyPage><Page><LoginPage /></Page></LazyPage>} />
      <Route path="/register" element={<LazyPage><Page><RegisterPage /></Page></LazyPage>} />
      <Route path="/forgot-password" element={<LazyPage><Page><ForgotPasswordPage /></Page></LazyPage>} />
      <Route path="/reset-password" element={<LazyPage><Page><ResetPasswordPage /></Page></LazyPage>} />
      <Route path="/verify-email" element={<LazyPage><Page><VerifyEmailPage /></Page></LazyPage>} />
    </Route>

    {/* Student (protected) */}
    <Route element={<ProtectedRoute role="STUDENT" />}>
      <Route element={<StudentLayout />}>
        <Route path="/student/dashboard" element={<LazyPage><Page><StudentDashboardPage /></Page></LazyPage>} />
        <Route path="/student/account" element={<LazyPage><Page><AccountPage /></Page></LazyPage>} />
        <Route path="/student/jobs" element={<LazyPage><Page><StudentJobsPage /></Page></LazyPage>} />
        <Route path="/student/companies" element={<LazyPage><Page><StudentCompaniesPage /></Page></LazyPage>} />
        <Route path="/student/resume" element={<LazyPage><Page><StudentResumePage /></Page></LazyPage>} />
        <Route path="/student/applications" element={<LazyPage><Page><StudentApplicationsPage /></Page></LazyPage>} />
        <Route path="/student/saved" element={<LazyPage><Page><StudentSavedJobsPage /></Page></LazyPage>} />
        <Route path="/student/resume-builder" element={<LazyPage><Page><StudentResumeBuilderPage /></Page></LazyPage>} />
        <Route path="/student/recommended" element={<LazyPage><Page><StudentRecommendedJobsPage /></Page></LazyPage>} />
        <Route path="/student/notifications" element={<LazyPage><Page><StudentNotificationsPage /></Page></LazyPage>} />
        <Route path="/student/messages" element={<LazyPage><Page><StudentMessagesPage /></Page></LazyPage>} />
        <Route path="/student/interviews" element={<LazyPage><Page><StudentInterviewsPage /></Page></LazyPage>} />
        <Route path="/student/settings" element={<LazyPage><Page><StudentSettingsPage /></Page></LazyPage>} />
      </Route>
    </Route>

    {/* Employer (protected) */}
    <Route element={<ProtectedRoute role="EMPLOYER" />}>
      <Route element={<EmployerLayout />}>
        <Route path="/employer/dashboard" element={<LazyPage><Page><EmployerDashboardPage /></Page></LazyPage>} />
        <Route path="/employer/account" element={<LazyPage><Page><AccountPage /></Page></LazyPage>} />
        <Route path="/employer/post-job" element={<LazyPage><Page><EmployerPostJobPage /></Page></LazyPage>} />
        <Route path="/employer/edit-job/:id" element={<LazyPage><Page><EmployerEditJobPage /></Page></LazyPage>} />
        <Route path="/employer/company-profile" element={<LazyPage><Page><EmployerCompanyProfilePage /></Page></LazyPage>} />
        <Route path="/employer/jobs" element={<LazyPage><Page><EmployerManageJobsPage /></Page></LazyPage>} />
        <Route path="/employer/companies" element={<LazyPage><Page><EmployerCompaniesPage /></Page></LazyPage>} />
        <Route path="/employer/applicants" element={<LazyPage><Page><EmployerApplicantsPage /></Page></LazyPage>} />
        <Route path="/employer/interviews" element={<LazyPage><Page><EmployerInterviewsPage /></Page></LazyPage>} />
        <Route path="/employer/messages" element={<LazyPage><Page><EmployerMessagesPage /></Page></LazyPage>} />
        <Route path="/employer/analytics" element={<LazyPage><Page><EmployerAnalyticsPage /></Page></LazyPage>} />
        <Route path="/employer/notifications" element={<LazyPage><Page><EmployerNotificationsPage /></Page></LazyPage>} />
        <Route path="/employer/settings" element={<LazyPage><Page><EmployerSettingsPage /></Page></LazyPage>} />
      </Route>
    </Route>

    {/* Admin (hidden) */}
    <Route element={<ProtectedRoute role="ADMIN" />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<LazyPage><Page><AdminDashboardPage /></Page></LazyPage>} />
        <Route path="/admin/account" element={<LazyPage><Page><AccountPage /></Page></LazyPage>} />
        <Route path="/admin/users" element={<LazyPage><Page><AdminUsersPage /></Page></LazyPage>} />
        <Route path="/admin/jobs" element={<LazyPage><Page><AdminJobsPage /></Page></LazyPage>} />
        <Route path="/admin/applications" element={<LazyPage><Page><AdminApplicationsPage /></Page></LazyPage>} />
        <Route path="/admin/companies" element={<LazyPage><Page><AdminCompaniesPage /></Page></LazyPage>} />
        <Route path="/admin/reports" element={<LazyPage><Page><AdminReportsPage /></Page></LazyPage>} />
        <Route path="/admin/analytics" element={<LazyPage><Page><AdminAnalyticsPage /></Page></LazyPage>} />
        <Route path="/admin/monitoring" element={<LazyPage><Page><AdminMonitoringPage /></Page></LazyPage>} />
        <Route path="/admin/notifications" element={<LazyPage><Page><AdminNotificationsPage /></Page></LazyPage>} />
        <Route path="/admin/audit-logs" element={<LazyPage><Page><AdminAuditLogsPage /></Page></LazyPage>} />
        <Route path="/admin/settings" element={<LazyPage><Page><AdminSettingsPage /></Page></LazyPage>} />
        <Route path="/admin/database" element={<LazyPage><Page><AdminDatabasePage /></Page></LazyPage>} />
        <Route path="/admin/api-keys" element={<LazyPage><Page><AdminApiKeysPage /></Page></LazyPage>} />
        <Route path="/admin/email-templates" element={<LazyPage><Page><AdminEmailTemplatesPage /></Page></LazyPage>} />
        <Route path="/admin/cms" element={<LazyPage><Page><AdminCmsPage /></Page></LazyPage>} />
        <Route path="/admin/feature-flags" element={<LazyPage><Page><AdminFeatureFlagsPage /></Page></LazyPage>} />
        <Route path="/admin/backups" element={<LazyPage><Page><AdminBackupsPage /></Page></LazyPage>} />
        <Route path="/admin/security" element={<LazyPage><Page><AdminSecurityPage /></Page></LazyPage>} />
        <Route path="/admin/developer-tools" element={<LazyPage><Page><AdminDeveloperToolsPage /></Page></LazyPage>} />
        <Route path="/admin/job-sources" element={<LazyPage><Page><AdminJobSourcesPage /></Page></LazyPage>} />
        <Route path="/admin/job-sources/:id/runs" element={<LazyPage><Page><AdminJobSourceRunsPage /></Page></LazyPage>} />
      </Route>
    </Route>

    {/* Fallback */}
    <Route path="*" element={<LazyPage><Page><NotFoundPage /></Page></LazyPage>} />
  </Routes>
);
