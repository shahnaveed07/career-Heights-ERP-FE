/**
 * Parent Notifications Data & Event Structures
 * 
 * Formal data/event structures for:
 * - absence
 * - attendance
 * - exams
 * - results
 * - fee due
 * - payment confirmation
 * - receipt
 * - academic notices
 * - emergency notices
 * 
 * NOTE: Does NOT fake external SMS/WhatsApp/push delivery.
 * All records represent in-app notification events queued in local parent dossiers.
 */

export const NOTIFICATION_EVENT_TYPES = {
  ABSENCE: 'absence',
  ATTENDANCE: 'attendance',
  EXAMS: 'exams',
  RESULTS: 'results',
  FEE_DUE: 'fee_due',
  PAYMENT_CONFIRMATION: 'payment_confirmation',
  RECEIPT: 'receipt',
  ACADEMIC_NOTICES: 'academic_notices',
  EMERGENCY_NOTICES: 'emergency_notices',
};

export const NOTIFICATION_TYPE_CONFIG = {
  absence: {
    label: 'Absence Alert',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600',
  },
  attendance: {
    label: 'Campus Punch-In',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    iconColor: 'text-emerald-600',
  },
  exams: {
    label: 'Exam Schedule',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    iconColor: 'text-blue-600',
  },
  results: {
    label: 'Result Published',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    iconColor: 'text-purple-600',
  },
  fee_due: {
    label: 'Fee Due',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    iconColor: 'text-amber-600',
  },
  payment_confirmation: {
    label: 'Payment Confirmed',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    iconColor: 'text-emerald-600',
  },
  receipt: {
    label: 'Fee Receipt',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    iconColor: 'text-indigo-600',
  },
  academic_notices: {
    label: 'Academic Notice',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    iconColor: 'text-sky-600',
  },
  emergency_notices: {
    label: 'Emergency Alert',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    iconColor: 'text-rose-600',
  },
};

/**
 * Creates an event structure for student absence.
 */
export function createAbsenceNotificationEvent({ student, date, session = 'Regular Session', reason }) {
  const timestamp = new Date().toISOString();
  return {
    id: `pnotif-${Date.now()}-${student.id}-abs`,
    type: NOTIFICATION_EVENT_TYPES.ABSENCE,
    studentId: student.id,
    studentName: student.name,
    studentCode: student.studentCode || student.studentId,
    parentName: student.parentName || student.guardianName,
    parentPhone: student.parentPhone || student.guardianPhone,
    parentEmail: student.parentEmail || student.guardianEmail,
    branchId: student.branchId,
    branchName: student.branchName,
    title: 'Daily Absence Alert',
    message: `${student.name} was marked absent for ${session} on ${date}.${reason ? ` Reason: ${reason}` : ' Please notify the campus if this was pre-arranged.'}`,
    channel: 'in_app_dispatch_queue',
    deliveryStatus: 'ready',
    timestamp,
    date,
    read: false,
    metadata: {
      session,
      batch: student.batchName,
      class: student.className,
      wing: student.wingName,
    },
  };
}

/**
 * Creates an event structure for daily attendance punch-in.
 */
export function createAttendanceNotificationEvent({ student, date, checkInTime, status = 'present' }) {
  const timestamp = new Date().toISOString();
  return {
    id: `pnotif-${Date.now()}-${student.id}-att`,
    type: NOTIFICATION_EVENT_TYPES.ATTENDANCE,
    studentId: student.id,
    studentName: student.name,
    studentCode: student.studentCode || student.studentId,
    parentName: student.parentName || student.guardianName,
    parentPhone: student.parentPhone || student.guardianPhone,
    parentEmail: student.parentEmail || student.guardianEmail,
    branchId: student.branchId,
    branchName: student.branchName,
    title: status === 'late' ? 'Late Arrival Recorded' : 'Campus Check-In Confirmed',
    message: `${student.name} checked into ${student.branchName} campus at ${checkInTime || '08:30 AM'} (Status: ${status.toUpperCase()}).`,
    channel: 'in_app_dispatch_queue',
    deliveryStatus: 'ready',
    timestamp,
    date,
    read: false,
    metadata: {
      time: checkInTime || '08:30 AM',
      batch: student.batchName,
      status,
    },
  };
}

