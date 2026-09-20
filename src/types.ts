export type Role =
  | 'ceo'
  | 'hq_admin'
  | 'branch_admin'
  | 'faculty'
  | 'student'
  | 'parent'
  | 'counsellor'
  | 'accountant'
  | 'hr_manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  roleTitle: string;
  avatar?: string;
  branchId?: string;
  branchName?: string;
  linkedStudentId?: string;
  linkedStudentName?: string;
  subject?: string;
  phone?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';
export type LeadStatus = 'new' | 'contacted' | 'counselling' | 'admission' | 'lost' | 'visited' | 'demo_class' | 'follow_up';

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  headFaculty: string;
  branchHead?: string;
  studentCount: number;
  capacity: number;
  facultyCount: number;
  classroomCount?: number;
  monthlyRevenue: number;
  collectionRate: number;
  attendanceRate: number;
  status: 'active' | 'in_setup';
}

export interface Wing {
  id: string;
  branchId: string;
  branchName: string;
  name: string;
  code: string;
  description: string;
}

export interface ClassItem {
  id: string;
  wingId: string;
  branchId: string;
  name: string;
  grade: string; // e.g. "Class 11", "Class 12", "Repeater"
  stream: 'Medical (NEET)' | 'Engineering (JEE)' | 'Foundation' | 'Commerce/Arts';
}

export interface Batch {
  id: string;
  classId: string;
  wingId: string;
  branchId: string;
  branchName: string;
  className: string;
  name: string;
  code: string;
  academicYear: string;
  facultyMentor: string;
  roomNumber: string;
  studentCount: number;
  capacity: number;
  timing: string;
  attendanceToday: number;
}

export interface Student {
  id: string;
  studentId: string; // e.g. CH-2026-001
  studentCode?: string;
  admissionNo: string;
  name: string;
  photo: string;
  avatar?: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  email: string;
  phone: string;
  address: string;
  branchId: string;
  branchName: string;
  wingId: string;
  classId: string;
  className: string;
  batchId: string;
  batchName: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  parentOccupation: string;
  schoolName: string;
  previousPercentage: number;
  admissionDate: string;
  admissionSource: 'Direct Walk-in' | 'CHTQ Scholarship' | 'Referral' | 'Website' | 'Seminar';
  scholarshipType: 'None' | 'CHTQ 100%' | 'CHTQ 75%' | 'CHTQ 50%' | 'Merit Waiver' | 'BPL Concession';
  scholarshipPercent: number;
  status: 'active' | 'at_risk' | 'inactive' | 'transferred';
  attendanceRate: number;
  feesTotal: number;
  feesPaid: number;
  feesPending: number;
  feesOverdue: number;
  academicRisk: 'Low' | 'Medium' | 'Critical';
  documentsCount: number;
  pendingDocuments: number;
  remarks: string;
}

