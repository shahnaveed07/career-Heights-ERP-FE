/**
 * Audit Trail Service
 * 
 * Manages standardized system audit events.
 * 
 * NOTE: Does NOT claim "immutable" persistence on this frontend prototype.
 * Identified as "Demo Audit Trail" pending true backend server-side write-once persistence.
 */

import { exportAuditLogsToCsv } from './exportService';

export const AUDIT_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  SECURITY: 'security',
};

/**
 * Constructs a conceptual audit event adhering to compliance standards.
 */
export function buildAuditEvent({
  eventId = null,
  actorId = 'sys',
  actorName = 'System User',
  userRole = 'Authorized Staff',
  action = 'System Event',
  module = 'Core',
  targetEntity = 'System',
  targetId = 'N/A',
  oldValue = null,
  newValue = null,
  branchId = 'b-hdw',
  severity = AUDIT_SEVERITY.INFO,
  details = '',
}) {
  const generatedId = eventId || `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  return {
    id: generatedId,
    eventId: generatedId,
    userId: actorId,
    actorId,
    userName: actorName,
    actorName,
    userRole,
    action,
    module,
    targetEntity,
    targetId: String(targetId || 'N/A'),
    oldValue: oldValue !== undefined ? oldValue : null,
    newValue: newValue !== undefined ? newValue : null,
    branchId: branchId || 'b-hdw',
    severity: severity || AUDIT_SEVERITY.INFO,
    details: details || `${action} on ${targetEntity} #${targetId}`,
    timestamp: new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }),
    isoTimestamp: new Date().toISOString(),
    persistenceMode: 'Demo Audit Trail (Local State)',
    ip: 'Demo Environment',
  };
}

export { exportAuditLogsToCsv };