/**
 * Creates an event structure for an exam announcement.
 */
export function createExamNotificationEvent({ student, test }) {
  const timestamp = new Date().toISOString();
  return {
    id: `pnotif-${Date.now()}-${student.id}-exm`,
    type: NOTIFICATION_EVENT_TYPES.EXAMS,
    studentId: student.id,
    studentName: student.name,
    studentCode: student.studentCode || student.studentId,
    parentName: student.parentName || student.guardianName,
    parentPhone: student.parentPhone,
    parentEmail: student.parentEmail,
    branchId: student.branchId,
    branchName: student.branchName,
    title: `Exam Schedule: ${test.title}`,
    message: `${test.title} is scheduled for ${test.testDate || 'upcoming week'} (${test.durationMinutes || 180} mins, ${test.totalMarks || 300} marks).`,
    channel: 'in_app_dispatch_queue',
    deliveryStatus: 'ready',
    timestamp,
    date: test.testDate || new Date().toISOString().split('T')[0],
    read: false,
    metadata: {
      testId: test.id,
      examTitle: test.title,
      examDate: test.testDate,
      totalMarks: test.totalMarks,
    },
  };
}

/**
 * Creates an event structure for an evaluated test result.
 */
export function createResultNotificationEvent({ student, result }) {
  const timestamp = new Date().toISOString();
  return {
    id: `pnotif-${Date.now()}-${student.id}-res`,
    type: NOTIFICATION_EVENT_TYPES.RESULTS,
    studentId: student.id,
    studentName: student.name,
    studentCode: student.studentCode || student.studentId,
    parentName: student.parentName || student.guardianName,
    parentPhone: student.parentPhone,
    parentEmail: student.parentEmail,
    branchId: student.branchId,
    branchName: student.branchName,
    title: `Scorecard Published: ${result.testTitle}`,
    message: `${student.name} scored ${result.totalMarksObtained} / ${result.totalMaxMarks} (${result.percentile}%ile), securing Rank #${result.instituteRank || 1}.`,
    channel: 'in_app_dispatch_queue',
    deliveryStatus: 'ready',
    timestamp,
    date: result.testDate || new Date().toISOString().split('T')[0],
    read: false,
    metadata: {
      testTitle: result.testTitle,
      score: result.totalMarksObtained,
      maxMarks: result.totalMaxMarks,
      percentile: result.percentile,
      rank: result.instituteRank,
      weakTopics: result.weakTopics || [],
    },
  };
}

/**
 * Creates an event structure for fee due notices.
 */
export function createFeeDueNotificationEvent({ student, installmentName, amountDue, dueDate }) {
  const timestamp = new Date().toISOString();
  return {
    id: `pnotif-${Date.now()}-${student.id}-due`,
    type: NOTIFICATION_EVENT_TYPES.FEE_DUE,
    studentId: student.id,
    studentName: student.name,
    studentCode: student.studentCode || student.studentId,
    parentName: student.parentName || student.guardianName,
    parentPhone: student.parentPhone,
    parentEmail: student.parentEmail,
    branchId: student.branchId,
    branchName: student.branchName,
    title: `Fee Due Notice: ${installmentName}`,
    message: `${installmentName} of ₹${Number(amountDue).toLocaleString()} for ${student.name} is due by ${dueDate}.`,
    channel: 'in_app_dispatch_queue',
    deliveryStatus: 'ready',
    timestamp,
    date: new Date().toISOString().split('T')[0],
    read: false,
    metadata: {
      amountDue: Number(amountDue),
      dueDate,
      installment: installmentName,
    },
  };
}

/**
 * Creates an event structure for payment confirmation.
 */
