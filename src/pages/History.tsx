import { useState } from 'react';
import { History as HistoryIcon, Trash2, Inbox, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAnalysisHistory, clearHistory } from '@/lib/history';
import { MODALITY_LABEL, type Modality } from '@/lib/types';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const MODALITY_BADGE: Record<Modality, string> = {
  mri: 'bg-brand-50 text-brand-700',
  histopathology: 'bg-cyan-50 text-accent-600',
  report: 'bg-emerald-50 text-success-600',
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function History() {
  const { records, loading, error, refresh } = useAnalysisHistory();
  const [clearing, setClearing] = useState(false);

  async function handleClear() {
    setClearing(true);
    try {
      await clearHistory();
      refresh();
    } catch (e) {
      /* RLS or network error — leave current state; next fetch will reconcile */
      void e;
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-bold text-ink-900">Analysis history</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="btn-ghost !py-1.5 !px-3 text-xs"
              aria-label="Refresh"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {records.length > 0 && (
              <button
                onClick={handleClear}
                disabled={clearing}
                className="btn-ghost !py-1.5 !px-3 text-xs text-danger-600 hover:bg-danger-500/10"
              >
                {clearing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Clearing…
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" /> Clear all
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Metadata only. No uploaded files or report contents are stored.
        </p>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <Loader2 className="h-8 w-8 text-brand-500 mx-auto animate-spin" />
          <p className="mt-3 text-sm text-slate-500">Loading your analysis history…</p>
        </div>
      ) : error ? (
        <div className="card p-8 text-center">
          <div className="flex items-start gap-2 justify-center text-danger-600">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={refresh} className="btn-ghost mt-4 !py-1.5 !px-4 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      ) : records.length === 0 ? (
        <div className="card p-12 text-center">
          <Inbox className="h-10 w-10 text-slate-300 mx-auto" />
          <p className="mt-3 text-sm font-medium text-slate-600">No analyses recorded yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Run a workflow from the sidebar to record your first analysis.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold">Modality</th>
                  <th className="px-5 py-3 font-semibold">File</th>
                  <th className="px-5 py-3 font-semibold">Size</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <span className={`badge ${MODALITY_BADGE[r.modality]}`}>
                        {MODALITY_LABEL[r.modality]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-800 font-medium max-w-[220px] truncate">
                      {r.fileName}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatBytes(r.fileSize)}</td>
                    <td className="px-5 py-3">
                      <span className="badge bg-amber-100 text-amber-700">
                        {r.status === 'no_model' ? 'No model' : r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                    <td className="px-5 py-3 text-slate-500 max-w-[280px] truncate">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
