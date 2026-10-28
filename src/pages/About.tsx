import { BrainCircuit, ScanLine, Microscope, FileText, ShieldAlert, Cpu, Lock, FlaskConical } from 'lucide-react';
import Disclaimer from '@/components/Disclaimer';

const TECH: { icon: typeof Cpu; title: string; desc: string }[] = [
  { icon: Cpu, title: 'React + TypeScript + Vite', desc: 'A fast, type-safe frontend compiled into a single client-side app.' },
  { icon: ScanLine, title: 'Browser-side image preview', desc: 'Uploaded images are previewed locally with object URLs and never leave your device.' },
  { icon: FileText, title: 'Local TXT extraction', desc: 'Text is extracted locally in your browser. No file is uploaded anywhere. (PDF extraction is temporarily unavailable.)' },
  { icon: Lock, title: 'No persistent storage of files', desc: 'Only lightweight analysis metadata is kept in session storage — not the files themselves.' },
];

export default function About() {
  return (
    <div className="space-y-6">
      <div className="card p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
            <BrainCircuit className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink-900">About MedScan AI</h2>
            <p className="text-sm text-slate-500">A research prototype for medical imaging &amp; clinical reports</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          MedScan AI is an exploratory workspace for organizing medical imaging and clinical report
          research workflows. It provides structured upload, preview, and local text-extraction
          tools so researchers can move through an analysis pipeline without sending sensitive data
          to external services. The platform is intentionally transparent about model availability
          and never fabricates predictions.
        </p>
      </div>

      <div className="card p-6 lg:p-8">
        <h3 className="font-bold text-ink-900 mb-4 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-slate-400" /> Technology
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {TECH.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-800">{title}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 lg:p-8">
        <h3 className="font-bold text-ink-900 mb-4 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-500" /> Limitations
        </h3>
        <ul className="space-y-2.5 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
            No AI inference model is connected. The MRI and histopathology modules record upload
            attempts but cannot produce predictions, confidence scores, or diagnoses.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
            PDF text extraction works on selectable text. Scanned or image-based PDFs may return no
            extractable text.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
            History stores only metadata in your current browser session. No uploaded files or
            report contents are retained.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
            This is a research tool and is not a medical device. It must not be used for diagnosis,
            triage, or treatment decisions.
          </li>
        </ul>
      </div>

      <div className="card p-6 lg:p-8">
        <h3 className="font-bold text-ink-900 mb-4 flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-accent-500" /> Research purpose
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          MedScan AI is designed to support research teams studying AI-assisted medical imaging and
          clinical NLP. It offers a clean interface for preparing inputs, inspecting document
          contents, and tracking analysis attempts. To enable real inference, connect a compatible
          model endpoint and wire it into the analysis modules.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="badge bg-brand-50 text-brand-700"><ScanLine className="h-3 w-3" /> MRI pipeline</span>
          <span className="badge bg-cyan-50 text-accent-600"><Microscope className="h-3 w-3" /> Histopathology pipeline</span>
          <span className="badge bg-emerald-50 text-success-600"><FileText className="h-3 w-3" /> Report extraction</span>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}
