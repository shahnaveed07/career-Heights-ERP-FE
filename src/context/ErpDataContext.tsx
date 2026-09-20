import React, { createContext, useContext, useState } from 'react';
import {
  Student,
  Branch,
  Wing,
  ClassItem,
  Batch,
  Enquiry,
  AttendanceRecord,
  FeeReceipt,
  ExamTest,
  TestResult,
  DoubtItem,
  HomeworkItem,
  DocumentItem,
  NotificationItem,
  Employee,
  LeaveRequest,
  AssetItem,
  CHTQCandidate,
  CHTQSchool,
  AuditLogItem,
  TimetableSlot,
  SyllabusTopic,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_BRANCHES,
  INITIAL_WINGS,
  INITIAL_CLASSES,
  INITIAL_BATCHES,
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
} from '../data/mockData';
import { useAuth } from './AuthContext';

interface ErpDataContextType {
  branches: Branch[];
  wings: Wing[];
  classes: ClassItem[];
  batches: Batch[];
  students: Student[];
  enquiries: Enquiry[];
  feeReceipts: FeeReceipt[];
  tests: ExamTest[];
  testResults: TestResult[];
  timetable: TimetableSlot[];
  syllabus: SyllabusTopic[];
  homework: HomeworkItem[];
  doubts: DoubtItem[];
  documents: DocumentItem[];
  notifications: NotificationItem[];
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  assets: AssetItem[];
  chtqSchools: CHTQSchool[];
  chtqCandidates: CHTQCandidate[];
  auditLogs: AuditLogItem[];
  attendanceRecords: AttendanceRecord[];

