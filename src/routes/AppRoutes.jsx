import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthGuard } from './AuthGuard';
import { GuestGuard } from './GuestGuard';
import { PermissionGuard } from './PermissionGuard';
import { PublicRouteWrapper } from './PublicRouteWrapper';
import { AppLayout } from '../components/layout/AppLayout';
import { ROUTES } from './routeConfig';

// Import All Existing Views
import { PublicHomeView } from '../views/PublicHomeView';
import { LoginView } from '../views/LoginView';
import { CeoDashboardView } from '../views/CeoDashboardView';
import { StudentManagementView } from '../views/StudentManagementView';
import { AdmissionsCrmView } from '../views/AdmissionsCrmView';
import { AttendanceManagementView } from '../views/AttendanceManagementView';
import { AcademicManagementView } from '../views/AcademicManagementView';
import { ExaminationOmrView } from '../views/ExaminationOmrView';
import { FeesAccountsView } from '../views/FeesAccountsView';
import { BranchManagementView } from '../views/BranchManagementView';
import { CommunicationCentreView } from '../views/CommunicationCentreView';
import { ReportsAnalyticsView } from '../views/ReportsAnalyticsView';
import { AuditLogsView } from '../views/AuditLogsView';
import { DocumentVaultView } from '../views/DocumentVaultView';
import { InventoryAssetsView } from '../views/InventoryAssetsView';
import { ChtqScholarshipView } from '../views/ChtqScholarshipView';
import { HrStaffManagementView } from '../views/HrStaffManagementView';
import { StudentPortalView } from '../views/StudentPortalView';
import { ParentPortalView } from '../views/ParentPortalView';
import { FacultyPortalView } from '../views/FacultyPortalView';
import { NotFoundView } from '../views/NotFoundView';

/**
 * Smart dispatcher for /branches:
 * If authenticated, displays the ERP Campus Infrastructure management module inside AppLayout.
 * If unauthenticated or ?public=true, displays the public website branches showcase.
 */
