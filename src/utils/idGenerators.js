export function generateNextStudentId(existingStudents) {
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
export function generateNextReceiptNo(existingReceipts) {
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
  const nextNum = maxNum > 0 ? maxNum + 1 : 1;
  const padded = String(nextNum).padStart(6, '0');
  return {
    receiptNo: `CH/RCPT/${currentYear}/${padded}`,
    id: `rcpt-${nextNum}`,
  };
}
export function generateNextTransactionRef(existingReceipts) {
  let maxNum = 0;
  for (const r of existingReceipts) {
    const match = r.transactionRef?.match(/TXN-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  const nextNum = maxNum >= 1e5 ? maxNum + 1 : 100001;
  return `TXN-${nextNum}`;
}
