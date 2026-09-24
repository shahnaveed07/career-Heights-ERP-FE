import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useErpData } from '../context/ErpDataContext';
import {
  getVisibleStudents,
  getVisibleTeachers,
  getVisibleStaff,
  getVisibleFees,
  getVisibleAttendance,
  getVisibleBatches,
  getVisibleWings,
  getVisibleExams,
  getVisibleEnquiries,
  getVisibleAssets,
  getVisibleDocuments,
  getVisibleCommunications,
  getVisibleSalaries,
  getVisibleChtqCandidates,
  getVisibleTeacherAttendance,
  getVisibleReports,
  isAllBranches,
} from '../utils/branchScoping';

/**
 * Custom hook providing fully scoped ERP collections and branch utilities
 * strictly bound to the currently active branch.
 */
export function useBranchScopedData() {
  const { activeBranchFilter, activeBranchId: authActiveBranch, currentUser } = useAuth();
  const erp = useErpData();

  const activeBranchId = authActiveBranch || activeBranchFilter || 'all';

  const scopedStudents = useMemo(() => {
    return getVisibleStudents(erp.students, activeBranchId);
  }, [erp.students, activeBranchId]);

  const scopedTeachers = useMemo(() => {
    return getVisibleTeachers(erp.employees, activeBranchId, erp.teacherAssignments);
  }, [erp.employees, activeBranchId, erp.teacherAssignments]);

  const scopedStaff = useMemo(() => {
    return getVisibleStaff(erp.employees, activeBranchId);
  }, [erp.employees, activeBranchId]);

  const scopedFees = useMemo(() => {
    return getVisibleFees(erp.feeReceipts, activeBranchId, erp.students, erp.branches);
  }, [erp.feeReceipts, activeBranchId, erp.students, erp.branches]);

  const scopedAttendance = useMemo(() => {
    return getVisibleAttendance(erp.attendanceRecords, activeBranchId, erp.students);
  }, [erp.attendanceRecords, activeBranchId, erp.students]);

  const scopedBatches = useMemo(() => {
    return getVisibleBatches(erp.batches, activeBranchId);
  }, [erp.batches, activeBranchId]);

  const scopedWings = useMemo(() => {
    return getVisibleWings(erp.wings, activeBranchId);
  }, [erp.wings, activeBranchId]);

  const scopedExams = useMemo(() => {
    return getVisibleExams(erp.tests, activeBranchId);
  }, [erp.tests, activeBranchId]);

  const scopedEnquiries = useMemo(() => {
    return getVisibleEnquiries(erp.enquiries, activeBranchId);
  }, [erp.enquiries, activeBranchId]);

  const scopedAssets = useMemo(() => {
    return getVisibleAssets(erp.assets, activeBranchId);
  }, [erp.assets, activeBranchId]);

  const scopedDocuments = useMemo(() => {
    return getVisibleDocuments(erp.documents, activeBranchId, erp.students, erp.employees);
  }, [erp.documents, activeBranchId, erp.students, erp.employees]);

  const scopedCommunications = useMemo(() => {
    return getVisibleCommunications(erp.notifications, activeBranchId);
  }, [erp.notifications, activeBranchId]);

  const scopedSalaries = useMemo(() => {
    return getVisibleSalaries(erp.salaries, activeBranchId);
  }, [erp.salaries, activeBranchId]);

  const scopedChtqCandidates = useMemo(() => {
    return getVisibleChtqCandidates(erp.chtqCandidates, activeBranchId);
  }, [erp.chtqCandidates, activeBranchId]);

  const scopedTeacherAttendance = useMemo(() => {
    return getVisibleTeacherAttendance(erp.teacherAttendanceRecords, activeBranchId, erp.employees);
  }, [erp.teacherAttendanceRecords, activeBranchId, erp.employees]);

  const scopedReports = useMemo(() => {
    return getVisibleReports(
      {
        students: erp.students,
        feeReceipts: erp.feeReceipts,
        attendanceRecords: erp.attendanceRecords,
        batches: erp.batches,
        branches: erp.branches,
        employees: erp.employees,
        enquiries: erp.enquiries,
        tests: erp.tests,
      },
      activeBranchId
    );
  }, [
    erp.students,
    erp.feeReceipts,
    erp.attendanceRecords,
    erp.batches,
    erp.branches,
    erp.employees,
    erp.enquiries,
    erp.tests,
    activeBranchId,
  ]);

  const activeBranchObject = useMemo(() => {
    if (isAllBranches(activeBranchId)) return null;
    return erp.branches.find((b) => b.id === activeBranchId) || null;
  }, [erp.branches, activeBranchId]);

  return {
    activeBranchId,
    isAllBranches: isAllBranches(activeBranchId),
    activeBranchObject,
    activeBranchName: activeBranchObject?.name || 'All Campuses (Consolidated)',
    currentUser,
    // Scoped Data
    scopedStudents,
    scopedTeachers,
    scopedStaff,
    scopedFees,
    scopedAttendance,
    scopedBatches,
    scopedWings,
    scopedExams,
    scopedEnquiries,
    scopedAssets,
    scopedDocuments,
    scopedCommunications,
    scopedSalaries,
    scopedChtqCandidates,
    scopedTeacherAttendance,
    scopedReports,
    // Raw collections for reference if needed
    raw: erp,
  };
}