  // Mutators
  addStudent: (studentData: Partial<Student>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  addEnquiry: (enquiryData: Partial<Enquiry>) => void;
  updateEnquiryStatus: (id: string, status: Enquiry['status'], lostReason?: string) => void;
  convertEnquiryToAdmission: (enquiryId: string) => Student | null;
  addCounsellingNote: (id: string, note: string) => void;
  markBatchAttendance: (batchId: string, records: { studentId: string; status: 'present' | 'absent' | 'late' | 'leave' }[]) => void;
  markStudentAttendance: (studentId: string, statusOrDate: string, maybeStatus?: 'present' | 'absent' | 'late' | 'leave') => void;
  recordFeePayment: (paymentData: { studentId: string; amount: number; paymentMethod: FeeReceipt['paymentMethod']; transactionRef: string; notes: string }) => FeeReceipt;
  addTest: (testData: Partial<ExamTest>) => void;
  runOmrSimulation: (testId: string) => void;
  submitDoubt: (doubtData: { subject: string; question: string }) => void;
  answerDoubt: (doubtId: string, answer: string) => void;
  addHomework: (hwData: Partial<HomeworkItem>) => void;
  uploadDocument: (docData: Partial<DocumentItem>) => void;
  updateDocumentStatus: (id: string, status: 'approved' | 'rejected', reason?: string) => void;
  addAsset: (assetData: Partial<AssetItem>) => void;
  addBranch: (branchData: Partial<Branch>) => void;
  updateLeaveStatus: (id: string, status: 'approved' | 'rejected') => void;
  updateChtqStatus: (id: string, updates: Partial<CHTQCandidate>) => void;
  markNotificationAsRead: (id: string) => void;
  sendBroadcastMessage: (data: { channel: 'sms' | 'whatsapp' | 'push'; target: string; message: string; template: string }) => void;
}

const ErpDataContext = createContext<ErpDataContextType | undefined>(undefined);

export const ErpDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [wings] = useState<Wing[]>(INITIAL_WINGS);
  const [classes] = useState<ClassItem[]>(INITIAL_CLASSES);
  const [batches] = useState<Batch[]>(INITIAL_BATCHES);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(INITIAL_ENQUIRIES);
  const [feeReceipts, setFeeReceipts] = useState<FeeReceipt[]>(INITIAL_FEE_RECEIPTS);
  const [tests, setTests] = useState<ExamTest[]>(INITIAL_TESTS);
  const [testResults, setTestResults] = useState<TestResult[]>(INITIAL_TEST_RESULTS);
  const [timetable] = useState<TimetableSlot[]>(INITIAL_TIMETABLE);
  const [syllabus, setSyllabus] = useState<SyllabusTopic[]>(INITIAL_SYLLABUS);
  const [homework, setHomework] = useState<HomeworkItem[]>(INITIAL_HOMEWORK);
  const [doubts, setDoubts] = useState<DoubtItem[]>(INITIAL_DOUBTS);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_STAFF);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [assets, setAssets] = useState<AssetItem[]>(INITIAL_ASSETS);
  const [chtqSchools] = useState<CHTQSchool[]>(INITIAL_CHTQ_SCHOOLS);
  const [chtqCandidates, setChtqCandidates] = useState<CHTQCandidate[]>(INITIAL_CHTQ_CANDIDATES);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    return INITIAL_STUDENTS.map(s => ({
      id: `att-${s.id}`,
      studentId: s.id,
      studentName: s.name,
      batchId: s.batchId,
      batchName: s.batchName,
      date: new Date().toISOString().split('T')[0],
      status: s.attendanceRate >= 80 ? 'present' : s.attendanceRate >= 70 ? 'late' : 'absent',
      checkInTime: '08:30 AM',
    }));
  });

  const addAuditLog = (action: string, module: string, details: string) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.roleTitle || 'Authorized Staff',
      action,
      module,
      details,
      timestamp: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
      ip: '192.168.1.100',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addStudent = (studentData: Partial<Student>): Student => {
    const nextNum = students.length + 1;
    const branch = branches.find(b => b.id === studentData.branchId) || branches[0];
    const batch = batches.find(b => b.id === studentData.batchId) || batches[0];
    const totalFee = studentData.feesTotal || 95000;
    const paid = studentData.feesPaid || 25000;

    const newStudent: Student = {
      id: `st-${String(nextNum).padStart(3, '0')}`,
      studentId: `CH-2026-${String(nextNum).padStart(3, '0')}`,
      admissionNo: `ADM-26-${String(nextNum).padStart(3, '0')}`,
      name: studentData.name || 'New Student',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      gender: studentData.gender || 'Male',
      dob: studentData.dob || '2008-05-15',
      email: studentData.email || `student.${nextNum}@careerheights.demo`,
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
      admissionDate: new Date().toISOString().split('T')[0],
      admissionSource: studentData.admissionSource || 'Direct Walk-in',
      scholarshipType: studentData.scholarshipType || 'None',
      scholarshipPercent: studentData.scholarshipPercent || 0,
      status: 'active',
      attendanceRate: 100,
      feesTotal: totalFee,
      feesPaid: paid,
      feesPending: totalFee - paid,
      feesOverdue: 0,
      academicRisk: 'Low',
      documentsCount: 2,
      pendingDocuments: 1,
      remarks: studentData.remarks || 'Newly enrolled student. Orientation scheduled.',
    };

    setStudents(prev => [newStudent, ...prev]);

    // Update branch student count
    setBranches(prev =>
      prev.map(b => (b.id === branch.id ? { ...b, studentCount: b.studentCount + 1 } : b))
    );

    addAuditLog('Created New Student Record', 'Student Management', `Enrolled ${newStudent.name} (${newStudent.studentId}) in batch ${newStudent.batchName} at ${newStudent.branchName}.`);

    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
    addAuditLog('Updated Student Profile', 'Student Management', `Modified profile for record ID: ${id}`);
  };

  const addEnquiry = (enquiryData: Partial<Enquiry>) => {
    const branch = branches.find(b => b.id === enquiryData.branchId) || branches[0];
    const newEnq: Enquiry = {
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
      date: new Date().toISOString().split('T')[0],
      nextFollowUp: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      notes: enquiryData.notes || 'Inquired regarding admission details.',
      counsellingHistory: [
        { date: new Date().toISOString().split('T')[0], notes: 'Initial enquiry registered.', by: currentUser?.name || 'Staff' }
      ]
    };
    setEnquiries(prev => [newEnq, ...prev]);
    addAuditLog('Registered New Admission Enquiry', 'Admission & Enquiry CRM', `Candidate ${newEnq.studentName} for course ${newEnq.targetCourse} at ${newEnq.branchName}.`);
  };

  const updateEnquiryStatus = (id: string, status: Enquiry['status'], lostReason?: string) => {
    setEnquiries(prev =>
      prev.map(e => (e.id === id ? { ...e, status, lostReason: lostReason || e.lostReason } : e))
    );
    addAuditLog('Updated Enquiry Pipeline Stage', 'Admission & Enquiry CRM', `Moved enquiry #${id} to status "${status}".`);
  };

  const convertEnquiryToAdmission = (enquiryId: string): Student | null => {
    const enq = enquiries.find(e => e.id === enquiryId);
    if (!enq) return null;
    const defaultBatch = batches[0];
    const newStudent = addStudent({
      name: enq.studentName || enq.name || 'Enrolled Student',
      parentName: enq.parentName || 'Parent Guardian',
      phone: enq.phone || '+91 94190 00000',
      email: enq.email || 'student@careerheights.demo',
      branchId: enq.branchId || branches[0].id,
      batchId: defaultBatch.id,
      batchName: defaultBatch.name,
      admissionSource: 'Direct Walk-in',
      status: 'active',
    });
    updateEnquiryStatus(enquiryId, 'admission');
    addAuditLog('Converted Enquiry to Admission', 'Admission & Enquiry CRM', `Enrolled lead ${enq.studentName} as new student.`);
    return newStudent;
  };

  const addCounsellingNote = (id: string, note: string) => {
    setEnquiries(prev =>
      prev.map(e => {
        if (e.id === id) {
          const newEntry = { date: new Date().toISOString().split('T')[0], notes: note, by: currentUser?.name || 'Counsellor' };
          return { ...e, counsellingHistory: [...e.counsellingHistory, newEntry] };
        }
        return e;
      })
    );
    addAuditLog('Added Counselling Interaction Note', 'Admission & Enquiry CRM', `Added note to enquiry ID: ${id}`);
  };

  const markBatchAttendance = (batchId: string, records: { studentId: string; status: 'present' | 'absent' | 'late' | 'leave' }[]) => {
    const batch = batches.find(b => b.id === batchId);
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Update students' local attendance rate
    setStudents(prev =>
      prev.map(s => {
        const found = records.find(r => r.studentId === s.id);
        if (found) {
          let newRate = s.attendanceRate;
          if (found.status === 'present') newRate = Math.min(100, Math.round(newRate * 0.98 + 2));
          else if (found.status === 'absent') newRate = Math.max(45, Math.round(newRate * 0.96));
          return { ...s, attendanceRate: newRate, academicRisk: newRate < 75 ? 'Critical' : newRate < 80 ? 'Medium' : 'Low' };
        }
        return s;
      })
    );

    addAuditLog('Marked Daily Attendance', 'Attendance', `Recorded attendance for ${records.length} students in batch ${batch?.name || batchId}.`);
  };

  const markStudentAttendance = (studentId: string, statusOrDate: string, maybeStatus?: 'present' | 'absent' | 'late' | 'leave') => {
    const dateStr = maybeStatus ? statusOrDate : new Date().toISOString().split('T')[0];
    const status = (maybeStatus || statusOrDate) as 'present' | 'absent' | 'late' | 'leave';
    setAttendanceRecords(prev => {
      const idx = prev.findIndex(r => r.studentId === studentId && r.date === dateStr);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], status };
        return updated;
      }
      const st = students.find(s => s.id === studentId);
      return [
        {
          id: `att-${Date.now()}-${studentId}`,
          studentId,
          studentName: st?.name || 'Student',
          batchId: st?.batchId || '',
          batchName: st?.batchName || '',
          date: dateStr,
          status,
          checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ];
    });

    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          let newRate = s.attendanceRate;
          if (status === 'present') newRate = Math.min(100, Math.round(newRate * 0.98 + 2));
          else if (status === 'absent') newRate = Math.max(45, Math.round(newRate * 0.96));
          return { ...s, attendanceRate: newRate, academicRisk: newRate < 75 ? 'Critical' : newRate < 80 ? 'Medium' : 'Low' };
        }
        return s;
      })
    );
  };

  const recordFeePayment = (paymentData: { studentId: string; amount: number; paymentMethod: FeeReceipt['paymentMethod']; transactionRef: string; notes: string }): FeeReceipt => {
    const student = students.find(s => s.id === paymentData.studentId)!;
    const rcptNo = `CH/RCPT/2026/${Math.floor(1000 + Math.random() * 9000)}`;

    const newReceipt: FeeReceipt = {
      id: `rcpt-${Date.now()}`,
      receiptNo: rcptNo,
      studentId: student.id,
      studentName: student.name,
      studentCode: student.studentId,
      branchName: student.branchName,
      batchName: student.batchName,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      transactionRef: paymentData.transactionRef,
      date: new Date().toISOString().split('T')[0],
      receivedBy: currentUser?.name || 'Imran Lone (Accounts)',
      notes: paymentData.notes,
    };

    setFeeReceipts(prev => [newReceipt, ...prev]);

    // Update student pending/paid amounts
    setStudents(prev =>
      prev.map(s => {
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

    addAuditLog('Generated Official Fee Receipt', 'Fees & Accounts', `Collected ₹${paymentData.amount.toLocaleString()} from ${student.name} (${student.studentId}) via ${paymentData.paymentMethod}. Receipt: ${rcptNo}`);

    return newReceipt;
  };

  const addTest = (testData: Partial<ExamTest>) => {
    const batch = batches.find(b => b.id === testData.batchId) || batches[0];
    const newTest: ExamTest = {
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
      testDate: testData.testDate || new Date().toISOString().split('T')[0],
      durationMinutes: testData.durationMinutes || 180,
      totalMarks: testData.totalMarks || 300,
      subjects: testData.subjects || [{ name: 'Physics', maxMarks: 100 }, { name: 'Chemistry', maxMarks: 100 }, { name: 'Mathematics', maxMarks: 100 }],
      status: 'scheduled',
    };
    setTests(prev => [newTest, ...prev]);
    addAuditLog('Created Examination Schedule', 'Examination & Test Series', `Scheduled test "${newTest.title}" for ${newTest.batchName}.`);
  };

  const runOmrSimulation = (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (!test) return;

    // Simulate batch scoring and evaluation
    setTests(prev =>
      prev.map(t => (t.id === testId ? { ...t, status: 'completed', topScore: 284, averageScore: 192 } : t))
    );

    const simulatedResults: TestResult[] = [
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

    setTestResults(prev => [...simulatedResults, ...prev]);
    addAuditLog('Executed OMR Automated Evaluation', 'Examination & Test Series', `Processed 38 OMR sheets for "${test.title}". Generated rankings and weak-topic diagnostics.`);
  };

  const submitDoubt = (doubtData: { subject: string; question: string }) => {
    const newDoubt: DoubtItem = {
      id: `dbt-${Date.now()}`,
      studentId: currentUser?.linkedStudentId || currentUser?.id || 'st-001',
      studentName: currentUser?.name || 'Aarav Sharma',
      studentCode: 'CH-2026-001',
      batchName: 'JEE-A',
      subject: doubtData.subject,
      question: doubtData.question,
      date: new Date().toISOString().split('T')[0],
      status: 'open',
    };
    setDoubts(prev => [newDoubt, ...prev]);
    addAuditLog('Student Submitted Academic Doubt', 'Academic Management', `Doubt in ${doubtData.subject} submitted by ${newDoubt.studentName}.`);
  };

  const answerDoubt = (doubtId: string, answer: string) => {
    setDoubts(prev =>
      prev.map(d =>
        d.id === doubtId
          ? {
              ...d,
              status: 'answered',
              answer,
              answeredBy: currentUser?.name || 'Faculty Member',
              answeredDate: new Date().toISOString().split('T')[0],
            }
          : d
      )
    );
    addAuditLog('Faculty Answered Academic Doubt', 'Academic Management', `Resolved doubt #${doubtId}.`);
  };

  const addHomework = (hwData: Partial<HomeworkItem>) => {
    const batch = batches.find(b => b.id === hwData.batchId) || batches[0];
    const newHw: HomeworkItem = {
      id: `hw-${Date.now()}`,
      batchId: batch.id,
      batchName: batch.name,
      subject: hwData.subject || 'Physics',
      facultyName: currentUser?.name || 'Dr. Rahul Sharma',
      title: hwData.title || 'Weekly Practice DPP',
      description: hwData.description || 'Solve provided problem set.',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: hwData.dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      submissionsCount: 0,
      totalStudents: batch.studentCount,
    };
    setHomework(prev => [newHw, ...prev]);
    addAuditLog('Assigned Homework DPP', 'Academic Management', `Assigned "${newHw.title}" to ${newHw.batchName}.`);
  };

  const uploadDocument = (docData: Partial<DocumentItem>) => {
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      entityType: docData.entityType || 'student',
      entityId: docData.entityId || 'st-001',
      entityName: docData.entityName || 'Aarav Sharma',
      docType: docData.docType || 'Aadhaar Card',
      fileName: docData.fileName || 'uploaded_document.pdf',
      fileSize: '1.4 MB',
      uploadedBy: currentUser?.name || 'System User',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    setDocuments(prev => [newDoc, ...prev]);
    addAuditLog('Uploaded Document for Verification', 'Document Management', `Document "${newDoc.fileName}" for ${newDoc.entityName}.`);
  };

  const updateDocumentStatus = (id: string, status: 'approved' | 'rejected', reason?: string) => {
    setDocuments(prev =>
      prev.map(d => (d.id === id ? { ...d, status, rejectionReason: reason } : d))
    );
    addAuditLog(`Document ${status.toUpperCase()}`, 'Document Management', `Set status to ${status} for doc ID #${id}.`);
  };

  const addAsset = (assetData: Partial<AssetItem>) => {
    const branch = branches.find(b => b.id === assetData.branchId) || branches[0];
    const newAsset: AssetItem = {
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
      purchaseDate: new Date().toISOString().split('T')[0],
      estimatedValue: assetData.estimatedValue || 25000,
    };
    setAssets(prev => [newAsset, ...prev]);
    addAuditLog('Logged Inventory Asset', 'Inventory & Assets', `Registered asset "${newAsset.name}" at ${newAsset.branchName}.`);
  };

  const addBranch = (branchData: Partial<Branch>) => {
    const nextCode = `CH-${(branchData.name || 'NEW').substring(0, 3).toUpperCase()}`;
    const newBranch: Branch = {
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
    setBranches(prev => [...prev, newBranch]);
    addAuditLog('Created New Organization Branch', 'Branch Management', `Provisioned new branch ${newBranch.name} (${newBranch.code}).`);
  };

  const updateLeaveStatus = (id: string, status: 'approved' | 'rejected') => {
    setLeaveRequests(prev =>
      prev.map(l => (l.id === id ? { ...l, status } : l))
    );
    addAuditLog(`Leave Request ${status.toUpperCase()}`, 'HR & Staff Management', `Updated leave application #${id}.`);
  };

  const updateChtqStatus = (id: string, updates: Partial<CHTQCandidate>) => {
    setChtqCandidates(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
    addAuditLog('Updated CHTQ Candidate Status', 'CHTQ / Scholarship Test', `Updated CHTQ record #${id}.`);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const sendBroadcastMessage = (data: { channel: 'sms' | 'whatsapp' | 'push'; target: string; message: string; template: string }) => {
    addAuditLog(
      `Dispatched ${data.channel.toUpperCase()} Notification`,
      'Communication Centre',
      `Sent broadcast to target "${data.target}" using template "${data.template}": ${data.message.substring(0, 60)}...`
    );
  };

  return (
    <ErpDataContext.Provider
      value={{
        branches,
        wings,
        classes,
        batches,
        students,
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
