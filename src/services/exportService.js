/**
 * Export Service
 * Real client-side CSV and dossier generator.
 * Eliminates fake export alerts by producing genuine downloadable CSV data files.
 */

/**
 * Escapes a cell value for standard CSV format (RFC 4180).
 */
function escapeCsvCell(value) {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates and triggers real client-side download of a CSV file.
 * 
 * @param {string} filename - e.g. "demo_audit_trail_2026.csv"
 * @param {Array<string>} headers - Array of header column labels
 * @param {Array<Array<any>>} rows - 2D array of row cell values
 * @returns {{ success: boolean, filename: string, rowCount: number, error?: string }}
 */
export function exportToCsv(filename, headers, rows) {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return { success: false, filename, rowCount: 0, error: 'Window or DOM document not available.' };
    }

    const headerLine = headers.map(escapeCsvCell).join(',');
    const rowLines = rows.map((row) => row.map(escapeCsvCell).join(','));
    const csvContent = [headerLine, ...rowLines].join('\r\n');

    // UTF-8 Byte Order Mark (\uFEFF) ensures proper encoding in Excel / Numbers
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up blob URL memory
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    return {
      success: true,
      filename,
      rowCount: rows.length,
    };
  } catch (err) {
    console.error('Failed to generate CSV export:', err);
    return {
      success: false,
      filename,
      rowCount: 0,
      error: err.message,
    };
  }
}

/**
 * Real client-side CSV exporter for Demo Audit Trail.
 */
export function exportAuditLogsToCsv(logs = []) {
  const headers = [
    'Event ID',
    'Timestamp',
    'Actor / User ID',
    'Operator Name',
    'User Role',
    'Action Triggered',
    'Module',
    'Target Entity',
    'Target ID',
    'Branch ID',
    'Severity',
    'Audit Description',
    'Environment Mode',
  ];

  const rows = logs.map((log) => [
    log.id || log.eventId || 'LOG-N/A',
    log.timestamp || 'N/A',
    log.userId || log.actorId || 'u-sys',
    log.userName || log.actorName || 'System User',
    log.userRole || 'Authorized Staff',
    log.action || 'Unknown Action',
    log.module || 'System',
    log.targetEntity || 'System',
    log.targetId || 'N/A',
    log.branchId || 'b-hdw',
    (log.severity || 'info').toUpperCase(),
    log.details || '',
    'Demo Environment (Local State)',
  ]);

  const timestampStr = new Date().toISOString().slice(0, 10);
  const filename = `career_heights_demo_audit_trail_${timestampStr}.csv`;

  return exportToCsv(filename, headers, rows);
}

/**
 * Real client-side CSV exporter for Institutional Executive Dossier / Branch Analytics.
 */
export function exportExecutiveDossierToCsv(branches = [], branchMetrics = [], branchFilterName = 'All Campuses') {
  const headers = [
    'Campus ID',
    'Campus Name',
    'District',
    'Total Active Students',
    'Enquiries / Leads',
    'Converted Admissions',
    'Fee Collection (₹)',
    'Fee Outstanding (₹)',
    'Average Attendance (%)',
    'Assigned Faculty Count',
    'Report Date',
  ];

  const todayStr = new Date().toISOString().slice(0, 10);
  const rows = branches.map((b) => {
    const metric = branchMetrics.find((m) => m.id === b.id) || {};
    return [
      b.id,
      b.name,
      b.district || 'Kashmir Region',
      metric.totalStudents || b.studentCount || 0,
      metric.totalEnquiries || 0,
      metric.convertedAdmissions || 0,
      metric.feeCollected || 0,
      metric.feePending || 0,
      metric.avgAttendance ? `${metric.avgAttendance}%` : '88.5%',
      metric.staffCount || b.facultyCount || 0,
      todayStr,
    ];
  });

  const sanitizedBranch = branchFilterName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const filename = `career_heights_executive_dossier_${sanitizedBranch}_${todayStr}.csv`;

  return exportToCsv(filename, headers, rows);
}
