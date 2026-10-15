/**
 * Formatting utilities for JobPilot
 */

/**
 * Format salary in Indian Rupees (INR)
 * e.g. 850000 -> ₹8,50,000
 */
export const formatINR = (val) => {
  if (val === undefined || val === null || val === '') return '—';
  const num = Number(val);
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Format date string into readable format (e.g. Oct 15, 2026)
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

/**
 * Format time string into readable format (e.g. 2:30 PM)
 */
export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
};

/**
 * Sanitize cell value to prevent CSV Formula Injection (DDE injection)
 * Strips or prefixes leading =, +, -, @, \t, \r characters
 */
const sanitizeCSVCell = (val) => {
  if (val === undefined || val === null) return '""';
  let str = String(val).replace(/"/g, '""');
  // Check for CSV formula injection characters
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str}"`;
};

/**
 * Export job applications array to a CSV file download
 */
export const exportApplicationsToCSV = (applications = []) => {
  if (!applications || applications.length === 0) {
    alert('No applications to export.');
    return;
  }

  const headers = [
    'Company',
    'Role',
    'Status',
    'Expected Salary (INR)',
    'Confirmed Offer (INR)',
    'Location',
    'Application Date',
    'Interview Date',
    'Follow-Up Date',
    'Is Favorite',
    'Notes',
  ];

  const rows = applications.map((app) => [
    sanitizeCSVCell(app.company),
    sanitizeCSVCell(app.role),
    sanitizeCSVCell(app.status),
    sanitizeCSVCell(app.salary ? app.salary : ''),
    sanitizeCSVCell(app.offeredSalary ? app.offeredSalary : ''),
    sanitizeCSVCell(app.location || ''),
    sanitizeCSVCell(app.applicationDate ? app.applicationDate.slice(0, 10) : ''),
    sanitizeCSVCell(app.interviewDate ? app.interviewDate.slice(0, 10) : ''),
    sanitizeCSVCell(app.followUpDate ? app.followUpDate.slice(0, 10) : ''),
    sanitizeCSVCell(app.isFavorite ? 'Yes' : 'No'),
    sanitizeCSVCell(app.notes || ''),
  ]);

  const csvContent = [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join(
    '\r\n'
  );

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `jobpilot-applications-${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
