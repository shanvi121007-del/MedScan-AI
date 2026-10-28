import { ShieldAlert } from 'lucide-react';

export default function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-[11px] text-amber-600 font-medium">
        Research prototype only. Not intended for medical diagnosis or treatment decisions.
      </p>
    );
  }
  return (
    <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
      <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
      <p className="text-xs leading-relaxed text-amber-700">
        <span className="font-semibold">Research prototype only.</span> Not intended for medical
        diagnosis or treatment decisions. Do not upload identifiable patient data.
      </p>
    </div>
  );
}
