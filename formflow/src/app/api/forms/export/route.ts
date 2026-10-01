import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';
import {
  checkRateLimit,
  getClientIp,
  logSecurityEvent,
  sanitizeFilename,
  sanitizeSpreadsheetCell,
} from '@/lib/security';

export async function GET(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`export:${clientIp}`, 10, 60);
    if (!rateLimit.allowed) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { endpoint: '/api/forms/export' }, clientIp);
      return NextResponse.json(
        { error: 'Too many export requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.resetSeconds) } }
      );
    }

    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('form_id');

    if (!formId) {
      return NextResponse.json({ error: 'Missing form_id' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Authenticate user (A01 - Broken Access Control)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Verify ownership (A01 - IDOR Prevention)
    if (form.owner_id && form.owner_id !== user.id) {
      logSecurityEvent(
        'UNAUTHORIZED_ACCESS_ATTEMPT',
        { formId, userId: user.id, action: 'export' },
        clientIp
      );
      return NextResponse.json({ error: 'Forbidden: You do not own this form' }, { status: 403 });
    }

    // Fetch all responses
    const { data: responses, error: respError } = await supabase
      .from('responses')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: true });

    if (respError) {
      return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
    }

    const fields = form.schema?.fields || [];
    const respData = responses || [];

    // Build header row with sanitized labels (A03 - Formula Injection)
    const headers = [
      '#',
      'Response ID',
      'Submission Date',
      ...fields.map((f: { label: string }) => sanitizeSpreadsheetCell(f.label)),
    ];

    // Build data rows with formula sanitization (A03 - Formula Injection / CSV Injection)
    const data = respData.map(
      (r: { id: string; submitted_at: string; answers: Record<string, unknown> }, idx: number) => {
        return [
          idx + 1,
          sanitizeSpreadsheetCell(r.id),
          new Date(r.submitted_at).toLocaleString('en-US'),
          ...fields.map((f: { id: string }) => {
            const val = r.answers?.[f.id];
            return sanitizeSpreadsheetCell(val);
          }),
        ];
      }
    );

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Auto-fit column widths
    ws['!cols'] = headers.map((h: string, colIdx: number) => {
      let maxLen = String(h ?? '').length;
      data.forEach((row: (string | number)[]) => {
        const cellLen = String(row[colIdx] ?? '').length;
        if (cellLen > maxLen) maxLen = cellLen;
      });
      return { wch: Math.min(maxLen + 4, 50) };
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Responses');

    // Summary sheet with sanitized cells
    const summaryData = [
      ['Form Title', sanitizeSpreadsheetCell(form.title)],
      ['Total Responses', respData.length],
      ['Export Date', new Date().toLocaleString('en-US')],
      ['Status', sanitizeSpreadsheetCell(form.status)],
      [''],
      ['Field Summary'],
      ['Field Name', 'Field Type', 'Responses Answered'],
      ...fields.map((f: { id: string; label: string; type?: string }) => [
        sanitizeSpreadsheetCell(f.label),
        sanitizeSpreadsheetCell(f.type || 'unknown'),
        respData.filter(
          (r: { answers: Record<string, unknown> }) =>
            r.answers?.[f.id] !== null &&
            r.answers?.[f.id] !== undefined &&
            r.answers?.[f.id] !== ''
        ).length,
      ]),
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Safe filename to prevent header injection (A03/A05)
    const safeTitle = sanitizeFilename(form.title || 'form');
    const filename = `${safeTitle}_responses.xlsx`;

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