const BranchesDispatcher = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  if (isAuthenticated && searchParams.get('public') !== 'true') {
    return (
      <AppLayout>
        <PermissionGuard module="branches" action="view">
          <BranchManagementView />
        </PermissionGuard>
      </AppLayout>
    );
  }

  return <PublicRouteWrapper section="branches" />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* =================================================== */}
      {/* PUBLIC INSTITUTIONAL ROUTES                         */}
      {/* =================================================== */}
      <Route path={ROUTES.HOME} element={<PublicRouteWrapper section="home" />} />
      <Route path={ROUTES.ABOUT} element={<PublicRouteWrapper section="about" />} />
      <Route path={ROUTES.COURSES} element={<PublicRouteWrapper section="courses" />} />
      <Route path={ROUTES.BATCHES} element={<PublicRouteWrapper section="batches" />} />
      <Route path={ROUTES.RESULTS} element={<PublicRouteWrapper section="results" />} />
      <Route path={ROUTES.CONTACT} element={<PublicRouteWrapper section="contact" />} />
      <Route path={ROUTES.PUBLIC_BRANCHES} element={<BranchesDispatcher />} />

      {/* Guest Authentication Route */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <GuestGuard>
            <LoginView />
          </GuestGuard>
        }
      />

      {/* =================================================== */}
      {/* PROTECTED ERP MODULE ROUTES (Wrapped in AppLayout)  */}
      {/* =================================================== */}
      <Route
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        {/* Executive / Multi-Branch Command */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <PermissionGuard module="ceo_dashboard" action="view">
              <CeoDashboardView />
            </PermissionGuard>
          }
        />

        {/* Student Records & Deep Link :studentId */}
        <Route
          path={ROUTES.STUDENTS}
          element={
            <PermissionGuard module="students" action="view">
              <StudentManagementView />
            </PermissionGuard>
          }
        />
        <Route
          path={ROUTES.STUDENT_DETAIL}
          element={
            <PermissionGuard module="students" action="view">
              <StudentManagementView />
            </PermissionGuard>
          }
        />

        {/* Admissions & CRM */}
        <Route
          path={ROUTES.ADMISSIONS}
          element={
            <PermissionGuard module="admissions_crm" action="view">
              <AdmissionsCrmView />
            </PermissionGuard>
          }
        />
        <Route path="/admissions-crm" element={<Navigate to={ROUTES.ADMISSIONS} replace />} />

        {/* Attendance & Biometrics */}
        <Route
          path={ROUTES.ATTENDANCE}
          element={
            <PermissionGuard module="attendance" action="view">
              <AttendanceManagementView />
            </PermissionGuard>
          }
        />

        {/* Academic Master & Curriculum */}
        <Route
          path={ROUTES.ACADEMIC}
          element={
            <PermissionGuard module="academic" action="view">
              <AcademicManagementView />
            </PermissionGuard>
          }
        />

        {/* Examination & OMR Evaluation */}
        <Route
          path={ROUTES.EXAMINATIONS}
          element={
            <PermissionGuard module="examination" action="view">
              <ExaminationOmrView />
            </PermissionGuard>
          }
        />
        <Route path="/examination" element={<Navigate to={ROUTES.EXAMINATIONS} replace />} />

        {/* Fees Ledger & New Payment Deep Link */}
        <Route
          path={ROUTES.FEES}
          element={
            <PermissionGuard module="fees" action="view">
              <FeesAccountsView />
            </PermissionGuard>
          }
        />
        <Route
          path={ROUTES.FEES_PAYMENT_NEW}
          element={
            <PermissionGuard module="fees" action="collect">
              <FeesAccountsView autoOpenPayment />
            </PermissionGuard>
          }
        />

        {/* Campus & Infrastructure */}
        <Route
          path={ROUTES.CAMPUS}
          element={
            <PermissionGuard module="branches" action="view">
              <BranchManagementView />
            </PermissionGuard>
          }
        />

        {/* Communication & Broadcasts */}
        <Route
          path={ROUTES.COMMUNICATION}
          element={
            <PermissionGuard module="communication" action="view">
              <CommunicationCentreView />
            </PermissionGuard>
          }
        />

        {/* Financial & Institutional Reports */}
        <Route
          path={ROUTES.REPORTS}
          element={
            <PermissionGuard module="reports" action="view">
              <ReportsAnalyticsView />
            </PermissionGuard>
          }
        />

        {/* Security & Audit Logs */}
        <Route
          path={ROUTES.AUDIT_LOGS}
          element={
            <PermissionGuard module="audit_logs" action="view">
              <AuditLogsView />
            </PermissionGuard>
          }
        />

        {/* Document Vault */}
        <Route
          path={ROUTES.DOCUMENTS}
          element={
            <PermissionGuard module="documents" action="view">
              <DocumentVaultView />
            </PermissionGuard>
          }
        />

        {/* Inventory & Assets */}
        <Route
          path={ROUTES.INVENTORY}
          element={
            <PermissionGuard module="inventory" action="view">
              <InventoryAssetsView />
            </PermissionGuard>
          }
        />

        {/* CHTQ Scholarship */}
        <Route
          path={ROUTES.CHTQ}
          element={
            <PermissionGuard module="chtq_scholarship" action="view">
              <ChtqScholarshipView />
            </PermissionGuard>
          }
        />
        <Route path="/chtq-scholarship" element={<Navigate to={ROUTES.CHTQ} replace />} />

        {/* HR & Staff Directory */}
        <Route
          path={ROUTES.HR_STAFF}
          element={
            <PermissionGuard module="hr_staff" action="view">
              <HrStaffManagementView />
            </PermissionGuard>
          }
        />

        {/* Dedicated Portals */}
        <Route
          path={ROUTES.STUDENT_PORTAL}
          element={
            <PermissionGuard module="student_portal" action="view" allowedRoles={['student']}>
              <StudentPortalView />
            </PermissionGuard>
          }
        />

        <Route
          path={ROUTES.PARENT_PORTAL}
          element={
            <PermissionGuard module="parent_portal" action="view" allowedRoles={['parent']}>
              <ParentPortalView />
            </PermissionGuard>
          }
        />

        <Route
          path={ROUTES.TEACHER_PORTAL}
          element={
            <PermissionGuard module="faculty_portal" action="view" allowedRoles={['teacher']}>
              <FacultyPortalView />
            </PermissionGuard>
          }
        />
        <Route path="/faculty" element={<Navigate to={ROUTES.TEACHER_PORTAL} replace />} />
      </Route>

      {/* =================================================== */}
      {/* 404 NOT FOUND (CATCH-ALL)                           */}
      {/* =================================================== */}
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
};
