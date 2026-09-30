import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('form_id');

    if (!formId) {
      return NextResponse.json({ error: 'Missing form_id' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Fetch the form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
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

    // Build header row
    const headers = ['#', 'Response ID', 'Submission Date', ...fields.map((f: { label: string }) => f.label)];

    // Build data rows
    const data = respData.map((r: { id: string; submitted_at: string; answers: Record<string, unknown> }, idx: number) => {
      return [
        idx + 1,
        r.id,
        new Date(r.submitted_at).toLocaleString('en-US'),
        ...fields.map((f: { id: string }) => {
          const val = r.answers?.[f.id];
          if (val === null || val === undefined) return '';
          if (Array.isArray(val)) return val.join(', ');
          return String(val);
        }),
      ];
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Auto-fit column widths
    ws['!cols'] = headers.map((h: string, colIdx: number) => {
      let maxLen = h.length;
      data.forEach((row: (string | number)[]) => {
        const cellLen = String(row[colIdx] ?? '').length;
        if (cellLen > maxLen) maxLen = cellLen;
      });
      return { wch: Math.min(maxLen + 4, 50) };
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Responses');

    // Summary sheet
    const summaryData = [
      ['Form Title', form.title],
      ['Total Responses', respData.length],
      ['Export Date', new Date().toLocaleString('en-US')],
      ['Status', form.status],
      [''],
      ['Field Summary'],
      ['Field Name', 'Field Type', 'Responses Answered'],
      ...fields.map((f: { id: string; label: string; type?: string }) => [
        f.label,
        f.type || 'unknown',
        respData.filter((r: { answers: Record<string, unknown> }) =>
          r.answers?.[f.id] !== null && r.answers?.[f.id] !== undefined && r.answers?.[f.id] !== ''
        ).length,
      ]),
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    const filename = `${(form.title || 'form').replace(/\s+/g, '_')}_responses.xlsx`;

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
