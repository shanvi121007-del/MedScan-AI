import { PlugZap } from 'lucide-react';

export default function ModelNotConnected() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
      <PlugZap className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
      <div className="text-sm">
        <p className="font-semibold text-amber-800">AI model not connected</p>
        <p className="text-amber-700 mt-0.5">
          No inference model is configured. The Analyze button will record this attempt but will not
          produce a prediction. Connect a compatible model to enable real analysis.
        </p>
      </div>
    </div>
  );
}
