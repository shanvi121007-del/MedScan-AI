import { ScanLine, Microscope, FileText, ArrowRight, Activity, ShieldCheck, Layers } from 'lucide-react';
import { useRouter, type Route } from '@/lib/router';
import Disclaimer from '@/components/Disclaimer';

const FEATURES: {
  route: Route;
  icon: typeof ScanLine;
  title: string;
  desc: string;
}[] = [
  {
    route: 'mri',
    icon: ScanLine,
    title: 'MRI Analysis',
    desc: 'Upload MRI scans in standard image formats and preview them before running model-assisted review.',
  },
  {
    route: 'histopathology',
    icon: Microscope,
    title: 'Histopathology',
    desc: 'Submit tissue slide images and prepare them for AI-assisted tissue characterization research.',
  },
  {
    route: 'report',
    icon: FileText,
    title: 'Clinical Report Analysis',
    desc: 'Extract readable text locally from PDF or text reports. No file leaves your browser.',
  },
];

export default function Home() {
  const { navigate } = useRouter();

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl bg-ink-900 text-white px-6 py-12 lg:px-12 lg:py-16">
        <div className="absolute -top-20 -right-10 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative max-w-3xl">
          <span className="badge bg-white/10 text-brand-100 backdrop-blur">
            <Activity className="h-3 w-3" /> Research prototype
          </span>
          <h1 className="mt-4 text-3xl lg:text-5xl font-bold leading-tight tracking-tight">
            MedScan AI — medical imaging &amp; clinical report research platform
          </h1>
          <p className="mt-4 text-base lg:text-lg text-slate-300 leading-relaxed">
            An organized workspace for uploading, previewing, and extracting from medical images and
            clinical reports. Built for research exploration, not clinical use.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={() => navigate('dashboard')} className="btn-primary">
              Open dashboard <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('about')}
              className="btn bg-white/10 text-white hover:bg-white/15"
            >
              Learn more
            </button>
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-xs text-slate-300">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent-400" /> Files stay in your browser</span>
            <span className="inline-flex items-center gap-2"><Layers className="h-4 w-4 text-accent-400" /> Modular analysis pipelines</span>
            <span className="inline-flex items-center gap-2"><Activity className="h-4 w-4 text-accent-400" /> Transparent status reporting</span>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-ink-900">Analysis modules</h2>
            <p className="text-sm text-slate-500">Pick a workflow to get started.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ route, icon: Icon, title, desc }) => (
            <button
              key={route}
              onClick={() => navigate(route)}
              className="card p-5 text-left hover:shadow-pop hover:-translate-y-0.5 transition-all group"
            >
              <div className="h-11 w-11 rounded-xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                <Icon className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="mt-4 font-bold text-ink-900">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                Open module <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          ))}
        </div>
      </section>

      <Disclaimer />
    </div>
  );
}
