import { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle2, ScanLine } from 'lucide-react';
import FileUploader, { type UploadedFile } from '@/components/FileUploader';
import ModelNotConnected from '@/components/ModelNotConnected';
import Disclaimer from '@/components/Disclaimer';
import { addRecord } from '@/lib/history';
import type { Modality } from '@/lib/types';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp', 'image/gif'];

interface Props {
  modality: Extract<Modality, 'mri' | 'histopathology'>;
  title: string;
  description: string;
  acceptLabel: string;
}

export default function ImageAnalysis({ modality, title, description, acceptLabel }: Props) {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const maxSizeMb = 20;

  async function handleSelect(selected: File) {
    setError(null);
    setDone(false);

    if (!IMAGE_TYPES.includes(selected.type) && !selected.type.startsWith('image/')) {
      setError('Unsupported format. Please upload a PNG, JPEG, WebP, BMP, or GIF image.');
      return;
    }
    if (selected.size > maxSizeMb * 1024 * 1024) {
      setError(`File is too large. Maximum allowed size is ${maxSizeMb} MB.`);
      return;
    }
    const url = URL.createObjectURL(selected);
    setFile({ file: selected, previewUrl: url });
  }

  function handleClear() {
    if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
    setFile(null);
    setError(null);
    setDone(false);
  }

  async function handleAnalyze() {
    if (!file) return;
    setBusy(true);
    setError(null);
    // No model connected — simulate a short processing window then record honestly.
    await new Promise((r) => setTimeout(r, 900));
    try {
      await addRecord({
        modality,
        fileName: file.file.name,
        fileType: file.file.type,
        fileSize: file.file.size,
        status: 'no_model',
        note: 'No AI model connected. No prediction produced.',
      });
      setDone(true);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Could not record this analysis. Try again.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-ink-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>

        <FileUploader
          accept={acceptLabel}
          maxSizeMb={maxSizeMb}
          file={file}
          onSelect={handleSelect}
          onClear={handleClear}
          label="Click to select an image"
          hint={`PNG, JPEG, WebP, BMP, GIF · max ${maxSizeMb} MB`}
          imageOnly
        />

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-danger-500/10 border border-danger-500/30 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-danger-600 mt-0.5 shrink-0" />
            <p className="text-sm text-danger-600">{error}</p>
          </div>
        )}

        <div className="mt-5">
          <ModelNotConnected />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={!file || busy}
            className="btn-primary"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing…
              </>
            ) : (
              <>
                <ScanLine className="h-4 w-4" /> Analyze
              </>
            )}
          </button>
          {file && (
            <button onClick={handleClear} className="btn-ghost">
              Remove file
            </button>
          )}
        </div>

        {done && (
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-600">
              Attempt recorded. No AI model is connected, so no prediction, confidence score, or
              diagnosis was generated. This record appears in your History.
            </p>
          </div>
        )}
      </div>

      <Disclaimer />
    </div>
  );
}
