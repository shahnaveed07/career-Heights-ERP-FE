import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  INITIAL_STUDENTS,
  INITIAL_BRANCHES,
  INITIAL_WINGS,
  INITIAL_CLASSES,
  INITIAL_BATCHES,
  INITIAL_SUBJECTS,
  INITIAL_SUBJECT_COMBOS,
  INITIAL_TEACHER_ASSIGNMENTS,
  INITIAL_CUSTOM_ROLES,
  INITIAL_ENQUIRIES,
  INITIAL_FEE_PAYMENTS,
  INITIAL_FEE_RECEIPTS,
  INITIAL_SALARIES,
  INITIAL_TESTS,
  INITIAL_TEST_RESULTS,
  INITIAL_TIMETABLE,
  INITIAL_SYLLABUS,
  INITIAL_HOMEWORK,
  INITIAL_DOUBTS,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STAFF,
  INITIAL_LEAVES,
  INITIAL_ASSETS,
  INITIAL_CHTQ_SCHOOLS,
  INITIAL_CHTQ_CANDIDATES,
  INITIAL_AUDIT_LOGS,
  INITIAL_TEACHER_ATTENDANCE,
  INITIAL_PARENT_NOTIFICATIONS,
  VALID_STUDENT_AVATARS,
  generateInitialAttendanceRecords,
} from '../data/mockData';
import {
  createAbsenceNotificationEvent,
  createAttendanceNotificationEvent,
  createPaymentConfirmationNotificationEvent,
  createReceiptNotificationEvent,
} from '../utils/parentNotificationEvents';
import { buildAuditEvent } from '../services/auditService';
import { buildNotificationEvent, NOTIFICATION_EVENTS } from '../services/notificationService';
import { useAuth } from './AuthContext';
import { getTodayDateString } from '../utils/dateUtils';
import {
  generateNextStudentId,
  generateNextReceiptNo,
  generateNextPaymentId,
  generateNextTransactionRef,
  isTransactionRefDuplicate,
} from '../utils/idGenerators';
import { INSTITUTE_CONFIG } from '../config/instituteConfig';
import {
  calculateStudentAttendanceSummary,
  upsertAttendanceRecord,
} from '../utils/attendanceCalculator';
import {
  getVisibleStudents,
  getVisibleTeachers,
  getVisibleStaff,
  getVisibleFees,
  getVisiblePayments,
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
import {
  CANONICAL_SUBJECTS,
  CANONICAL_SUBJECT_COMBOS,
  getClassesForBranch,
  getWingsForClass,
  getBatchesByHierarchy,
  getStudentEnrolledSubjects,
  getStudentEnrolledSubjectIds,
  isStudentEnrolledInSubject,
  getStudentsForTeacher,
} from '../utils/academicModel';
const ErpDataContext = createContext(void 0);
export const ErpDataProvider = ({ children }) => {
  const { currentUser, setCustomRolesRegistry, activeBranchId, activeBranchFilter } = useAuth();
  const currentActiveBranch = activeBranchId || activeBranchFilter || 'all';
  const [branches, setBranches] = useState(INITIAL_BRANCHES);
  const [wings] = useState(INITIAL_WINGS);
  const [classes] = useState(INITIAL_CLASSES);
  const [batches] = useState(INITIAL_BATCHES);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [enquiries, setEnquiries] = useState(INITIAL_ENQUIRIES);
  const [feePayments, setFeePayments] = useState(INITIAL_FEE_PAYMENTS);
  const [feeReceipts, setFeeReceipts] = useState(INITIAL_FEE_RECEIPTS);
  const [tests, setTests] = useState(INITIAL_TESTS);
  const [testResults, setTestResults] = useState(INITIAL_TEST_RESULTS);
  const [timetable] = useState(INITIAL_TIMETABLE);
  const [syllabus, setSyllabus] = useState(INITIAL_SYLLABUS);
  const [homework, setHomework] = useState(INITIAL_HOMEWORK);
  const [doubts, setDoubts] = useState(INITIAL_DOUBTS);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [employees, setEmployees] = useState(INITIAL_STAFF);
  const [leaveRequests, setLeaveRequests] = useState(INITIAL_LEAVES);
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [chtqSchools] = useState(INITIAL_CHTQ_SCHOOLS);
  const [chtqCandidates, setChtqCandidates] = useState(INITIAL_CHTQ_CANDIDATES);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    return generateInitialAttendanceRecords(INITIAL_STUDENTS);
  });

  // Academic Master State
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [subjectCombos, setSubjectCombos] = useState(INITIAL_SUBJECT_COMBOS);
  const [teacherAssignments, setTeacherAssignments] = useState(INITIAL_TEACHER_ASSIGNMENTS);
  const [customRoles, setCustomRoles] = useState(INITIAL_CUSTOM_ROLES);

  useEffect(() => {
    if (setCustomRolesRegistry) {
      setCustomRolesRegistry(customRoles);
    }
  }, [customRoles, setCustomRolesRegistry]);
  const [salaries, setSalaries] = useState(INITIAL_SALARIES);
  const [teacherAttendanceRecords, setTeacherAttendanceRecords] = useState(INITIAL_TEACHER_ATTENDANCE);
  const [parentNotifications, setParentNotifications] = useState(INITIAL_PARENT_NOTIFICATIONS);

  const addParentNotification = (notifData) => {
    const id = notifData.id || `pnotif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newNotif = {
      id,
      eventId: notifData.eventId || id,
      timestamp: notifData.timestamp || new Date().toISOString(),
      date: notifData.date || getTodayDateString(),
      channel: 'in_app_dossier',
      deliveryStatus: 'recorded_locally',
      statusMessage: 'Demo action recorded locally.',
      read: false,
      ...notifData,
    };
    setParentNotifications((prev) => [newNotif, ...prev]);
    return newNotif;
  };
  const addAuditLog = (action, module, details, meta = {}) => {
    const newLog = buildAuditEvent({
      actorId: currentUser?.id || 'sys',
      actorName: currentUser?.name || 'System User',
      userRole: currentUser?.roleTitle || 'Authorized Staff',
      action,
      module,
      details,
      targetEntity: meta.targetEntity || module || 'System',
      targetId: meta.targetId || 'N/A',
      oldValue: meta.oldValue !== undefined ? meta.oldValue : null,
      newValue: meta.newValue !== undefined ? meta.newValue : null,
      branchId: meta.branchId || currentUser?.branchId || 'b-hdw',
      severity: meta.severity || 'info',
    });
    setAuditLogs((prev) => [newLog, ...prev]);
    return newLog;
  };
  const addStudent = (studentData) => {
    const { studentId, id, admissionNo } = generateNextStudentId(students);
    const branch =
      branches.find((b) => b.id === studentData.branchId) || branches[0];
    const batch =
      batches.find((b) => b.id === studentData.batchId) || batches[0];
    const totalFee = studentData.feesTotal || 95e3;
    const paid = studentData.feesPaid || 0;
    const pending = Math.max(0, totalFee - paid);
    const admDate = studentData.admissionDate || getTodayDateString();
    const newStudent = {
      id,
      studentId,
      admissionNo,
      name: studentData.name || 'New Student',
      photo:
        studentData.photo ||
        VALID_STUDENT_AVATARS[students.length % VALID_STUDENT_AVATARS.length],
      gender: studentData.gender || 'Male',
      dob: studentData.dob || '2008-05-15',
      email: studentData.email || `student.${id}@careerheights.demo`,
      phone: studentData.phone || '+91 97970 99999',
      address: studentData.address || `${branch.name} Town, J&K`,
      branchId: branch.id,
      branchName: branch.name,
      classId: studentData.classId || batch.classId,
      className: studentData.className || batch.className || 'Class 12',
      wingId: studentData.wingId || batch.wingId,
      wingName: studentData.wingName || batch.wingName || 'Medical',
      batchId: batch.id,
      batchName: batch.name,
      subjectComboId: studentData.subjectComboId || null,
      enrolledSubjects:
        Array.isArray(studentData.enrolledSubjects) && studentData.enrolledSubjects.length > 0
          ? studentData.enrolledSubjects
          : studentData.subjectComboId === 'combo-med'
          ? ['sub-phy', 'sub-chem', 'sub-bot', 'sub-zoo']
          : studentData.subjectComboId === 'combo-eng'
          ? ['sub-phy', 'sub-chem', 'sub-math']
          : ['sub-phy'],
      parentName: studentData.parentName || studentData.fatherName || 'Parent Guardian',
      parentPhone: studentData.parentPhone || studentData.fatherPhone || '+91 94191 99999',
      parentEmail: studentData.parentEmail || 'parent@gmail.demo',
      parentOccupation: studentData.parentOccupation || 'Self-Employed',
      fatherName: studentData.fatherName || studentData.parentName || 'Father',
      fatherPhone: studentData.fatherPhone || studentData.parentPhone || '+91 94191 99999',
      motherName: studentData.motherName || 'Mother',
      motherPhone: studentData.motherPhone || '+91 94191 88888',
      guardianName: studentData.guardianName || studentData.parentName || 'Guardian',
      guardianPhone: studentData.guardianPhone || studentData.parentPhone || '+91 94191 99999',
      guardianEmail: studentData.guardianEmail || studentData.parentEmail || 'guardian@demo.com',
      schoolName: studentData.schoolName || 'Govt Model School',
      previousPercentage: studentData.previousPercentage || 88.5,
      admissionDate: admDate,
      admissionSource: studentData.admissionSource || 'Direct Walk-in',
      scholarshipType: studentData.scholarshipType || 'None',
      scholarshipPercent: studentData.scholarshipPercent || 0,
      status: 'active',
      attendanceRate: 100,
      feesTotal: totalFee,
      feesPaid: paid,
      feesPending: pending,
      feesOverdue: 0,
      academicRisk: 'Low',
      documentsCount: studentData.documentsCount !== undefined ? studentData.documentsCount : 3,
      pendingDocuments: studentData.pendingDocuments !== undefined ? studentData.pendingDocuments : 1,
      submittedDocuments: studentData.submittedDocuments || ['Aadhaar Card', '10th Marksheet'],
      portalLoginUsername: studentData.portalLoginUsername || `ch.${id.replace('st-', '')}.26`,
      portalLoginTemporaryPassword: studentData.portalLoginTemporaryPassword || 'CH@2026!',
      remarks:
        studentData.remarks || 'Newly enrolled student. Orientation scheduled.',
    };
    setStudents((prev) => [newStudent, ...prev]);
    if (paid > 0) {
      const initPayId = generateNextPaymentId(feePayments);
      const { receiptNo: initRcptNo, id: initRcptId } =
        generateNextReceiptNo(feeReceipts);
      const payMethod = studentData.paymentMethod || 'UPI';
      const txnRef =
        studentData.transactionRef ||
        generateNextTransactionRef(payMethod, feePayments, feeReceipts);

      const initialPayment = {
        id: initPayId,
        studentId: newStudent.id,
        studentName: newStudent.name,
        studentCode: newStudent.studentId,
        branchId: newStudent.branchId,
        branchName: newStudent.branchName,
        batchName: newStudent.batchName,
        amount: paid,
        dateTime: new Date().toISOString(),
        date: admDate,
        paymentMethod: payMethod,
        transactionRef: txnRef,
        installment: 'Admission & Term 1 Installment',
        notes: 'Initial admission installment recorded upon enrollment.',
        recordedBy: currentUser?.name || 'Accounts Desk',
        status: 'Completed',
        receiptId: initRcptId,
      };

      const initialReceipt = {
        id: initRcptId,
        receiptNo: initRcptNo,
        paymentId: initPayId,
        studentId: newStudent.id,
        studentName: newStudent.name,
        studentCode: newStudent.studentId,
        branchId: newStudent.branchId,
        branchName: newStudent.branchName,
        batchName: newStudent.batchName,
        amount: paid,
        paymentMethod: payMethod,
        transactionRef: txnRef,
        installment: 'Admission & Term 1 Installment',
        date: admDate,
        dateTime: initialPayment.dateTime,
        receivedBy: currentUser?.name || 'Accounts Desk',
        notes: 'Initial admission installment recorded upon enrollment.',
      };

      setFeePayments((prev) => [initialPayment, ...prev]);
      setFeeReceipts((prev) => [initialReceipt, ...prev]);
    }
    setAttendanceRecords((prev) => {
      return upsertAttendanceRecord(prev, newStudent.id, admDate, 'present', {
        studentName: newStudent.name,
        studentCode: newStudent.studentId,
        batchId: newStudent.batchId,
        batchName: newStudent.batchName,
        branchId: newStudent.branchId,
        markedBy: currentUser?.name || 'Academic Coordinator',
      });
    });
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branch.id ? { ...b, studentCount: b.studentCount + 1 } : b
      )
    );
    addAuditLog(
      'Created New Student Record',
      'Student Management',
      `Enrolled ${newStudent.name} (${newStudent.studentId}) in batch ${newStudent.batchName} at ${newStudent.branchName}.`
    );
    return newStudent;
  };
  const updateStudent = (id, updates) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    addAuditLog(
      'Updated Student Profile',
      'Student Management',
      `Modified profile for record ID: ${id}`
    );
  };
  const addEnquiry = (enquiryData) => {
    const branch =
      branches.find((b) => b.id === enquiryData.branchId) || branches[0];
    const today = getTodayDateString();
    const newEnq = {
      id: `enq-${Date.now()}`,
      studentName: enquiryData.studentName || 'Prospective Student',
      parentName: enquiryData.parentName || 'Guardian',
      phone: enquiryData.phone || '+91 94190 00000',
      email: enquiryData.email || 'enquiry@gmail.demo',
      currentClass: enquiryData.currentClass || 'Class 10',
      targetCourse: enquiryData.targetCourse || 'JEE Main & Advanced',
      branchId: branch.id,
      branchName: branch.name,
      counsellorId: currentUser?.id || 'emp-003',
      counsellorName: currentUser?.name || 'Mehak Khan',
      status: 'new',
      source: enquiryData.source || 'Direct Walk-in',
      priority: enquiryData.priority || 'medium',
      date: enquiryData.date || today,
      nextFollowUp: new Date(Date.now() + 864e5 * 2)
        .toISOString()
        .split('T')[0],
      notes: enquiryData.notes || 'Inquired regarding admission details.',
      counsellingHistory: [
        {
          date: today,
          notes: 'Initial enquiry registered.',
          by: currentUser?.name || 'Staff',
        },
      ],
    };
    setEnquiries((prev) => [newEnq, ...prev]);
    addAuditLog(
      'Registered New Admission Enquiry',
      'Admission & Enquiry CRM',
      `Candidate ${newEnq.studentName} for course ${newEnq.targetCourse} at ${newEnq.branchName}.`
    );
  };
  const updateEnquiryStatus = (id, status, lostReason) => {
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status, lostReason: lostReason || e.lostReason }
          : e
      )
    );
    addAuditLog(
      'Updated Enquiry Pipeline Stage',
      'Admission & Enquiry CRM',
      `Moved enquiry #${id} to status "${status}".`
    );
  };
  const convertEnquiryToAdmission = (enquiryId, options) => {
    const enq = enquiries.find((e) => e.id === enquiryId);
    if (!enq) return null;
    const targetBranchId = options?.branchId || enq.branchId;
    const branch = branches.find((b) => b.id === targetBranchId) || branches[0];
    let selectedBatch = options?.batchId
      ? batches.find((b) => b.id === options.batchId)
      : void 0;
    if (!selectedBatch) {
      selectedBatch =
        batches.find(
          (b) =>
            b.branchId === branch.id &&
            (b.className === enq.targetCourse ||
              b.name
                .toLowerCase()
                .includes(enq.targetCourse?.toLowerCase() || ''))
        ) ||
        batches.find((b) => b.branchId === branch.id) ||
        batches[0];
    }
    const preservedSource =
      options?.admissionSource || enq.source || 'Direct Walk-in';
    const newStudent = addStudent({
      name: enq.studentName || enq.name || 'Enrolled Student',
      parentName: enq.parentName || 'Parent Guardian',
      phone: enq.phone || '+91 94190 00000',
      email: enq.email || 'student@careerheights.demo',
      branchId: branch.id,
      branchName: branch.name,
      batchId: selectedBatch.id,
      batchName: selectedBatch.name,
      admissionSource: preservedSource,
      admissionDate: getTodayDateString(),
      status: 'active',
      feesTotal: options?.feesTotal !== void 0 ? options.feesTotal : 95e3,
      feesPaid: options?.feesPaid !== void 0 ? options.feesPaid : 25e3,
      remarks: `Enrolled from CRM Enquiry #${enq.id}. Target Course: ${enq.targetCourse}. Counsellor: ${enq.counsellorName || enq.assignedCounsellor || 'Admissions Desk'}.`,
    });
    updateEnquiryStatus(enquiryId, 'admission');
    addAuditLog(
      'Converted Enquiry to Admission',
      'Admission & Enquiry CRM',
      `Enrolled lead ${enq.studentName || enq.name} with source "${preservedSource}" into branch "${branch.name}", batch "${selectedBatch.name}".`
    );
    return newStudent;
  };
  const addCounsellingNote = (id, note) => {
    setEnquiries((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const newEntry = {
            date: getTodayDateString(),
            notes: note,
            by: currentUser?.name || 'Counsellor',
          };
          return {
            ...e,
            counsellingHistory: [...e.counsellingHistory, newEntry],
          };
        }
        return e;
      })
    );
    addAuditLog(
      'Added Counselling Interaction Note',
      'Admission & Enquiry CRM',
      `Added note to enquiry ID: ${id}`
    );
  };
  const markBatchAttendance = (batchId, dateOrRecords, maybeStatus) => {
    const batch = batches.find((b) => b.id === batchId);
    const dateStr =
      typeof dateOrRecords === 'string' ? dateOrRecords : getTodayDateString();
    const batchStudents = students.filter((s) => s.batchId === batchId);
    setAttendanceRecords((prev) => {
      let currentRecords = [...prev];
      if (typeof dateOrRecords === 'string' && maybeStatus) {
        for (const s of batchStudents) {
          currentRecords = upsertAttendanceRecord(
            currentRecords,
            s.id,
            dateStr,
            maybeStatus,
            {
              studentName: s.name,
              studentCode: s.studentId,
              batchId: s.batchId,
              batchName: s.batchName,
              branchId: s.branchId,
              markedBy: currentUser?.name || 'Faculty / Mentor',
            }
          );
        }
      } else if (Array.isArray(dateOrRecords)) {
        for (const r of dateOrRecords) {
          const s = batchStudents.find((st) => st.id === r.studentId);
          if (s) {
            currentRecords = upsertAttendanceRecord(
              currentRecords,
              s.id,
              dateStr,
              r.status,
              {
                studentName: s.name,
                studentCode: s.studentId,
                batchId: s.batchId,
                batchName: s.batchName,
                branchId: s.branchId,
                markedBy: currentUser?.name || 'Faculty / Mentor',
              }
            );
          }
        }
      }
      return currentRecords;
    });
    setTimeout(() => {
      setAttendanceRecords((currentRecords) => {
        setStudents((prevStudents) =>
          prevStudents.map((s) => {
            if (s.batchId === batchId) {
              const summary = calculateStudentAttendanceSummary(
                s.id,
                currentRecords
              );
              return {
                ...s,
                attendanceRate: summary.rate,
                academicRisk:
                  summary.rate < 75
                    ? 'Critical'
                    : summary.rate < 80
                      ? 'Medium'
                      : 'Low',
              };
            }
            return s;
          })
        );
        return currentRecords;
      });
    }, 0);
    addAuditLog(
      'Marked Batch Attendance',
      'Attendance',
      `Recorded attendance for batch ${batch?.name || batchId} on ${dateStr}.`
    );
  };
  const markStudentAttendance = (studentId, dateOrStatus, maybeStatus) => {
    const dateStr = maybeStatus ? dateOrStatus : getTodayDateString();
    const status = maybeStatus || dateOrStatus;
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    setAttendanceRecords((prev) => {
      return upsertAttendanceRecord(prev, studentId, dateStr, status, {
        studentName: student.name,
        studentCode: student.studentId,
        batchId: student.batchId,
        batchName: student.batchName,
        branchId: student.branchId,
        markedBy: currentUser?.name || 'Faculty / Mentor',
      });
    });

    // Enqueue parent notification event structure (cleanly replacing same-day attendance notification)
    if (status === 'absent') {
      const newEvent = createAbsenceNotificationEvent({ student, date: dateStr, session: 'Morning Lecture' });
      setParentNotifications((prev) => [
        newEvent,
        ...prev.filter((n) => !(n.studentId === student.id && (n.type === 'absence' || n.type === 'attendance') && n.metadata?.date === dateStr)),
      ]);
    } else if (status === 'present' || status === 'late') {
      const newEvent = createAttendanceNotificationEvent({ student, date: dateStr, checkInTime: '08:30 AM', status });
      setParentNotifications((prev) => [
        newEvent,
        ...prev.filter((n) => !(n.studentId === student.id && (n.type === 'absence' || n.type === 'attendance') && n.metadata?.date === dateStr)),
      ]);
    }

    setTimeout(() => {
      setAttendanceRecords((currentRecords) => {
        const summary = calculateStudentAttendanceSummary(
          studentId,
          currentRecords
        );
        setStudents((prevStudents) =>
          prevStudents.map((s) => {
            if (s.id === studentId) {
              const newRate = summary.rate;
              return {
                ...s,
                attendanceRate: newRate,
                academicRisk:
                  newRate < 75 ? 'Critical' : newRate < 80 ? 'Medium' : 'Low',
              };
            }
            return s;
          })
        );
        return currentRecords;
      });
    }, 0);
    addAuditLog(
      'Marked Student Attendance',
      'Attendance',
      `Marked ${student.name} as ${status.toUpperCase()} on ${dateStr}.`
    );
  };
  const calculateStudentInstallments = (student, studentPayments = []) => {
    if (!student) return [];
    const total = student.feesTotal || 0;
    const paid = student.feesPaid || 0;

    // Standard 3-installment fee breakdown
    const inst1Amount = Math.round(total * 0.4);
    const inst2Amount = Math.round(total * 0.35);
    const inst3Amount = Math.max(0, total - inst1Amount - inst2Amount);

    const admissionYear = student.admissionDate ? new Date(student.admissionDate).getFullYear() : 2025;

    const schedules = [
      {
        installmentNumber: 1,
        name: 'Admission & Term 1 Installment',
        amount: inst1Amount,
        dueDate: `${admissionYear}-05-15`,
      },
      {
        installmentNumber: 2,
        name: 'Term 2 Mid-Session Installment',
        amount: inst2Amount,
        dueDate: `${admissionYear}-09-30`,
      },
      {
        installmentNumber: 3,
        name: 'Final Exam Preparation Installment',
        amount: inst3Amount,
        dueDate: `${admissionYear + 1}-01-15`,
      },
    ];

    let cumulativePaid = paid;
    return schedules.map((inst) => {
      const paidForThis = Math.min(inst.amount, Math.max(0, cumulativePaid));
      cumulativePaid -= paidForThis;
      const remaining = inst.amount - paidForThis;
      let status = 'Pending';
      if (remaining === 0 && inst.amount > 0) {
        status = 'Paid';
      } else if (paidForThis > 0) {
        status = 'Partial';
      } else if (new Date(inst.dueDate) < new Date()) {
        status = 'Overdue';
      }

      return {
        ...inst,
        paidAmount: paidForThis,
        remainingAmount: remaining,
        status,
      };
    });
  };

  const getStudentFeeDetails = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return null;
    const studentPayments = feePayments.filter((p) => p.studentId === studentId);
    const studentReceipts = feeReceipts.filter((r) => r.studentId === studentId);
    const installments = calculateStudentInstallments(student, studentPayments);
    return {
      student,
      totalFee: student.feesTotal,
      paid: student.feesPaid,
      pending: student.feesPending,
      overdue: student.feesOverdue,
      installments,
      payments: studentPayments,
      receipts: studentReceipts,
    };
  };

  const recordFeePayment = (paymentData) => {
    const student = students.find((s) => s.id === paymentData.studentId);
    if (!student) {
      throw new Error(`Student ${paymentData.studentId} not found`);
    }
    if (student.feesPending <= 0) {
      throw new Error(
        `Student ${student.name} has no outstanding balance (account is fully settled).`
      );
    }
    const numAmount = Number(paymentData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Payment amount must be greater than \u20B90.');
    }
    if (numAmount > student.feesPending) {
      throw new Error(
        `Payment amount (\u20B9${numAmount.toLocaleString()}) cannot exceed the outstanding balance of \u20B9${student.feesPending.toLocaleString()}.`
      );
    }

    // Branch scoping validation: Prevent payment against wrong branch if user is locked
    if (
      currentUser?.assignedBranchIds &&
      !currentUser.assignedBranchIds.includes('all') &&
      !currentUser.assignedBranchIds.includes(student.branchId)
    ) {
      throw new Error(
        `Access Denied: You do not have permissions to collect fees for students in ${student.branchName} campus.`
      );
    }

    // Prevent duplicate transaction references for electronic / cheque payment methods
    const payMethod = paymentData.paymentMethod || 'UPI';
    const txnRef =
      (paymentData.transactionRef || '').trim() ||
      generateNextTransactionRef(payMethod, feePayments, feeReceipts);
    if (
      payMethod !== 'Cash' &&
      isTransactionRefDuplicate(txnRef, feePayments, feeReceipts)
    ) {
      throw new Error(
        `Duplicate transaction reference "${txnRef}". This reference ID has already been recorded in the accounts ledger.`
      );
    }

    const payId = generateNextPaymentId(feePayments);
    const { receiptNo, id: rcptId } = generateNextReceiptNo(feeReceipts);
    const component =
      paymentData.installment ||
      paymentData.feeComponent ||
      'Tuition Fee Installment';

    const newPayment = {
      id: payId,
      studentId: student.id,
      studentName: student.name,
      studentCode: student.studentCode || student.studentId,
      branchId: student.branchId,
      branchName: student.branchName,
      batchName: student.batchName,
      amount: numAmount,
      dateTime: new Date().toISOString(),
      date: getTodayDateString(),
      paymentMethod: payMethod,
      transactionRef: txnRef,
      installment: component,
      feeComponent: component,
      notes: paymentData.notes || '',
      recordedBy: currentUser?.name || 'Imran Lone (Accounts)',
      status: 'Completed',
      receiptId: rcptId,
    };

    const newReceipt = {
      id: rcptId,
      receiptNo,
      paymentId: payId,
      studentId: student.id,
      studentName: student.name,
      studentCode: student.studentCode || student.studentId,
      branchId: student.branchId,
      branchName: student.branchName,
      batchName: student.batchName,
      amount: numAmount,
      paymentMethod: payMethod,
      transactionRef: txnRef,
      installment: component,
      feeComponent: component,
      date: getTodayDateString(),
      dateTime: newPayment.dateTime,
      receivedBy: currentUser?.name || 'Imran Lone (Accounts)',
      notes: paymentData.notes || '',
    };

    // Atomic update of payments and receipts
    setFeePayments((prev) => [newPayment, ...prev]);
    setFeeReceipts((prev) => [newReceipt, ...prev]);

    // Enqueue payment & receipt parent notification event structures
    const payEvent = createPaymentConfirmationNotificationEvent({ student, payment: newPayment });
    const rcptEvent = createReceiptNotificationEvent({ student, receipt: newReceipt });
    setParentNotifications((prev) => [rcptEvent, payEvent, ...prev]);

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === student.id) {
          const newPaid = s.feesPaid + numAmount;
          const newPending = Math.max(0, s.feesTotal - newPaid);
          const newOverdue = Math.max(0, s.feesOverdue - numAmount);
          return {
            ...s,
            feesPaid: newPaid,
            feesPending: newPending,
            feesOverdue: newOverdue,
          };
        }
        return s;
      })
    );

    addAuditLog(
      'Recorded Fee Payment & Generated Receipt',
      'Fees & Accounts',
      `Collected \u20B9${numAmount.toLocaleString()} from ${student.name} (${student.studentId}) via ${payMethod}. Receipt: ${receiptNo}, Payment ID: ${payId}`
    );

    return {
      ...newReceipt,
      payment: newPayment,
    };
  };
  const addTest = (testData) => {
    const batch = batches.find((b) => b.id === testData.batchId) || batches[0];
    const newTest = {
      id: `test-${Date.now()}`,
      title: testData.title || 'New Diagnostic Assessment',
      testType: testData.testType || 'offline_omr',
      course: testData.course || 'Comprehensive Target',
      classId: batch.classId,
      className: batch.className,
      batchId: batch.id,
      batchName: batch.name,
      branchId: batch.branchId,
      branchName: batch.branchName,
      testDate: testData.testDate || getTodayDateString(),
      durationMinutes: testData.durationMinutes || 180,
      totalMarks: testData.totalMarks || 300,
      subjects: testData.subjects || [
        { name: 'Physics', maxMarks: 100 },
        { name: 'Chemistry', maxMarks: 100 },
        { name: 'Mathematics', maxMarks: 100 },
      ],
      status: 'scheduled',
    };
    setTests((prev) => [newTest, ...prev]);
    addAuditLog(
      'Created Examination Schedule',
      'Examination & Test Series',
      `Scheduled test "${newTest.title}" for ${newTest.batchName}.`
    );
  };
  const runOmrSimulation = (testId) => {
    const test = tests.find((t) => t.id === testId);
    if (!test) return;
    setTests((prev) =>
      prev.map((t) =>
        t.id === testId
          ? { ...t, status: 'completed', topScore: 284, averageScore: 192 }
          : t
      )
    );
    const simulatedResults = [
      {
        id: `res-${Date.now()}-1`,
        testId: test.id,
        testTitle: test.title,
        testDate: test.testDate,
        studentId: 'st-001',
        studentName: 'Aarav Sharma',
        studentCode: 'CH-2026-001',
        branchName: test.branchName,
        batchName: test.batchName,
        subjectMarks: { Physics: 92, Chemistry: 96, Mathematics: 96 },
        totalMarksObtained: 284,
        totalMaxMarks: 300,
        percentage: 94.6,
        batchRank: 1,
        branchRank: 1,
        instituteRank: 1,
        percentile: 99.8,
        weakTopics: ['Organic Synthesis Stereochemistry'],
      },
      {
        id: `res-${Date.now()}-2`,
        testId: test.id,
        testTitle: test.title,
        testDate: test.testDate,
        studentId: 'st-003',
        studentName: 'Faizan Dar',
        studentCode: 'CH-2026-003',
        branchName: test.branchName,
        batchName: test.batchName,
        subjectMarks: { Physics: 45, Chemistry: 48, Mathematics: 38 },
        totalMarksObtained: 131,
        totalMaxMarks: 300,
        percentage: 43.6,
        batchRank: 36,
        branchRank: 74,
        instituteRank: 198,
        percentile: 32.5,
        weakTopics: ['Electromagnetism', 'Coordinate Geometry'],
      },
    ];
    setTestResults((prev) => [...simulatedResults, ...prev]);
    addAuditLog(
      'Executed OMR Automated Evaluation',
      'Examination & Test Series',
      `Processed 38 OMR sheets for "${test.title}". Generated rankings and weak-topic diagnostics.`
    );
  };
  const submitDoubt = (doubtData) => {
    const newDoubt = {
      id: `dbt-${Date.now()}`,
      studentId: currentUser?.linkedStudentId || currentUser?.id || 'st-001',
      studentName: currentUser?.name || 'Aarav Sharma',
      studentCode: 'CH-2026-001',
      batchName: 'JEE-A',
      subject: doubtData.subject,
      question: doubtData.question,
      date: getTodayDateString(),
      status: 'open',
    };
    setDoubts((prev) => [newDoubt, ...prev]);
    addAuditLog(
      'Student Submitted Academic Doubt',
      'Academic Management',
      `Doubt in ${doubtData.subject} submitted by ${newDoubt.studentName}.`
    );
  };
  const answerDoubt = (doubtId, answer) => {
    setDoubts((prev) =>
      prev.map((d) =>
        d.id === doubtId
          ? {
              ...d,
              status: 'answered',
              answer,
              answeredBy: currentUser?.name || 'Faculty Member',
              answeredDate: getTodayDateString(),
            }
          : d
      )
    );
    addAuditLog(
      'Faculty Answered Academic Doubt',
      'Academic Management',
      `Resolved doubt #${doubtId}.`
    );
  };
  const addHomework = (hwData) => {
    const batch = batches.find((b) => b.id === hwData.batchId) || batches[0];
    const today = getTodayDateString();
    const newHw = {
      id: `hw-${Date.now()}`,
      batchId: batch.id,
      batchName: batch.name,
      subject: hwData.subject || 'Physics',
      facultyName: currentUser?.name || 'Dr. Rahul Sharma',
      title: hwData.title || 'Weekly Practice DPP',
      description: hwData.description || 'Solve provided problem set.',
      assignedDate: today,
      dueDate:
        hwData.dueDate ||
        new Date(Date.now() + 864e5 * 3).toISOString().split('T')[0],
      submissionsCount: 0,
      totalStudents: batch.studentCount,
    };
    setHomework((prev) => [newHw, ...prev]);
    addAuditLog(
      'Assigned Homework DPP',
      'Academic Management',
      `Assigned "${newHw.title}" to ${newHw.batchName}.`
    );
  };
  const uploadDocument = (docData) => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      entityType: docData.entityType || 'student',
      entityId: docData.entityId || 'st-001',
      entityName: docData.entityName || 'Aarav Sharma',
      docType: docData.docType || 'Aadhaar Card',
      fileName: docData.fileName || 'uploaded_document.pdf',
      fileSize: '1.4 MB',
      uploadedBy: currentUser?.name || 'System User',
      uploadDate: getTodayDateString(),
      status: 'pending',
    };
    setDocuments((prev) => [newDoc, ...prev]);
    addAuditLog(
      'Uploaded Document for Verification',
      'Document Management',
      `Document "${newDoc.fileName}" for ${newDoc.entityName}.`
    );
  };
  const updateDocumentStatus = (id, status, reason) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status, rejectionReason: reason } : d
      )
    );
    addAuditLog(
      `Document ${status.toUpperCase()}`,
      'Document Management',
      `Set status to ${status} for doc ID #${id}.`
    );
  };
  const addAsset = (assetData) => {
    const branch =
      branches.find((b) => b.id === assetData.branchId) || branches[0];
    const newAsset = {
      id: `ast-${Date.now()}`,
      code: `CH-${(assetData.category || 'GEN').substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: assetData.name || 'New Inventory Item',
      category: assetData.category || 'Furniture',
      branchId: branch.id,
      branchName: branch.name,
      quantity: assetData.quantity || 10,
      unit: assetData.unit || 'Units',
      locationRoom: assetData.locationRoom || 'Main Campus',
      condition: assetData.condition || 'good',
      status: assetData.status || 'available',
      purchaseDate: getTodayDateString(),
      estimatedValue: assetData.estimatedValue || 25e3,
    };
    setAssets((prev) => [newAsset, ...prev]);
    addAuditLog(
      'Logged Inventory Asset',
      'Inventory & Assets',
      `Registered asset "${newAsset.name}" at ${newAsset.branchName}.`
    );
  };
  const addBranch = (branchData) => {
    const nextCode = `CH-${(branchData.name || 'NEW').substring(0, 3).toUpperCase()}`;
    const newBranch = {
      id: `b-${Date.now()}`,
      name: branchData.name || 'New Branch',
      code: nextCode,
      city: branchData.city || 'Kashmir',
      address: branchData.address || 'Main Campus Boulevard',
      phone: branchData.phone || '+91 94190 99999',
      email: `${(branchData.name || 'branch').toLowerCase()}@careerheights.demo`,
      headFaculty: branchData.headFaculty || 'Faculty Lead',
      studentCount: 0,
      capacity: branchData.capacity || 100,
      facultyCount: 4,
      monthlyRevenue: 0,
      collectionRate: 100,
      attendanceRate: 90,
      status: 'active',
    };
    setBranches((prev) => [...prev, newBranch]);
    addAuditLog(
      'Created New Organization Branch',
      'Branch Management',
      `Provisioned new branch ${newBranch.name} (${newBranch.code}).`
    );
  };
  const updateLeaveStatus = (id, status) => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
    addAuditLog(
      `Leave Request ${status.toUpperCase()}`,
      'HR & Staff Management',
      `Updated leave application #${id}.`
    );
  };
  const updateChtqStatus = (id, updates) => {
    setChtqCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    addAuditLog(
      'Updated CHTQ Candidate Status',
      'CHTQ / Scholarship Test',
      `Updated CHTQ record #${id}.`
    );
  };
  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };
  const sendBroadcastMessage = (data) => {
    addAuditLog(
      `Queued Demo Broadcast (${data.channel.toUpperCase()})`,
      'Communication Centre',
      `Queued broadcast for "${data.target}" using template "${data.template}": ${data.message.substring(0, 60)}... (External telecom dispatch pending backend deployment)`,
      {
        targetEntity: 'BroadcastMessage',
        targetId: data.template || 'N/A',
        severity: 'info',
      }
    );
  };

  const addSubject = (subjectData) => {
    const newSubject = {
      id: `sub-${Date.now().toString(36)}`,
      name: subjectData.name,
      code: subjectData.code || `${subjectData.name.slice(0, 3).toUpperCase()}-101`,
      category: subjectData.category || 'General',
      description: subjectData.description || '',
      color: subjectData.color || 'blue',
    };
    setSubjects((prev) => [...prev, newSubject]);
    addAuditLog('Created Subject Master', 'Academic Master', `Added subject: ${newSubject.name} (${newSubject.code})`);
    return newSubject;
  };

  const updateSubject = (id, updatedData) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s)));
    addAuditLog('Updated Subject Master', 'Academic Master', `Updated subject #${id}`);
  };

  const deleteSubject = (id) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    addAuditLog('Deleted Subject Master', 'Academic Master', `Deleted subject #${id}`);
  };

  const addSubjectCombo = (comboData) => {
    const newCombo = {
      id: `combo-${Date.now().toString(36)}`,
      name: comboData.name,
      code: comboData.code || `COMBO-${comboData.name.slice(0, 4).toUpperCase()}`,
      description: comboData.description || '',
      wingId: comboData.wingId || 'w-eng',
      subjectIds: comboData.subjectIds || [],
    };
    setSubjectCombos((prev) => [...prev, newCombo]);
    addAuditLog('Created Subject Combo', 'Academic Master', `Created combo: ${newCombo.name}`);
    return newCombo;
  };

  const updateSubjectCombo = (id, updatedData) => {
    setSubjectCombos((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c)));
    addAuditLog('Updated Subject Combo', 'Academic Master', `Updated subject combo #${id}`);
  };

  const deleteSubjectCombo = (id) => {
    setSubjectCombos((prev) => prev.filter((c) => c.id !== id));
    addAuditLog('Deleted Subject Combo', 'Academic Master', `Deleted subject combo #${id}`);
  };

  const addTeacherAssignment = (assignmentData) => {
    const newAssignment = {
      id: `ta-${Date.now().toString(36)}`,
      ...assignmentData,
    };
    setTeacherAssignments((prev) => [...prev, newAssignment]);
    addAuditLog(
      'Assigned Teacher to Batch/Subject',
      'Faculty Management',
      `Assigned ${assignmentData.teacherName} to ${assignmentData.batchName} for ${assignmentData.subjectName}`
    );
    return newAssignment;
  };

  const deleteTeacherAssignment = (id) => {
    setTeacherAssignments((prev) => prev.filter((ta) => ta.id !== id));
    addAuditLog('Removed Teacher Assignment', 'Faculty Management', `Removed assignment #${id}`);
  };

  const updateStudentSubjectEnrollment = (studentId, subjectIds, comboId = null) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            enrolledSubjects: subjectIds,
            subjectComboId: comboId,
          };
        }
        return s;
      })
    );
    addAuditLog(
      'Updated Student Subject Enrollment',
      'Student Admissions',
      `Updated subject enrollment for student #${studentId} (${subjectIds.length} subjects)`
    );
  };

  const addCustomRole = (roleData) => {
    const newRole = {
      id: `role-${Date.now().toString(36)}`,
      name: roleData.name,
      description: roleData.description || '',
      status: roleData.status || 'active',
      assignedBranchIds: roleData.assignedBranchIds || ['all'],
      permissions: roleData.permissions || {},
      createdBy: currentUser?.name || 'Authorized Admin',
      createdAt: getTodayDateString(),
    };
    setCustomRoles((prev) => [...prev, newRole]);
    addAuditLog('Created Custom RBAC Role', 'Security & Roles', `Created role: ${newRole.name}`);
    return newRole;
  };

  const updateCustomRole = (id, updatedData) => {
    setCustomRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...updatedData } : r)));
    addAuditLog('Updated Custom Role', 'Security & Roles', `Updated permissions for role #${id}`);
  };

  const deleteCustomRole = (id) => {
    setCustomRoles((prev) => prev.filter((r) => r.id !== id));
    addAuditLog('Deleted Custom Role', 'Security & Roles', `Deleted role #${id}`);
  };

  const addEmployee = (empData) => {
    const id = `emp-${Date.now().toString(36)}`;
    const branch = branches.find((b) => b.id === empData.branchId) || branches[0];
    const maxStaffNum = employees.reduce((max, e) => {
      const match = (e.empCode || '').match(/(\d+)/);
      const n = match ? parseInt(match[0], 10) : 0;
      return n > max ? n : max;
    }, 100);
    const newEmp = {
      id,
      empCode: empData.empCode || `CH-STF-${maxStaffNum + 1}`,
      name: empData.name,
      photo:
        empData.photo ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      email: empData.email,
      phone: empData.phone,
      role: empData.role || 'teacher',
      roleTitle: empData.roleTitle || '',
      designation: empData.designation || 'Staff Member',
      department: empData.department || 'Academic',
      branchId: branch.id,
      branchName: branch.name,
      joiningDate: empData.joiningDate || getTodayDateString(),
      monthlySalary: Number(empData.monthlySalary || 45000),
      incentives: Number(empData.incentives || 0),
      status: empData.status || 'active',
      qualifications: empData.qualifications || 'Post Graduate Specialist',
      attendanceRate: 100,
      customRoleId: empData.customRoleId || null,
    };
    setEmployees((prev) => [...prev, newEmp]);
    addAuditLog(
      'Created Staff User & Role Assignment',
      'HR & User Management',
      `Created staff user ${newEmp.name} (${newEmp.empCode}) with role "${newEmp.role}".`
    );
    return newEmp;
  };

  const updateEmployee = (id, updatedData) => {
    const currentEmp = employees.find((e) => e.id === id);
    if (!currentEmp) return { success: false, message: 'Employee not found' };

    // SAFEGUARD: Never allow the last active SuperAdmin to be disabled/deactivated
    if (currentEmp.role === 'super_admin' || currentEmp.role === 'ceo') {
      const activeSuperAdmins = employees.filter(
        (e) =>
          (e.role === 'super_admin' || e.role === 'ceo') &&
          e.status !== 'inactive'
      );
      if (activeSuperAdmins.length <= 1) {
        if (updatedData.status === 'inactive') {
          return {
            success: false,
            message:
              'Institutional Safeguard: The last active SuperAdmin / Owner account cannot be disabled or deactivated.',
          };
        }
        if (updatedData.role && updatedData.role !== 'super_admin') {
          return {
            success: false,
            message:
              'Institutional Safeguard: The last active SuperAdmin / Owner role cannot be changed without designating another SuperAdmin first.',
          };
        }
      }
    }

    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updatedData } : e))
    );
    addAuditLog(
      'Updated Staff User Profile & Role',
      'HR & User Management',
      `Updated user ${currentEmp.name} (#${id}) details.`
    );
    return { success: true };
  };

  const transferEmployee = (id, targetBranchId) => {
    const branch = branches.find((b) => b.id === targetBranchId);
    if (!branch) return { success: false, message: 'Invalid target branch' };

    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              branchId: branch.id,
              branchName: branch.name,
            }
          : e
      )
    );
    addAuditLog(
      'Transferred Staff Campus Location',
      'HR & User Management',
      `Transferred staff member #${id} to ${branch.name} Campus.`
    );
    return { success: true };
  };

  const disableEmployee = (id) => {
    return updateEmployee(id, { status: 'inactive' });
  };

  const payStaffSalary = (salaryId, paymentDetails = {}) => {
    const today = getTodayDateString();
    const txRef = paymentDetails.transactionRef || `SAL-TX-${Date.now().toString().slice(-6)}`;
    setSalaries((prev) =>
      prev.map((sal) => {
        if (sal.id === salaryId) {
          return {
            ...sal,
            status: 'Paid',
            paidDate: today,
            paymentMethod: paymentDetails.paymentMethod || 'Direct Bank Transfer',
            transactionRef: txRef,
            notes: paymentDetails.notes || 'Disbursed via ERP payroll',
          };
        }
        return sal;
      })
    );
    addAuditLog(
      'Disbursed Employee Salary',
      'Finance & Payroll',
      `Processed payroll disbursement #${salaryId} via ${paymentDetails.paymentMethod || 'Bank Transfer'}. Ref: ${txRef}`
    );
  };

  const markTeacherSelfAttendance = (teacherId, data = {}) => {
    const today = getTodayDateString();
    const now = new Date();
    const existing = teacherAttendanceRecords.find(
      (r) => (r.teacherId === teacherId || r.teacherName === data.teacherName) && r.date === today
    );
    if (existing) {
      setTeacherAttendanceRecords((prev) =>
        prev.map((r) =>
          r.id === existing.id
            ? {
                ...r,
                checkOutTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                checkOutDateTime: now.toISOString(),
                status: 'Present (Checked Out)',
                checkOutLatitude: data.latitude !== undefined ? Number(data.latitude) : existing.latitude,
                checkOutLongitude: data.longitude !== undefined ? Number(data.longitude) : existing.longitude,
                checkOutAccuracy: data.accuracy !== undefined ? Number(data.accuracy) : existing.locationAccuracy,
                deviceMetadata: data.deviceMetadata || existing.deviceMetadata,
                updatedAt: now.toISOString(),
              }
            : r
        )
      );
      addAuditLog('Faculty Check-Out', 'Attendance System', `Faculty ${teacherId} clocked out.`);
    } else {
      const lat = data.latitude !== undefined ? Number(data.latitude) : 34.3980;
      const lon = data.longitude !== undefined ? Number(data.longitude) : 74.2831;
      const acc = data.accuracy !== undefined ? Number(data.accuracy) : (data.locationAccuracy !== undefined ? Number(data.locationAccuracy) : 8.5);
      const newRec = {
        id: `t-att-${Date.now().toString(36)}`,
        teacherId,
        teacherName: data.teacherName || currentUser?.name || 'Dr. Rahul Sharma',
        empCode: data.empCode || currentUser?.empCode || 'FAC-101',
        branchId: data.branchId || currentUser?.branchId || 'b-hdw',
        branchName: data.branchName || currentUser?.branchName || 'Handwara',
        date: today,
        dateTime: now.toISOString(),
        checkInTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        checkOutTime: null,
        status: data.status || 'Present',
        latitude: lat,
        longitude: lon,
        locationAccuracy: acc,
        accuracyMeters: acc,
        location: data.location || `Captured GPS: ${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E (±${Math.round(acc)}m)`,
        locationName: data.locationName || 'Campus Environs',
        deviceMetadata: data.deviceMetadata || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Staff Device / Browser Environment'),
        deviceInfo: data.deviceInfo || 'Staff Device / Real-time Geolocation Captured',
        geofenceEnforced: false, // Critical: No geofence rejection rule
        distanceVerificationStatus: 'Captured - No Geofence Rejection',
        notes: data.notes || 'Teacher self-attendance logged with device & coordinate capture.',
      };
      setTeacherAttendanceRecords((prev) => [newRec, ...prev]);
      addAuditLog('Faculty Self-Attendance', 'Attendance System', `Faculty ${teacherId} recorded attendance. Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)} (No geofence rule enforced).`);
    }
  };

  const getTeacherAssignedStudents = (teacherId, batchId, subjectId, teacherName) => {
    return getStudentsForTeacher({
      teacherId,
      teacherName,
      teacherAssignments,
      students,
      batchId,
      subjectId,
      isSuperOrHq: currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'HQ_ADMIN',
    });
  };

  // Branch Scoped Collections (Strict single active branch context)
  const scopedStudents = useMemo(
    () => getVisibleStudents(students, currentActiveBranch),
    [students, currentActiveBranch]
  );
  const scopedTeachers = useMemo(
    () => getVisibleTeachers(employees, currentActiveBranch, teacherAssignments),
    [employees, currentActiveBranch, teacherAssignments]
  );
  const scopedStaff = useMemo(
    () => getVisibleStaff(employees, currentActiveBranch),
    [employees, currentActiveBranch]
  );
  const scopedBatches = useMemo(
    () => getVisibleBatches(batches, currentActiveBranch),
    [batches, currentActiveBranch]
  );
  const scopedPayments = useMemo(
    () => getVisiblePayments(feePayments, currentActiveBranch, students, branches),
    [feePayments, currentActiveBranch, students, branches]
  );
  const scopedFees = useMemo(
    () => getVisibleFees(feeReceipts, currentActiveBranch, students, branches),
    [feeReceipts, currentActiveBranch, students, branches]
  );
  const scopedAttendance = useMemo(
    () => getVisibleAttendance(attendanceRecords, currentActiveBranch, students),
    [attendanceRecords, currentActiveBranch, students]
  );
  const scopedExams = useMemo(
    () => getVisibleExams(tests, currentActiveBranch),
    [tests, currentActiveBranch]
  );
  const scopedEnquiries = useMemo(
    () => getVisibleEnquiries(enquiries, currentActiveBranch),
    [enquiries, currentActiveBranch]
  );
  const scopedAssets = useMemo(
    () => getVisibleAssets(assets, currentActiveBranch),
    [assets, currentActiveBranch]
  );
  const scopedDocuments = useMemo(
    () => getVisibleDocuments(documents, currentActiveBranch, students, employees),
    [documents, currentActiveBranch, students, employees]
  );
  const scopedCommunications = useMemo(
    () => getVisibleCommunications(notifications, currentActiveBranch),
    [notifications, currentActiveBranch]
  );
  const scopedSalaries = useMemo(
    () => getVisibleSalaries(salaries, currentActiveBranch),
    [salaries, currentActiveBranch]
  );
  const scopedWings = useMemo(
    () => getVisibleWings(wings, currentActiveBranch),
    [wings, currentActiveBranch]
  );
  const scopedChtqCandidates = useMemo(
    () => getVisibleChtqCandidates(chtqCandidates, currentActiveBranch),
    [chtqCandidates, currentActiveBranch]
  );
  const scopedTeacherAttendance = useMemo(
    () => getVisibleTeacherAttendance(teacherAttendanceRecords, currentActiveBranch, employees),
    [teacherAttendanceRecords, currentActiveBranch, employees]
  );
  const scopedReports = useMemo(
    () =>
      getVisibleReports(
        {
          students,
          feeReceipts,
          attendanceRecords,
          batches,
          branches,
          employees,
          enquiries,
          tests,
        },
        currentActiveBranch
      ),
    [
      students,
      feeReceipts,
      attendanceRecords,
      batches,
      branches,
      employees,
      enquiries,
      tests,
      currentActiveBranch,
    ]
  );

  // Centralized Selector Functions
  const getVisibleStudentsFn = (customList, bId = currentActiveBranch) =>
    getVisibleStudents(customList || students, bId);
  const getVisibleTeachersFn = (customList, bId = currentActiveBranch) =>
    getVisibleTeachers(customList || employees, bId, teacherAssignments);
  const getVisibleStaffFn = (customList, bId = currentActiveBranch) =>
    getVisibleStaff(customList || employees, bId);
  const getVisibleFeesFn = (customList, bId = currentActiveBranch) =>
    getVisibleFees(customList || feeReceipts, bId, students, branches);
  const getVisiblePaymentsFn = (customList, bId = currentActiveBranch) =>
    getVisiblePayments(customList || feePayments, bId, students, branches);
  const getVisibleAttendanceFn = (customList, bId = currentActiveBranch) =>
    getVisibleAttendance(customList || attendanceRecords, bId, students);
  const getVisibleBatchesFn = (customList, bId = currentActiveBranch) =>
    getVisibleBatches(customList || batches, bId);
  const getVisibleExamsFn = (customList, bId = currentActiveBranch) =>
    getVisibleExams(customList || tests, bId);
  const getVisibleReportsFn = (customData, bId = currentActiveBranch) =>
    getVisibleReports(
      customData || {
        students,
        feeReceipts,
        attendanceRecords,
        batches,
        branches,
        employees,
        enquiries,
        tests,
      },
      bId
    );
  const getVisibleEnquiriesFn = (customList, bId = currentActiveBranch) =>
    getVisibleEnquiries(customList || enquiries, bId);
  const getVisibleAssetsFn = (customList, bId = currentActiveBranch) =>
    getVisibleAssets(customList || assets, bId);

  return (
    <ErpDataContext.Provider
      value={{
        activeBranchId: currentActiveBranch,
        isAllBranches: isAllBranches(currentActiveBranch),
        INSTITUTE_CONFIG,
        // Scoped Collections
        scopedStudents,
        visibleStudents: scopedStudents,
        scopedTeachers,
        visibleTeachers: scopedTeachers,
        scopedStaff,
        visibleStaff: scopedStaff,
        scopedBatches,
        visibleBatches: scopedBatches,
        scopedWings,
        visibleWings: scopedWings,
        scopedPayments,
        visiblePayments: scopedPayments,
        scopedFees,
        visibleFees: scopedFees,
        scopedAttendance,
        visibleAttendance: scopedAttendance,
        scopedExams,
        visibleExams: scopedExams,
        scopedEnquiries,
        visibleEnquiries: scopedEnquiries,
        scopedAssets,
        visibleAssets: scopedAssets,
        scopedDocuments,
        visibleDocuments: scopedDocuments,
        scopedCommunications,
        visibleCommunications: scopedCommunications,
        scopedSalaries,
        visibleSalaries: scopedSalaries,
        scopedChtqCandidates,
        visibleChtqCandidates: scopedChtqCandidates,
        scopedTeacherAttendance,
        visibleTeacherAttendance: scopedTeacherAttendance,
        scopedReports,
        visibleReports: scopedReports,
        // Reusable Selectors
        getVisibleStudents: getVisibleStudentsFn,
        getVisibleTeachers: getVisibleTeachersFn,
        getVisibleStaff: getVisibleStaffFn,
        getVisiblePayments: getVisiblePaymentsFn,
        getVisibleFees: getVisibleFeesFn,
        getVisibleAttendance: getVisibleAttendanceFn,
        getVisibleBatches: getVisibleBatchesFn,
        getVisibleExams: getVisibleExamsFn,
        getVisibleReports: getVisibleReportsFn,
        getVisibleEnquiries: getVisibleEnquiriesFn,
        getVisibleAssets: getVisibleAssetsFn,
        calculateStudentInstallments,
        getStudentFeeDetails,
        // Base Collections & Mutators
        branches,
        wings,
        classes,
        batches,
        students,
        subjects,
        subjectCombos,
        teacherAssignments,
        customRoles,
        salaries,
        teacherAttendanceRecords,
        enquiries,
        feePayments,
        feeReceipts,
        tests,
        testResults,
        timetable,
        syllabus,
        homework,
        doubts,
        documents,
        notifications,
        parentNotifications,
        setParentNotifications,
        addParentNotification,
        employees,
        leaveRequests,
        assets,
        chtqSchools,
        chtqCandidates,
        auditLogs,
        attendanceRecords,
        addStudent,
        updateStudent,
        updateStudentSubjectEnrollment,
        addSubject,
        updateSubject,
        deleteSubject,
        addSubjectCombo,
        updateSubjectCombo,
        deleteSubjectCombo,
        addTeacherAssignment,
        deleteTeacherAssignment,
        addCustomRole,
        updateCustomRole,
        deleteCustomRole,
        addEmployee,
        updateEmployee,
        transferEmployee,
        disableEmployee,
        payStaffSalary,
        markTeacherSelfAttendance,
        getTeacherAssignedStudents,
        CANONICAL_SUBJECTS,
        CANONICAL_SUBJECT_COMBOS,
        getClassesForBranch,
        getWingsForClass,
        getBatchesByHierarchy,
        getStudentEnrolledSubjects,
        getStudentEnrolledSubjectIds,
        isStudentEnrolledInSubject,
        getStudentsForTeacher,
        addEnquiry,
        updateEnquiryStatus,
        convertEnquiryToAdmission,
        addCounsellingNote,
        markBatchAttendance,
        markStudentAttendance,
        recordFeePayment,
        addTest,
        runOmrSimulation,
        submitDoubt,
        answerDoubt,
        addHomework,
        uploadDocument,
        updateDocumentStatus,
        addAsset,
        addBranch,
        updateLeaveStatus,
        updateChtqStatus,
        markNotificationAsRead,
        sendBroadcastMessage,
      }}
    >
      {children}
    </ErpDataContext.Provider>
  );
};
export const useErpData = () => {
  const context = useContext(ErpDataContext);
  if (!context) {
    throw new Error('useErpData must be used within an ErpDataProvider');
  }
  return context;
};