export function createPaymentConfirmationNotificationEvent({ student, payment }) {
  const timestamp = new Date().toISOString();
  return {
    id: `pnotif-${Date.now()}-${student.id}-pay`,
    type: NOTIFICATION_EVENT_TYPES.PAYMENT_CONFIRMATION,
    studentId: student.id,
    studentName: student.name,
    studentCode: student.studentCode || student.studentId,
    parentName: student.parentName || student.guardianName,
    parentPhone: student.parentPhone,
    parentEmail: student.parentEmail,
    branchId: student.branchId,
    branchName: student.branchName,
    title: 'Payment Received & Credited',
    message: `Payment of ₹${Number(payment.amount).toLocaleString()} via ${payment.paymentMethod} (Ref: ${payment.transactionRef}) received for ${student.name}.`,
    channel: 'in_app_dispatch_queue',
    deliveryStatus: 'ready',
    timestamp,
    date: payment.date || new Date().toISOString().split('T')[0],
    read: false,
    metadata: {
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      ref: payment.transactionRef,
      installment: payment.installment,
    },
  };
}

/**
 * Creates an event structure for fee receipt.
 */
export function createReceiptNotificationEvent({ student, receipt }) {
  const timestamp = new Date().toISOString();
  return {
    id: `pnotif-${Date.now()}-${student.id}-rcpt`,
    type: NOTIFICATION_EVENT_TYPES.RECEIPT,
    studentId: student.id,
    studentName: student.name,
    studentCode: student.studentCode || student.studentId,
    parentName: student.parentName || student.guardianName,
    parentPhone: student.parentPhone,
    parentEmail: student.parentEmail,
    branchId: student.branchId,
    branchName: student.branchName,
    title: `Fee Receipt Issued: ${receipt.receiptNo}`,
    message: `Receipt ${receipt.receiptNo} for ₹${Number(receipt.amount).toLocaleString()} has been generated and filed in student accounts.`,
    channel: 'in_app_dispatch_queue',
    deliveryStatus: 'ready',
    timestamp,
    date: receipt.date || new Date().toISOString().split('T')[0],
    read: false,
    metadata: {
      receiptNo: receipt.receiptNo,
      amount: receipt.amount,
      transactionRef: receipt.transactionRef,
    },
  };
}

/**
 * Creates an event structure for academic notices.
 */
export function createAcademicNoticeNotificationEvent({ title, message, batchId, branchId, metadata = {} }) {
  const timestamp = new Date().toISOString();
  return {
    id: `pnotif-${Date.now()}-acad`,
    type: NOTIFICATION_EVENT_TYPES.ACADEMIC_NOTICES,
    studentId: null,
    studentName: 'Assigned Batch / Course',
    studentCode: 'ACAD',
    parentName: 'Parents of Batch',
    parentPhone: '',
    parentEmail: '',
    branchId: branchId || 'all',
    branchName: branchId ? `${branchId} Campus` : 'All Campuses',
    title,
    message,
    channel: 'in_app_dispatch_queue',
    deliveryStatus: 'ready',
    timestamp,
    date: new Date().toISOString().split('T')[0],
    read: false,
    metadata: {
      batchId,
      ...metadata,
    },
  };
}

/**
 * Creates an event structure for emergency notices.
 */
export function createEmergencyNoticeNotificationEvent({ title, message, branchId = 'all', metadata = {} }) {
  const timestamp = new Date().toISOString();
  return {
    id: `pnotif-${Date.now()}-emg`,
    type: NOTIFICATION_EVENT_TYPES.EMERGENCY_NOTICES,
    studentId: null,
    studentName: 'All Enrolled Students',
    studentCode: 'ALL',
    parentName: 'All Parents & Guardians',
    parentPhone: '',
    parentEmail: '',
    branchId,
    branchName: branchId === 'all' ? 'All Campuses' : `${branchId} Campus`,
    title,
    message,
    channel: 'in_app_dispatch_queue',
    deliveryStatus: 'ready',
    timestamp,
    date: new Date().toISOString().split('T')[0],
    read: false,
    metadata: {
      severity: 'urgent',
      ...metadata,
    },
  };
}