export interface Enquiry {
  id: string;
  studentName: string;
  name?: string;
  parentName: string;
  phone: string;
  email: string;
  currentClass: string;
  targetCourse: string;
  branchId: string;
  branchName: string;
  counsellorId: string;
  counsellorName: string;
  assignedCounsellor?: string;
  status: LeadStatus;
  lostReason?: string;
  source: string;
  priority: 'high' | 'medium' | 'low';
  date: string;
  nextFollowUp: string;
  notes: string;
  counsellingHistory: { date: string; notes: string; by: string }[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentCode?: string;
  batchId: string;
  batchName: string;
  branchId?: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  markedBy?: string;
  checkInTime?: string;
  remarks?: string;
}

export interface FacultyAttendance {
  id: string;
  facultyId: string;
  facultyName: string;
  branchId: string;
  branchName: string;
  date: string;
  status: 'present' | 'absent' | 'leave' | 'half_day';
  checkInTime: string;
  checkOutTime?: string;
}

export interface FeeInstallment {
  installmentNo: number;
  title: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  branchId: string;
  branchName: string;
  batchName: string;
  courseName: string;
  totalAmount: number;
  concessionAmount: number;
  finalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  nextDueDate: string;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  installments: FeeInstallment[];
}

export interface FeeReceipt {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  branchName: string;
  batchName: string;
  amount: number;
  paymentMethod: 'UPI' | 'Net Banking' | 'Cash' | 'Cheque' | 'Card';
  transactionRef: string;
  date: string;
  receivedBy: string;
  notes: string;
}

export interface TimetableSlot {
  id: string;
  batchId: string;
  batchName: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  subject: string;
  facultyId: string;
  facultyName: string;
  roomNumber: string;
  topicTitle: string;
}

export interface SyllabusTopic {
  id: string;
  classId: string;
  className: string;
  subject: string;
  chapterNo: number;
  title: string;
  totalLectures: number;
  completedLectures: number;
  status: 'completed' | 'in_progress' | 'upcoming';
  completionPercent: number;
}

export interface HomeworkItem {
  id: string;
  batchId: string;
  batchName: string;
  subject: string;
  facultyName: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  submissionsCount: number;
  totalStudents: number;
}

export interface DoubtItem {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  batchName: string;
  subject: string;
  question: string;
  date: string;
  status: 'open' | 'answered';
  answer?: string;
  answeredBy?: string;
  answeredDate?: string;
}

export interface ExamTest {
  id: string;
  title: string;
  testType: 'online' | 'offline_omr';
  course: string;
  classId: string;
  className: string;
  batchId: string;
  batchName: string;
  branchId: string;
  branchName: string;
  testDate: string;
  durationMinutes: number;
  totalMarks: number;
  subjects: { name: string; maxMarks: number }[];
  status: 'scheduled' | 'evaluating' | 'completed';
  topScore?: number;
  averageScore?: number;
}

export interface TestResult {
  id: string;
  testId: string;
  testTitle: string;
  testDate: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  branchName: string;
  batchName: string;
  subjectMarks: { [subject: string]: number };
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  batchRank: number;
  branchRank: number;
  instituteRank: number;
  percentile: number;
  weakTopics: string[];
}

export interface DocumentItem {
  id: string;
  entityType: 'student' | 'staff';
  entityId: string;
  entityName: string;
  docType: 'Aadhaar Card' | 'Previous Marksheet' | 'Transfer Certificate' | 'Category Certificate' | 'Passport Photo' | 'Appointment Letter';
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadDate: string;
  status: 'pending' | 'uploaded' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'fee_overdue' | 'low_attendance' | 'new_admission' | 'new_enquiry' | 'document_pending' | 'test_result' | 'follow_up' | 'general';
  targetRoles: Role[];
  branchId?: string;
  branchName?: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface Employee {
  id: string;
  empCode: string;
  name: string;
  photo: string;
  email: string;
  phone: string;
  role: Role;
  designation: string;
  department: 'Academic' | 'Administration' | 'Counselling' | 'Accounts' | 'Operations' | 'Executive';
  branchId: string;
  branchName: string;
  joiningDate: string;
  monthlySalary: number;
  incentives: number;
  status: 'active' | 'on_leave' | 'resigned';
  qualifications: string;
  attendanceRate: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  branchName: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Academic Duty' | 'Emergency';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
}

export interface AssetItem {
  id: string;
  code: string;
  name: string;
  category: 'Furniture' | 'Computers & IT' | 'Projectors & AV' | 'Books & Library' | 'OMR Sheets' | 'Stationery' | 'Uniform/T-shirts' | 'Lab Equipment';
  branchId: string;
  branchName: string;
  quantity: number;
  unit: string;
  locationRoom: string;
  condition: 'good' | 'fair' | 'needs_repair';
  status: 'in_use' | 'available' | 'maintenance' | 'low_stock';
  purchaseDate: string;
  estimatedValue: number;
}

export interface CHTQSchool {
  id: string;
  name: string;
  location: string;
  contactPerson: string;
  phone: string;
  registeredCount: number;
  testCenter: string;
}

export interface CHTQCandidate {
  id: string;
  rollNo: string;
  candidateName: string;
  schoolName: string;
  classApplied: string;
  examType: 'omr' | 'online';
  score: number;
  totalMarks: number;
  rank: number;
  scholarshipPercent: number;
  counsellingStatus: 'pending' | 'scheduled' | 'completed';
  admissionStatus: 'converted' | 'pending' | 'dropped';
  contactPhone: string;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  user?: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ip: string;
  ipAddress?: string;
  severity?: 'info' | 'warning' | 'security';
}
