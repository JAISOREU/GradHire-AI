import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { StudentLayout } from '../layouts/StudentLayout';
import { EmployerLayout } from '../layouts/EmployerLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PageTransition } from '../components/PageTransition';
import { HomePage } from '../features/landing/HomePage';
import { AboutPage } from '../features/landing/AboutPage';
import { CompaniesPage } from '../features/landing/CompaniesPage';
import { CompanyDetailPage } from '../features/landing/CompanyDetailPage';
import { NotFoundPage } from '../features/landing/NotFoundPage';
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage';
import { AdminUsersPage } from '../features/admin/AdminUsersPage';
import { AdminJobsPage } from '../features/admin/AdminJobsPage';
import { AdminApplicationsPage } from '../features/admin/AdminApplicationsPage';
import { AdminCompaniesPage } from '../features/admin/AdminCompaniesPage';
import { AdminReportsPage } from '../features/admin/AdminReportsPage';
import { AdminAnalyticsPage } from '../features/admin/AdminAnalyticsPage';
import { AdminAiMonitoringPage } from '../features/admin/AdminAiMonitoringPage';
import { AdminNotificationsPage } from '../features/admin/AdminNotificationsPage';
import { AdminAuditLogsPage } from '../features/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from '../features/admin/AdminSettingsPage';
import { AdminDatabasePage } from '../features/admin/AdminDatabasePage';
import { AdminApiKeysPage } from '../features/admin/AdminApiKeysPage';
import { AdminEmailTemplatesPage } from '../features/admin/AdminEmailTemplatesPage';
import { AdminCmsPage } from '../features/admin/AdminCmsPage';
import { AdminFeatureFlagsPage } from '../features/admin/AdminFeatureFlagsPage';
import { AdminBackupsPage } from '../features/admin/AdminBackupsPage';
import { AdminSecurityPage } from '../features/admin/AdminSecurityPage';
import { AdminDeveloperToolsPage } from '../features/admin/AdminDeveloperToolsPage';
import { AdminJobSourcesPage } from '../features/admin/AdminJobSourcesPage';
import { AdminJobSourceRunsPage } from '../features/admin/AdminJobSourceRunsPage';
import { AdminLayout } from '../layouts/AdminLayout';
import { AccountPage } from '../features/account/AccountPage';
import { JobListPage } from '../features/jobs/JobListPage';
import { JobDetailPage } from '../features/jobs/JobDetailPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { VerifyEmailPage } from '../features/auth/VerifyEmailPage';
import { StudentDashboardPage } from '../features/student/StudentDashboardPage';
import { StudentResumePage } from '../features/student/StudentResumePage';
import { StudentApplicationsPage } from '../features/student/StudentApplicationsPage';
import { StudentSavedJobsPage } from '../features/student/StudentSavedJobsPage';
import { StudentAiResumeBuilderPage } from '../features/student/StudentAiResumeBuilderPage';
import { StudentRecommendedJobsPage } from '../features/student/StudentRecommendedJobsPage';
import { StudentNotificationsPage } from '../features/student/StudentNotificationsPage';
import { StudentMessagesPage } from '../features/student/StudentMessagesPage';
import { StudentSettingsPage } from '../features/student/StudentSettingsPage';
import { EmployerDashboardPage } from '../features/employer/EmployerDashboardPage';
import { EmployerPostJobPage } from '../features/employer/EmployerPostJobPage';
import { EmployerManageJobsPage } from '../features/employer/EmployerManageJobsPage';
import { EmployerApplicantsPage } from '../features/employer/EmployerApplicantsPage';
import { EmployerInterviewsPage } from '../features/employer/EmployerInterviewsPage';
import { EmployerMessagesPage } from '../features/employer/EmployerMessagesPage';
import { EmployerAnalyticsPage } from '../features/employer/EmployerAnalyticsPage';
import { EmployerNotificationsPage } from '../features/employer/EmployerNotificationsPage';
import { EmployerCompanyProfilePage } from '../features/employer/EmployerCompanyProfilePage';
import { EmployerSettingsPage } from '../features/employer/EmployerSettingsPage';
import { EmployerEditJobPage } from '../features/employer/EmployerEditJobPage';

const Page = ({ children }: { children: React.ReactNode }) => <PageTransition>{children}</PageTransition>;

