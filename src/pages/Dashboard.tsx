import { Activity, ScanLine, Microscope, FileText, PlugZap, Clock, Loader2 } from 'lucide-react';
import { useAnalysisHistory } from '@/lib/history';
import { MODALITY_LABEL, type Modality } from '@/lib/types';
import Disclaimer from '@/components/Disclaimer';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function Dashboard() {
  const { records, loading } = useAnalysisHistory();

  const counts: Record<Modality, number> = {
    mri: 0,
    histopathology: 0,
    report: 0,
  };
  for (const r of records) counts[r.modality]++;

  const statCards: { modality: Modality; icon: typeof ScanLine; accent: string }[] = [
    { modality: 'mri', icon: ScanLine, accent: 'text-brand-600 bg-brand-50' },
    { modality: 'histopathology', icon: Microscope, accent: 'text-accent-600 bg-cyan-50' },
    { modality: 'report', icon: FileText, accent: 'text-success-600 bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map(({ modality, icon: Icon, accent }) => (
          <div key={modality} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{MODALITY_LABEL[modality]}</p>
                <p className="mt-2 text-3xl font-bold text-ink-900">{counts[modality]}</p>
                <p className="mt-1 text-xs text-slate-400">analyses recorded</p>
              </div>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${accent}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-slate-400" />
            <h2 className="font-bold text-ink-900">Recent activity</h2>
          </div>
          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 text-brand-500 mx-auto animate-spin" />
              <p className="mt-3 text-sm text-slate-500">Loading recent activity…</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-10">
              <Activity className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="mt-3 text-sm text-slate-500">No analyses yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Run a workflow from the sidebar to record your first analysis.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {records.slice(0, 8).map((r) => (
                <li key={r.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-800 truncate">{r.fileName}</p>
                    <p className="text-xs text-slate-400">
                      {MODALITY_LABEL[r.modality]} · {timeAgo(r.createdAt)}
                    </p>
                  </div>
                  <span className="badge bg-slate-100 text-slate-600 shrink-0">
                    {r.status === 'no_model' ? 'No model' : r.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <PlugZap className="h-4 w-4 text-slate-400" />
            <h2 className="font-bold text-ink-900">Model connection</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
              <span className="text-sm text-slate-600">MRI model</span>
              <span className="badge bg-amber-100 text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Not connected
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
              <span className="text-sm text-slate-600">Histopathology model</span>
              <span className="badge bg-amber-100 text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Not connected
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
              <span className="text-sm text-slate-600">Report extractor</span>
              <span className="badge bg-emerald-100 text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-success-500" /> Local · ready
              </span>
            </div>
          </div>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}
