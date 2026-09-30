// ============================================================
// FormFlow — Utility Functions
// ============================================================

import { nanoid } from 'nanoid';
import { FormSchema } from './types';

/**
 * Generate a unique ID for fields, rules, etc.
 */
export function generateId(prefix: string = 'q'): string {
  return `${prefix}_${nanoid(8)}`;
}

/**
 * Generate a short public slug for published forms.
 */
export function generateSlug(): string {
  return nanoid(7);
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date with time.
 */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

/**
 * Convert a form's responses to CSV text.
 */
export function responsesToCSV(
  fields: { id: string; label: string }[],
  responses: { id: string; submitted_at: string; answers: Record<string, unknown> }[]
): string {
  const headers = ['Response ID', 'Submission Date', ...fields.map((f) => f.label)];

  const rows = responses.map((r) => {
    const cols = [
      r.id,
      formatDateTime(r.submitted_at),
      ...fields.map((f) => {
        const val = r.answers[f.id];
        if (val === null || val === undefined) return '';
        if (Array.isArray(val)) return val.join('; ');
        return String(val);
      }),
    ];
    return cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',');
  });

  return [headers.map((h) => `"${h}"`).join(','), ...rows].join('\n');
}

/**
 * Convert form schema and its questions/fields into clean CSV text.
 */
export function formSchemaToCSV(schema: FormSchema): string {
  const headers = [
    'Question #',
    'Question ID',
    'Field Type',
    'Question Title',
    'Description / Subtitle',
    'Required',
    'Options',
    'Placeholder / Button Text',
    'Validation / Rules',
  ];

  const rows = schema.fields.map((f, i) => {
    let validationStr = '';
    if (f.type === 'rating') validationStr = `Max Stars: ${f.maxStars || 5}`;
    if (f.type === 'short_text' && f.validation) {
      const parts = [];
      if (f.validation.minLength) parts.push(`Min: ${f.validation.minLength}`);
      if (f.validation.maxLength) parts.push(`Max: ${f.validation.maxLength}`);
      validationStr = parts.join(', ');
    }
    if (f.type === 'paragraph' && f.validation?.charLimit) {
      validationStr = `Char Limit: ${f.validation.charLimit}`;
    }
    if (f.type === 'file_upload' && f.validation) {
      const types = (f.validation.allowedFileTypes || []).join('/');
      validationStr = `Max: ${f.validation.maxFileSize || 10}MB${types ? ` (${types})` : ''}`;
    }
    if (f.type === 'date_picker' && f.validation) {
      const parts = [];
      if (f.validation.minDate) parts.push(`Min Date: ${f.validation.minDate}`);
      if (f.validation.maxDate) parts.push(`Max Date: ${f.validation.maxDate}`);
      validationStr = parts.join(', ');
    }

    const cols = [
      i + 1,
      f.id,
      f.type,
      f.label,
      f.description || '',
      f.required ? 'Yes' : 'No',
      (f.options || []).join('; '),
      f.placeholder || f.buttonText || '',
      validationStr,
    ];
    return cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',');
  });

  return [
    `"Form Title","${String(schema.title).replace(/"/g, '""')}"`,
    `"Form Description","${String(schema.description || '').replace(/"/g, '""')}"`,
    `"Total Questions","${schema.fields.length}"`,
    '',
    headers.map((h) => `"${h}"`).join(','),
    ...rows,
  ].join('\r\n');
}

/**
 * Download a string as a file.
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Classname utility (simplified clsx).
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Convert form responses to an Excel (.xlsx) workbook and trigger download.
 */
export function responsesToExcel(
  formTitle: string,
  fields: { id: string; label: string; type?: string }[],
  responses: { id: string; submitted_at: string; answers: Record<string, unknown> }[]
) {
  // Dynamic import to keep xlsx out of initial bundle
  import('xlsx').then((XLSX) => {
    // Build header row
    const headers = ['#', 'Response ID', 'Submission Date', ...fields.map((f) => f.label)];

    // Build data rows
    const data = responses.map((r, idx) => {
      const row: (string | number)[] = [
        idx + 1,
        r.id,
        formatDateTime(r.submitted_at),
        ...fields.map((f) => {
          const val = r.answers[f.id];
          if (val === null || val === undefined) return '';
          if (Array.isArray(val)) return val.join(', ');
          return String(val);
        }),
      ];
      return row;
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Auto-fit column widths
    const colWidths = headers.map((h, colIdx) => {
      let maxLen = h.length;
      data.forEach((row) => {
        const cellLen = String(row[colIdx] ?? '').length;
        if (cellLen > maxLen) maxLen = cellLen;
      });
      return { wch: Math.min(maxLen + 4, 50) };
    });
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Responses');

    // Add a summary sheet
    const summaryData = [
      ['Form Title', formTitle],
      ['Total Responses', responses.length],
      ['Export Date', formatDateTime(new Date().toISOString())],
      [''],
      ['Field Summary'],
      ['Field Name', 'Field Type', 'Responses Answered'],
      ...fields.map((f) => [
        f.label,
        f.type || 'unknown',
        responses.filter((r) => r.answers[f.id] !== null && r.answers[f.id] !== undefined && r.answers[f.id] !== '').length,
      ]),
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Generate and download
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadBlob(blob, `${formTitle.replace(/\s+/g, '_')}_responses.xlsx`);
  });
}

/**
 * Download a Blob as a file.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
