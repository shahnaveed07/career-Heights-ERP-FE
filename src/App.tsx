import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErpDataProvider } from './context/ErpDataContext';
import { AppLayout } from './components/layout/AppLayout';

// Core ERP Views
import { LoginView } from './views/LoginView';
import { CeoDashboardView } from './views/CeoDashboardView';
import { StudentManagementView } from './views/StudentManagementView';
import { AdmissionsCrmView } from './views/AdmissionsCrmView';
import { AttendanceManagementView } from './views/AttendanceManagementView';
import { FeesAccountsView } from './views/FeesAccountsView';
import { AcademicManagementView } from './views/AcademicManagementView';
import { ExaminationOmrView } from './views/ExaminationOmrView';
import { StudentPortalView } from './views/StudentPortalView';
import { ParentPortalView } from './views/ParentPortalView';
import { FacultyPortalView } from './views/FacultyPortalView';
import { BranchManagementView } from './views/BranchManagementView';
import { ChtqScholarshipView } from './views/ChtqScholarshipView';
import { HrStaffManagementView } from './views/HrStaffManagementView';
import { DocumentVaultView } from './views/DocumentVaultView';
import { CommunicationCentreView } from './views/CommunicationCentreView';
import { InventoryAssetsView } from './views/InventoryAssetsView';
import { AuditLogsView } from './views/AuditLogsView';
import { ReportsAnalyticsView } from './views/ReportsAnalyticsView';

const MODULE_PERMISSIONS: Record<string, string[]> = {
  dashboard: ['*'],
  ceo_dashboard: ['ceo', 'hq_admin'],
  student_portal: ['student', 'ceo', 'hq_admin', 'branch_admin'],
  parent_portal: ['parent', 'ceo', 'hq_admin', 'branch_admin'],
  faculty_portal: ['faculty', 'ceo', 'hq_admin', 'branch_admin'],
  students: ['ceo', 'hq_admin', 'branch_admin', 'faculty', 'counsellor', 'accountant'],
  admissions_crm: ['ceo', 'hq_admin', 'branch_admin', 'counsellor'],
  attendance: ['ceo', 'hq_admin', 'branch_admin', 'faculty'],
  academic: ['ceo', 'hq_admin', 'branch_admin', 'faculty', 'student', 'parent'],
  examination: ['ceo', 'hq_admin', 'branch_admin', 'faculty', 'student', 'parent'],
  fees: ['ceo', 'hq_admin', 'branch_admin', 'accountant', 'parent'],
  branch_management: ['ceo', 'hq_admin'],
  chtq_scholarship: ['ceo', 'hq_admin', 'branch_admin', 'counsellor'],
  hr_staff: ['ceo', 'hq_admin', 'branch_admin', 'hr_manager'],
  documents: ['*'],
  communication: ['ceo', 'hq_admin', 'branch_admin', 'counsellor', 'hr_manager', 'faculty'],
  inventory: ['ceo', 'hq_admin', 'branch_admin'],
  audit_logs: ['ceo', 'hq_admin'],
  reports: ['ceo', 'hq_admin', 'branch_admin', 'accountant'],
};

const ErpContent: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [focusedStudentId, setFocusedStudentId] = useState<string | null>(null);

  // Set default module based on user role upon login or role-switch
  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.role === 'student') {
      setActiveModule('student_portal');
    } else if (currentUser.role === 'parent') {
      setActiveModule('parent_portal');
    } else if (currentUser.role === 'faculty') {
      setActiveModule('faculty_portal');
    } else if (currentUser.role === 'counsellor') {
      setActiveModule('admissions_crm');
    } else if (currentUser.role === 'accountant') {
      setActiveModule('fees');
    } else if (currentUser.role === 'hr_manager') {
      setActiveModule('hr_staff');
    } else {
      setActiveModule('ceo_dashboard');
    }
  }, [currentUser?.role, currentUser?.id]);

  if (!isAuthenticated || !currentUser) {
    return <LoginView />;
  }

  const handleNavigateToStudent = (studentId: string) => {
    setFocusedStudentId(studentId);
    setActiveModule('students');
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        if (currentUser.role === 'student') return <StudentPortalView />;
        if (currentUser.role === 'parent') return <ParentPortalView />;
        if (currentUser.role === 'faculty') return <FacultyPortalView />;
        if (currentUser.role === 'counsellor') return <AdmissionsCrmView />;
        if (currentUser.role === 'accountant') return <FeesAccountsView />;
        if (currentUser.role === 'hr_manager') return <HrStaffManagementView />;
        return (
          <CeoDashboardView
            onNavigateToStudent={handleNavigateToStudent}
            onNavigateToModule={setActiveModule}
          />
        );

      case 'ceo_dashboard':
        return (
          <CeoDashboardView
            onNavigateToStudent={handleNavigateToStudent}
            onNavigateToModule={setActiveModule}
          />
        );

      case 'student_portal':
        return <StudentPortalView />;

      case 'parent_portal':
        return <ParentPortalView />;

      case 'faculty_portal':
        return <FacultyPortalView />;

      case 'students':
        return (
          <StudentManagementView
            initialStudentId={focusedStudentId || undefined}
          />
        );

      case 'admissions_crm':
        return <AdmissionsCrmView />;

      case 'attendance':
        return <AttendanceManagementView />;

      case 'academic':
        return <AcademicManagementView />;

      case 'examination':
        return <ExaminationOmrView />;

      case 'fees':
        return <FeesAccountsView />;

      case 'branch_management':
        return <BranchManagementView />;

      case 'chtq_scholarship':
        return <ChtqScholarshipView />;

      case 'hr_staff':
        return <HrStaffManagementView />;

      case 'documents':
        return <DocumentVaultView />;

      case 'communication':
        return <CommunicationCentreView />;

      case 'inventory':
        return <InventoryAssetsView />;

      case 'audit_logs':
        return <AuditLogsView />;

      case 'reports':
        return <ReportsAnalyticsView />;

      default:
        return (
          <CeoDashboardView
            onNavigateToStudent={handleNavigateToStudent}
            onNavigateToModule={setActiveModule}
          />
        );
    }
  };

  return (
    <AppLayout activeModule={activeModule} onSelectModule={setActiveModule}>
      {renderActiveModule()}
    </AppLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ErpDataProvider>
        <ErpContent />
      </ErpDataProvider>
    </AuthProvider>
  );
}
