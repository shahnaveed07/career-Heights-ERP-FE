/**
 * Notification Service & Event Architecture
 * 
 * Clean, decoupled notification event model designed for Career Heights ERP.
 * Maintains delivery adapters for future backend integration without falsely
 * claiming external SMS, WhatsApp, or Push telecom delivery in prototype mode.
 */

export const NOTIFICATION_EVENTS = {
  FEE_PAYMENT_RECORDED: 'FEE_PAYMENT_RECORDED',
  ABSENCE_RECORDED: 'ABSENCE_RECORDED',
  ATTENDANCE_CHECK_IN: 'ATTENDANCE_CHECK_IN',
  EXAM_SCHEDULED: 'EXAM_SCHEDULED',
  RESULT_DECLARED: 'RESULT_DECLARED',
  FEE_PAYMENT_DUE: 'FEE_PAYMENT_DUE',
  ACADEMIC_CIRCULAR: 'ACADEMIC_CIRCULAR',
  EMERGENCY_BROADCAST: 'EMERGENCY_BROADCAST',
  GUARDIAN_SUMMONS: 'GUARDIAN_SUMMONS',
};

/**
 * Maps each domain event to its designated recipient consumers.
 */
export const EVENT_CONSUMERS = {
  [NOTIFICATION_EVENTS.FEE_PAYMENT_RECORDED]: ['student', 'parent', 'accountant', 'admin'],
  [NOTIFICATION_EVENTS.ABSENCE_RECORDED]: ['parent', 'student', 'teacher', 'admin'],
  [NOTIFICATION_EVENTS.ATTENDANCE_CHECK_IN]: ['parent', 'student', 'admin'],
  [NOTIFICATION_EVENTS.EXAM_SCHEDULED]: ['student', 'parent', 'teacher', 'admin'],
  [NOTIFICATION_EVENTS.RESULT_DECLARED]: ['student', 'parent', 'admin'],
  [NOTIFICATION_EVENTS.FEE_PAYMENT_DUE]: ['parent', 'student', 'accountant', 'admin'],
  [NOTIFICATION_EVENTS.ACADEMIC_CIRCULAR]: ['student', 'parent', 'teacher', 'admin'],
  [NOTIFICATION_EVENTS.EMERGENCY_BROADCAST]: ['student', 'parent', 'teacher', 'admin'],
  [NOTIFICATION_EVENTS.GUARDIAN_SUMMONS]: ['parent', 'admin'],
};

/**
 * =======================================================================
 * EXTERNAL DELIVERY ADAPTER INTERFACES (For Future Backend Integration)
 * These adapters define the contract for backend integration.
 * In the current frontend prototype, they record demo status explicitly.
 * =======================================================================
 */

export class ExternalSmsGatewayAdapter {
  constructor(config = {}) {
    this.name = 'ExternalSmsGatewayAdapter (Telecom DLT/SMPP)';
    this.config = config;
  }

  async send(event, recipientPhone) {
    // Stage interface contract for backend integration:
    // Future implementation: POST /api/v1/integrations/sms/dispatch
    return {
      channel: 'sms',
      adapter: this.name,
      delivered: false,
      recipient: recipientPhone,
      mode: 'prototype_demo',
      status: 'Demo action recorded locally.',
      note: 'External carrier SMS gateway not connected in client demonstration mode.',
    };
  }
}

export class MetaWhatsAppBusinessAdapter {
  constructor(config = {}) {
    this.name = 'MetaWhatsAppBusinessAdapter (Cloud API)';
    this.config = config;
  }

  async send(event, recipientPhone) {
    // Stage interface contract for backend integration:
    // Future implementation: POST /api/v1/integrations/whatsapp/template-send
    return {
      channel: 'whatsapp',
      adapter: this.name,
      delivered: false,
      recipient: recipientPhone,
      mode: 'prototype_demo',
      status: 'Demo action recorded locally.',
      note: 'Meta WhatsApp Cloud API gateway not connected in client demonstration mode.',
    };
  }
}

export class WebPushNotificationAdapter {
  constructor(config = {}) {
    this.name = 'WebPushNotificationAdapter (VAPID / FCM)';
    this.config = config;
  }

  async send(event, userSubscription) {
    // Stage interface contract for backend integration:
    // Future implementation: POST /api/v1/integrations/push/notify
    return {
      channel: 'push',
      adapter: this.name,
      delivered: false,
      mode: 'prototype_demo',
      status: 'Demo action recorded locally.',
      note: 'Web Push notification service worker not connected in client demonstration mode.',
    };
  }
}

export class InAppDossierAdapter {
  constructor() {
    this.name = 'InAppDossierAdapter (Client State)';
  }

  record(eventRecord, dispatchCallback) {
    if (typeof dispatchCallback === 'function') {
      dispatchCallback(eventRecord);
    }
    return {
      channel: 'in_app',
      adapter: this.name,
      delivered: true,
      mode: 'local_state_persisted',
      status: 'Demo action recorded locally.',
    };
  }
}

// Staged adapter instances
export const defaultSmsAdapter = new ExternalSmsGatewayAdapter();
export const defaultWhatsAppAdapter = new MetaWhatsAppBusinessAdapter();
export const defaultPushAdapter = new WebPushNotificationAdapter();
export const defaultInAppAdapter = new InAppDossierAdapter();

/**
 * Factory to create a clean, standardized notification event structure.
 */
export function buildNotificationEvent({
  event,
  title,
  message,
  severity = 'info',
  targetEntity = 'Student',
  targetId = null,
  student = null,
  payload = {},
  customConsumers = null,
}) {
  const eventId = `notif-evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const consumers = customConsumers || EVENT_CONSUMERS[event] || ['admin'];

  return {
    eventId,
    id: eventId,
    event,
    title: title || event.replace(/_/g, ' '),
    message,
    severity,
    targetEntity,
    targetId: targetId || (student ? student.id : null),
    studentId: student?.id || null,
    studentName: student?.name || null,
    parentPhone: student?.parentPhone || student?.fatherPhone || null,
    parentEmail: student?.parentEmail || null,
    branchId: student?.branchId || null,
    timestamp: new Date().toISOString(),
    displayTime: 'Just now',
    read: false,
    consumers,
    payload,
    deliveryChannels: {
      in_app: {
        active: true,
        status: 'recorded_locally',
        recordedAt: new Date().toISOString(),
      },
      sms: {
        active: false,
        adapter: defaultSmsAdapter.name,
        status: 'pending_backend_integration',
        message: 'Demo action recorded locally.',
      },
      whatsapp: {
        active: false,
        adapter: defaultWhatsAppAdapter.name,
        status: 'pending_backend_integration',
        message: 'Demo action recorded locally.',
      },
      push: {
        active: false,
        adapter: defaultPushAdapter.name,
        status: 'pending_backend_integration',
        message: 'Demo action recorded locally.',
      },
    },
  };
}
