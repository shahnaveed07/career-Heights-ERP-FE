/**
 * Career Heights ERP — Part 6
 * Centralized Notification & Communication Event Structures
 * 
 * Prepares strict, notification-ready data structures for:
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
 * In accordance with ERP specifications:
 * DOES NOT fake external SMS/WhatsApp/push gateway delivery.
 * Maintains reliable internal event log ready for notification pipelines.
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

export const NOTIFICATION_TYPE_LABELS = {
  [NOTIFICATION_EVENT_TYPES.ABSENCE]: 'Absence Alert',
  [NOTIFICATION_EVENT_TYPES.ATTENDANCE]: 'Attendance Update',
  [NOTIFICATION_EVENT_TYPES.EXAMS]: 'Exam Schedule Notice',
  [NOTIFICATION_EVENT_TYPES.RESULTS]: 'Test Result Published',
  [NOTIFICATION_EVENT_TYPES.FEE_DUE]: 'Fee Due Reminder',
  [NOTIFICATION_EVENT_TYPES.PAYMENT_CONFIRMATION]: 'Payment Confirmation',
  [NOTIFICATION_EVENT_TYPES.RECEIPT]: 'Fee Receipt Generated',
  [NOTIFICATION_EVENT_TYPES.ACADEMIC_NOTICES]: 'Academic Notice',
  [NOTIFICATION_EVENT_TYPES.EMERGENCY_NOTICES]: 'Emergency Campus Notice',
};

/**
 * Creates a notification event record.
 */
export function createNotificationEvent({
  type,
  title,
  message,
  studentId,
  studentName,
  studentCode,
  parentName,
  parentPhone,
  parentEmail,
  branchId,
  branchName,
  metadata = {},
  timestamp = new Date().toISOString(),
}) {
  if (!Object.values(NOTIFICATION_EVENT_TYPES).includes(type)) {
    throw new Error(`Invalid notification event type: ${type}`);
  }

  const id = `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  return {
    id,
    type,
    title: title || NOTIFICATION_TYPE_LABELS[type] || 'Campus Notice',
    message,
    studentId: studentId || null,
    studentName: studentName || '',
    studentCode: studentCode || '',
    parentName: parentName || '',
    parentPhone: parentPhone || '',
    parentEmail: parentEmail || '',
    branchId: branchId || 'b-hdw',
    branchName: branchName || 'Handwara',
    channel: 'in_app_dispatch_queue',
    deliveryStatus: 'ready', // Ready for downstream notification transport without faking network delivery
    timestamp,
    date: timestamp.split('T')[0],
    read: false,
    metadata,
  };
}
