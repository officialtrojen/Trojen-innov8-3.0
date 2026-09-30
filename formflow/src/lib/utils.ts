// ============================================================
// FormFlow — Utility Functions
// ============================================================

import { nanoid } from 'nanoid';

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
 * Convert a form schema's fields to CSV text.
 */
export function formSchemaToCSV(schema: { title: string; fields: { id: string; type: string; label: string; required?: boolean }[] }): string {
  const headers = ['Field ID', 'Type', 'Label', 'Required'];
  const rows = (schema.fields || []).map((f) => [
    f.id,
    f.type,
    `"${(f.label || '').replace(/"/g, '""')}"`,
    f.required ? 'Yes' : 'No',
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
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
