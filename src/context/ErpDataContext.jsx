import { createContext, useContext, useState } from 'react';
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
  INITIAL_FEE_RECEIPTS,
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
  VALID_STUDENT_AVATARS,
  generateInitialAttendanceRecords,
} from '../data/mockData';
import { useAuth } from './AuthContext';
import { getTodayDateString } from '../utils/dateUtils';
import {
  generateNextStudentId,
  generateNextReceiptNo,
} from '../utils/idGenerators';
import {
  calculateStudentAttendanceSummary,
  upsertAttendanceRecord,
} from '../utils/attendanceCalculator';
const ErpDataContext = createContext(void 0);
export const ErpDataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [branches, setBranches] = useState(INITIAL_BRANCHES);
  const [wings] = useState(INITIAL_WINGS);
  const [classes] = useState(INITIAL_CLASSES);
  const [batches] = useState(INITIAL_BATCHES);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [enquiries, setEnquiries] = useState(INITIAL_ENQUIRIES);
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
  const [salaries, setSalaries] = useState(() => {
    return INITIAL_STAFF.map((emp, idx) => ({
      id: `sal-${emp.id}-2026-02`,
      employeeId: emp.id,
      employeeName: emp.name,
      empCode: emp.empCode,
      designation: emp.designation,
      branchId: emp.branchId,
      branchName: emp.branchName,
      month: 'February 2026',
      baseSalary: emp.salary || 65000,
      allowance: 3500,
      deductions: 1200,
      netSalary: (emp.salary || 65000) + 3500 - 1200,
      status: idx % 3 === 0 ? 'Pending' : 'Paid',
      paidDate: idx % 3 === 0 ? null : '2026-02-28',
      paymentMethod: idx % 3 === 0 ? null : 'Direct Bank Transfer',
      transactionRef: idx % 3 === 0 ? null : `NEFT-2026-${1000 + idx}`,
    }));
  });
  const [teacherAttendanceRecords, setTeacherAttendanceRecords] = useState([
    {
      id: 't-att-001',
      teacherId: 'u-faculty',
      teacherName: 'Dr. Rahul Sharma',
      date: getTodayDateString(),
      checkInTime: '08:45 AM',
      checkOutTime: null,
      status: 'Present',
      location: 'Handwara Main Campus (34.3980° N, 74.2831° E)',
      accuracyMeters: 12,
      deviceInfo: 'Staff Mobile / Verified Campus GeoFence',
    },
  ]);
  const addAuditLog = (action, module, details) => {
    const newLog = {
      id: `log-${Date.now()}`,
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.roleTitle || 'Authorized Staff',
      action,
      module,
      details,
      timestamp: new Date().toLocaleString('en-US', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
      ip: 'Demo Environment',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
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
      wingId: batch.wingId,
      classId: batch.classId,
      className: batch.className,
      batchId: batch.id,
      batchName: batch.name,
      parentName: studentData.parentName || 'Parent Guardian',
      parentPhone: studentData.parentPhone || '+91 94191 99999',
      parentEmail: studentData.parentEmail || 'parent@gmail.demo',
      parentOccupation: studentData.parentOccupation || 'Self-Employed',
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
      documentsCount: 2,
      pendingDocuments: 1,
      remarks:
        studentData.remarks || 'Newly enrolled student. Orientation scheduled.',
    };
    setStudents((prev) => [newStudent, ...prev]);
    if (paid > 0) {
      const { receiptNo: initRcptNo, id: initRcptId } =
        generateNextReceiptNo(feeReceipts);
      const initialReceipt = {
        id: initRcptId,
        receiptNo: initRcptNo,
        studentId: newStudent.id,
        studentName: newStudent.name,
        studentCode: newStudent.studentId,
        branchName: newStudent.branchName,
        batchName: newStudent.batchName,
        amount: paid,
        paymentMethod: 'UPI',
        transactionRef: `INIT-ADM-${Date.now().toString().slice(-6)}`,
        date: admDate,
        receivedBy: currentUser?.name || 'Accounts Desk',
        notes: 'Initial admission installment recorded upon enrollment.',
      };
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
    if (paymentData.amount <= 0) {
      throw new Error('Payment amount must be greater than \u20B90.');
    }
    if (paymentData.amount > student.feesPending) {
      throw new Error(
        `Payment amount (\u20B9${paymentData.amount.toLocaleString()}) cannot exceed the outstanding balance of \u20B9${student.feesPending.toLocaleString()}.`
      );
    }
    const { receiptNo, id: rcptId } = generateNextReceiptNo(feeReceipts);
    const newReceipt = {
      id: rcptId,
      receiptNo,
      studentId: student.id,
      studentName: student.name,
      studentCode: student.studentId,
      branchName: student.branchName,
      batchName: student.batchName,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      transactionRef: paymentData.transactionRef,
      date: getTodayDateString(),
      receivedBy: currentUser?.name || 'Imran Lone (Accounts)',
      notes: paymentData.notes,
    };
    setFeeReceipts((prev) => [newReceipt, ...prev]);
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === student.id) {
          const newPaid = s.feesPaid + paymentData.amount;
          const newPending = Math.max(0, s.feesTotal - newPaid);
          const newOverdue = Math.max(0, s.feesOverdue - paymentData.amount);
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
      'Generated Official Fee Receipt',
      'Fees & Accounts',
      `Collected \u20B9${paymentData.amount.toLocaleString()} from ${student.name} (${student.studentId}) via ${paymentData.paymentMethod}. Receipt: ${receiptNo}`
    );
    return newReceipt;
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
      `Dispatched ${data.channel.toUpperCase()} Notification`,
      'Communication Centre',
      `Sent broadcast to target "${data.target}" using template "${data.template}": ${data.message.substring(0, 60)}...`
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
    const existing = teacherAttendanceRecords.find(
      (r) => r.teacherId === teacherId && r.date === today
    );
    if (existing) {
      setTeacherAttendanceRecords((prev) =>
        prev.map((r) =>
          r.id === existing.id
            ? {
                ...r,
                checkOutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'Present (Checked Out)',
              }
            : r
        )
      );
      addAuditLog('Faculty Check-Out', 'Attendance System', `Faculty ${teacherId} clocked out.`);
    } else {
      const newRec = {
        id: `t-att-${Date.now().toString(36)}`,
        teacherId,
        teacherName: currentUser?.name || 'Dr. Rahul Sharma',
        date: today,
        checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        checkOutTime: null,
        status: 'Present',
        location: data.location || 'Handwara Main Campus (34.3980° N, 74.2831° E)',
        accuracyMeters: data.accuracyMeters || 10,
        deviceInfo: data.deviceInfo || 'Staff Device / Campus WiFi & GPS Verified',
      };
      setTeacherAttendanceRecords((prev) => [newRec, ...prev]);
      addAuditLog('Faculty Self-Attendance', 'Attendance System', `Faculty ${teacherId} checked in at campus.`);
    }
  };

  const getTeacherAssignedStudents = (teacherId, batchId, subjectId) => {
    return students.filter((st) => {
      const matchBatch = !batchId || st.batchId === batchId;
      const enrolled = Array.isArray(st.enrolledSubjects) && st.enrolledSubjects.includes(subjectId);
      return matchBatch && enrolled;
    });
  };

  return (
    <ErpDataContext.Provider
      value={{
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
        feeReceipts,
        tests,
        testResults,
        timetable,
        syllabus,
        homework,
        doubts,
        documents,
        notifications,
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
        payStaffSalary,
        markTeacherSelfAttendance,
        getTeacherAssignedStudents,
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
