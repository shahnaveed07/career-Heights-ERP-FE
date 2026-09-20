/**
 * Deterministic ID and Receipt Number Generators for Career Heights ERP
 * Replaces random numbers and length-based indexing with collision-free,
 * sequential generators that inspect existing state.
 */

import { Student, FeeReceipt } from '../types';

/**
 * Generates the next sequential, deterministic Student ID and Admission Number.
 * Format: CH-2026-001, CH-2026-002, etc.
 */
export function generateNextStudentId(existingStudents: Student[]): {
  studentId: string;
  id: string;
  admissionNo: string;
} {
  let maxNum = 0;
  const currentYear = new Date().getFullYear();
  const shortYear = String(currentYear).slice(-2);

  for (const s of existingStudents) {
    // Check CH-YYYY-XXX or CH-2026-XXX
    const match1 = s.studentId?.match(/CH-\d+-(\d+)/i);
    if (match1) {
      const num = parseInt(match1[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
    // Check id st-XXX
    const match2 = s.id?.match(/st-(\d+)/i);
    if (match2) {
      const num = parseInt(match2[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  const nextNum = maxNum + 1;
  const padded = String(nextNum).padStart(3, '0');

  return {
    studentId: `CH-${currentYear}-${padded}`,
    id: `st-${padded}`,
    admissionNo: `ADM-${shortYear}-${padded}`,
  };
}

/**
 * Generates the next sequential, deterministic Fee Receipt Number.
 * Format: CH/RCPT/2026/001001, CH/RCPT/2026/001002, etc.
 */
export function generateNextReceiptNo(existingReceipts: FeeReceipt[]): {
  receiptNo: string;
  id: string;
} {
  let maxNum = 0;
  const currentYear = new Date().getFullYear();

  for (const r of existingReceipts) {
    const match = r.receiptNo?.match(/CH\/RCPT\/\d+\/(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
    const matchId = r.id?.match(/rcpt-(\d+)/i);
    if (matchId) {
      const num = parseInt(matchId[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  // If previous receipts were e.g. 893, next is 894; if none, start at 1001
  const nextNum = maxNum > 0 ? maxNum + 1 : 1001;
  const padded = String(nextNum).padStart(6, '0');

  return {
    receiptNo: `CH/RCPT/${currentYear}/${padded}`,
    id: `rcpt-${nextNum}`,
  };
}