export const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Page><HomePage /></Page>} />
      <Route path="/about" element={<Page><AboutPage /></Page>} />
      <Route path="/jobs" element={<Page><JobListPage /></Page>} />
      <Route path="/jobs/:id" element={<Page><JobDetailPage /></Page>} />
      <Route path="/companies" element={<Page><CompaniesPage /></Page>} />
      <Route path="/companies/:id" element={<Page><CompanyDetailPage /></Page>} />
      <Route path="/login" element={<Page><LoginPage /></Page>} />
      <Route path="/register" element={<Page><RegisterPage /></Page>} />
      <Route path="/forgot-password" element={<Page><ForgotPasswordPage /></Page>} />
      <Route path="/reset-password" element={<Page><ResetPasswordPage /></Page>} />
      <Route path="/verify-email" element={<Page><VerifyEmailPage /></Page>} />
    </Route>

    {/* Student (protected) */}
    <Route element={<ProtectedRoute role="STUDENT" />}>
      <Route element={<StudentLayout />}>
        <Route path="/student/dashboard" element={<Page><StudentDashboardPage /></Page>} />
        <Route path="/student/account" element={<Page><AccountPage /></Page>} />
        <Route path="/student/resume" element={<Page><StudentResumePage /></Page>} />
        <Route path="/student/applications" element={<Page><StudentApplicationsPage /></Page>} />
        <Route path="/student/saved" element={<Page><StudentSavedJobsPage /></Page>} />
        <Route path="/student/ai-resume-builder" element={<Page><StudentAiResumeBuilderPage /></Page>} />
        <Route path="/student/recommended" element={<Page><StudentRecommendedJobsPage /></Page>} />
        <Route path="/student/notifications" element={<Page><StudentNotificationsPage /></Page>} />
        <Route path="/student/messages" element={<Page><StudentMessagesPage /></Page>} />
        <Route path="/student/settings" element={<Page><StudentSettingsPage /></Page>} />
      </Route>
    </Route>

    {/* Employer (protected) */}
    <Route element={<ProtectedRoute role="EMPLOYER" />}>
      <Route element={<EmployerLayout />}>
        <Route path="/employer/dashboard" element={<Page><EmployerDashboardPage /></Page>} />
        <Route path="/employer/account" element={<Page><AccountPage /></Page>} />
        <Route path="/employer/post-job" element={<Page><EmployerPostJobPage /></Page>} />
        <Route path="/employer/edit-job/:id" element={<Page><EmployerEditJobPage /></Page>} />
        <Route path="/employer/company-profile" element={<Page><EmployerCompanyProfilePage /></Page>} />
        <Route path="/employer/jobs" element={<Page><EmployerManageJobsPage /></Page>} />
        <Route path="/employer/applicants" element={<Page><EmployerApplicantsPage /></Page>} />
        <Route path="/employer/interviews" element={<Page><EmployerInterviewsPage /></Page>} />
        <Route path="/employer/messages" element={<Page><EmployerMessagesPage /></Page>} />
        <Route path="/employer/analytics" element={<Page><EmployerAnalyticsPage /></Page>} />
        <Route path="/employer/notifications" element={<Page><EmployerNotificationsPage /></Page>} />
        <Route path="/employer/settings" element={<Page><EmployerSettingsPage /></Page>} />
      </Route>
    </Route>

    {/* Admin (hidden) */}
    <Route element={<ProtectedRoute role="ADMIN" />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<Page><AdminDashboardPage /></Page>} />
        <Route path="/admin/account" element={<Page><AccountPage /></Page>} />
        <Route path="/admin/users" element={<Page><AdminUsersPage /></Page>} />
        <Route path="/admin/jobs" element={<Page><AdminJobsPage /></Page>} />
        <Route path="/admin/applications" element={<Page><AdminApplicationsPage /></Page>} />
        <Route path="/admin/companies" element={<Page><AdminCompaniesPage /></Page>} />
        <Route path="/admin/reports" element={<Page><AdminReportsPage /></Page>} />
        <Route path="/admin/analytics" element={<Page><AdminAnalyticsPage /></Page>} />
        <Route path="/admin/ai-monitoring" element={<Page><AdminAiMonitoringPage /></Page>} />
        <Route path="/admin/notifications" element={<Page><AdminNotificationsPage /></Page>} />
        <Route path="/admin/audit-logs" element={<Page><AdminAuditLogsPage /></Page>} />
        <Route path="/admin/settings" element={<Page><AdminSettingsPage /></Page>} />
        <Route path="/admin/database" element={<Page><AdminDatabasePage /></Page>} />
        <Route path="/admin/api-keys" element={<Page><AdminApiKeysPage /></Page>} />
        <Route path="/admin/email-templates" element={<Page><AdminEmailTemplatesPage /></Page>} />
        <Route path="/admin/cms" element={<Page><AdminCmsPage /></Page>} />
        <Route path="/admin/feature-flags" element={<Page><AdminFeatureFlagsPage /></Page>} />
        <Route path="/admin/backups" element={<Page><AdminBackupsPage /></Page>} />
        <Route path="/admin/security" element={<Page><AdminSecurityPage /></Page>} />
        <Route path="/admin/developer-tools" element={<Page><AdminDeveloperToolsPage /></Page>} />
        <Route path="/admin/job-sources" element={<Page><AdminJobSourcesPage /></Page>} />
        <Route path="/admin/job-sources/:id/runs" element={<Page><AdminJobSourceRunsPage /></Page>} />
      </Route>
    </Route>

    {/* Fallback */}
    <Route path="*" element={<Page><NotFoundPage /></Page>} />
  </Routes>
);
