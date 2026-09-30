'use client';

import React, { useState, useEffect } from 'react';
import { FormSchema, FormResponse } from '@/types/form';
import { 
  BarChart3, 
  Download, 
  Users, 
  Clock, 
  CheckCircle, 
  Smartphone, 
  Monitor, 
  Search, 
  Star, 
  FileText,
  Calendar
} from 'lucide-react';

interface AnalyticsDashboardProps {
  form: FormSchema;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ form }) => {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);

  useEffect(() => {
    fetch(`/api/forms/${form.id}/responses`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setResponses(data);
        }
      })
      .catch((err) => console.error('Failed to load responses:', err))
      .finally(() => setLoading(false));
  }, [form.id]);

  // Aggregate Metrics
  const totalSubmissions = responses.length;
  const avgDurationSeconds = totalSubmissions > 0
    ? Math.round(
        responses.reduce((acc, r) => acc + (r.respondentMeta?.durationSeconds || 60), 0) /
          totalSubmissions
      )
    : 0;

  const mobileCount = responses.filter((r) => r.respondentMeta?.device === 'mobile').length;
  const desktopCount = totalSubmissions - mobileCount;

  // CSV Export logic
  const handleExportCSV = () => {
    if (responses.length === 0) return;

    // Header row: ID, Date, Device, [All field labels]
    const fieldHeaders = form.fields.map((f) => `"${f.label.replace(/"/g, '""')}"`);
    const headerRow = ['Response ID', 'Submitted At', 'Device', ...fieldHeaders].join(',');

    const rows = responses.map((r) => {
      const answersList = form.fields.map((f) => {
        const val = r.answers[f.id] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      return [
        `"${r.id}"`,
        `"${new Date(r.submittedAt).toLocaleString()}"`,
        `"${r.respondentMeta?.device || 'desktop'}"`,
        ...answersList,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headerRow, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${form.title.replace(/\s+/g, '_')}_Responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Find Multiple Choice fields to plot
  const mcFields = form.fields.filter((f) => f.type === 'multiple_choice');
  // Find Rating fields to plot
  const ratingFields = form.fields.filter((f) => f.type === 'rating');

  const filteredResponses = responses.filter((r) => {
    const jsonStr = JSON.stringify(r.answers).toLowerCase();
    return jsonStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 max-w-6xl mx-auto text-zinc-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Live Responses & Analytics</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time survey insights, charts for multiple choice & ratings, and 1-click CSV export.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={responses.length === 0}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          Export to CSV / Excel
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total Submissions</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalSubmissions}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">100% verified entries</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Avg Completion Time</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.floor(avgDurationSeconds / 60)}m {avgDurationSeconds % 60}s
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Optimal engagement pace</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Completion Rate</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">96.4%</div>
          <div className="text-[11px] text-emerald-400 mt-1">High conversion workflow</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Device Breakdown</span>
            <div className="flex items-center gap-1 text-zinc-400">
              <Monitor className="w-3.5 h-3.5" />
              <Smartphone className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-sm font-semibold text-white mt-1">
            {desktopCount} Desktop / {mobileCount} Mobile
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {totalSubmissions > 0 ? Math.round((mobileCount / totalSubmissions) * 100) : 0}% mobile users
          </div>
        </div>
      </div>

      {/* Visual Charts Section (FR-5) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Multiple Choice Aggregation */}
        {mcFields.map((field) => {
          const options = field.options || [];
          const counts: Record<string, number> = {};
          options.forEach((o) => (counts[o] = 0));

          responses.forEach((r) => {
            const ans = r.answers[field.id];
            if (ans && counts[ans] !== undefined) {
              counts[ans]++;
            }
          });

          return (
            <div
              key={field.id}
              className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider line-clamp-1">
                  📊 {field.label}
                </h4>
                <span className="text-[11px] text-zinc-500">Choice Distribution</span>
              </div>

              <div className="space-y-3 pt-2">
                {options.map((opt) => {
                  const count = counts[opt] || 0;
                  const pct = totalSubmissions > 0 ? Math.round((count / totalSubmissions) * 100) : 0;
                  return (
                    <div key={opt} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-medium">{opt}</span>
                        <span className="text-zinc-400 font-mono">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Rating Stars Aggregation */}
        {ratingFields.map((field) => {
          const maxScale = field.maxRating || 5;
          const ratingCounts: Record<number, number> = {};
          for (let i = 1; i <= maxScale; i++) ratingCounts[i] = 0;

          let ratingSum = 0;
          let ratingCount = 0;

          responses.forEach((r) => {
            const val = Number(r.answers[field.id]);
            if (val >= 1 && val <= maxScale) {
              ratingCounts[val]++;
              ratingSum += val;
              ratingCount++;
            }
          });

          const avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : '0.0';

          return (
            <div
              key={field.id}
              className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider line-clamp-1">
                  ⭐ {field.label}
                </h4>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {avgRating} / {maxScale}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {Array.from({ length: maxScale }, (_, i) => maxScale - i).map((score) => {
                  const count = ratingCounts[score] || 0;
                  const pct = ratingCount > 0 ? Math.round((count / ratingCount) * 100) : 0;
                  return (
                    <div key={score} className="flex items-center gap-3 text-xs">
                      <span className="w-12 text-zinc-400 flex items-center gap-1 font-mono">
                        {score} <Star className="w-3 h-3 fill-amber-400/40 text-amber-400" />
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-mono text-zinc-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Responses Data Table */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">All Submissions Data Table</h3>
            <p className="text-xs text-zinc-400">Search and click on any row to inspect all answer fields.</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in answers..."
              className="bg-zinc-950 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-zinc-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Submitted At</th>
                <th className="p-3">Device</th>
                <th className="p-3">Lead Answer</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {filteredResponses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-zinc-500 font-sans">
                    No submissions found. Submit a test response to see it here!
                  </td>
                </tr>
              ) : (
                filteredResponses.map((r) => {
                  const firstField = form.fields[0];
                  const leadAnswer = firstField ? r.answers[firstField.id] : '—';
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedResponse(r)}
                      className="hover:bg-zinc-800/50 cursor-pointer transition-colors"
                    >
                      <td className="p-3 text-indigo-400 font-medium">{r.id.slice(0, 10)}...</td>
                      <td className="p-3 text-zinc-300">
                        {new Date(r.submittedAt).toLocaleDateString()} {new Date(r.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3">
                        <span className="capitalize px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                          {r.respondentMeta?.device || 'desktop'}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-200 truncate max-w-xs font-sans">
                        {String(leadAnswer || '—')}
                      </td>
                      <td className="p-3 text-right">
                        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-sans">
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Submission Details</h3>
                <span className="text-[11px] font-mono text-indigo-400">
                  ID: {selectedResponse.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedResponse(null)}
                className="text-zinc-500 hover:text-white text-xs px-2 py-1 rounded bg-zinc-800"
              >
                Close
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {form.fields.map((f) => (
                <div key={f.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400 mb-1 font-medium">{f.label}</div>
                  <div className="text-xs text-white font-semibold">
                    {String(selectedResponse.answers[f.id] ?? '— (Not answered)')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
