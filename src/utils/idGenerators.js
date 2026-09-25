export function generateNextStudentId(existingStudents = []) {
  let maxNum = 0;
  const currentYear = new Date().getFullYear();
  const shortYear = String(currentYear).slice(-2);
  for (const s of existingStudents) {
    const match1 = s.studentId?.match(/CH-\d+-(\d+)/i);
    if (match1) {
      const num = parseInt(match1[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
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
 * Stable generator for Fee Receipts.
 * Uses max numerical index found in existing receipt numbers / IDs,
 * never depending on volatile array length.
 */
export function generateNextReceiptNo(existingReceipts = []) {
  let maxNum = 0;
  const currentYear = new Date().getFullYear();
  for (const r of existingReceipts) {
    if (!r) continue;
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
  const nextNum = maxNum > 0 ? maxNum + 1 : 1;
  const padded = String(nextNum).padStart(6, '0');
  return {
    receiptNo: `CH/RCPT/${currentYear}/${padded}`,
    id: `rcpt-${nextNum}`,
  };
}

/**
 * Stable generator for Payment Records.
 * Independent of array length to prevent collisions on filter or deletion.
 */
export function generateNextPaymentId(existingPayments = []) {
  let maxNum = 0;
  const currentYear = new Date().getFullYear();
  for (const p of existingPayments) {
    if (!p) continue;
    const match = p.id?.match(/pay-\d+-(\d+)/i) || p.id?.match(/pay-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  const nextNum = maxNum > 0 ? maxNum + 1 : 1;
  const padded = String(nextNum).padStart(6, '0');
  return `pay-${currentYear}-${padded}`;
}

/**
 * Stable generator for Transaction Reference IDs.
 */
export function generateNextTransactionRef(method = 'UPI', existingPayments = [], existingReceipts = []) {
  let maxNum = 0;
  const allRecords = [...(existingPayments || []), ...(existingReceipts || [])];
  for (const r of allRecords) {
    if (!r || !r.transactionRef) continue;
    const match = r.transactionRef.match(/(?:TXN|NEFT)-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  const nextSeq = maxNum >= 100000 ? maxNum + 1 : 100001;
  const currentYear = new Date().getFullYear();

  switch (method) {
    case 'UPI':
      return `UPI-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    case 'Bank Transfer / NEFT':
    case 'Net Banking':
      return `NEFT-${currentYear}-${nextSeq}`;
    case 'Cheque':
      return `CHQ-${Math.floor(100000 + Math.random() * 900000)}`;
    case 'Card':
      return `CRD-${Date.now().toString().slice(-6)}`;
    case 'Cash':
      return `CSH-${Math.floor(1000 + Math.random() * 9000)}`;
    default:
      return `TXN-${nextSeq}`;
  }
}

/**
 * Validates whether a transaction reference is already in use by another payment or receipt.
 */
export function isTransactionRefDuplicate(ref, existingPayments = [], existingReceipts = [], currentPaymentId = null) {
  if (!ref || typeof ref !== 'string') return false;
  const normalized = ref.trim().toLowerCase();
  if (normalized.startsWith('csh-')) {
    // Cash vouchers can share sequential codes across days if desired
    return false;
  }

  for (const p of existingPayments || []) {
    if (currentPaymentId && p.id === currentPaymentId) continue;
    if (p.transactionRef && p.transactionRef.trim().toLowerCase() === normalized) {
      return true;
    }
  }

  for (const r of existingReceipts || []) {
    if (r.transactionRef && r.transactionRef.trim().toLowerCase() === normalized) {
      return true;
    }
  }

  return false;
}
