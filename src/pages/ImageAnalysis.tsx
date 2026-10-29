import { useState } from 'react';
import * as ort from 'onnxruntime-web';
import { Loader2, AlertCircle, CheckCircle2, ScanLine } from 'lucide-react';
import FileUploader, { type UploadedFile } from '@/components/FileUploader';
import ModelNotConnected from '@/components/ModelNotConnected';
import Disclaimer from '@/components/Disclaimer';
import { addRecord } from '@/lib/history';
import type { Modality } from '@/lib/types';

ort.env.wasm.wasmPaths =
  'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31.1/dist/';

const MODEL_URL =
  'https://github.com/shanvi121007-del/MedScan-AI/releases/download/v1.0.0/brain_tumor_model.onnx';
  
const CLASSES = ['glioma', 'meningioma', 'no tumor', 'pituitary'] as const;
const MAX_SIZE_MB = 20;

interface Props {
  modality: Extract<Modality, 'mri' | 'histopathology'>;
  title: string;
  description: string;
  acceptLabel: string;
}

let sessionPromise: Promise<ort.InferenceSession> | null = null;

function getSession() {
  if (!sessionPromise) {
    sessionPromise = ort.InferenceSession.create(MODEL_URL, {
      executionProviders: ['wasm'],
    }).catch((error: unknown) => {
      sessionPromise = null;
      throw error;
    });
  }
  return sessionPromise;
}

async function predict(file: File) {
  const session = await getSession();
  const inputName = session.inputNames[0];
  const outputName = session.outputNames[0];

  if (!inputName || !outputName) {
    throw new Error('The model input or output could not be identified.');
  }

  const bitmap = await createImageBitmap(file);

  let data: Float32Array;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not prepare the image.');

    ctx.drawImage(bitmap, 0, 0, 128, 128);
    const pixels = ctx.getImageData(0, 0, 128, 128).data;
    const size = 128 * 128;
    data = new Float32Array(size * 3);

    for (let i = 0; i < size; i++) {
      data[i] = pixels[i * 4] / 127.5 - 1;
      data[size + i] = pixels[i * 4 + 1] / 127.5 - 1;
      data[size * 2 + i] = pixels[i * 4 + 2] / 127.5 - 1;
    }
  } finally {
    bitmap.close();
  }

  const tensor = new ort.Tensor('float32', data, [1, 3, 128, 128]);
  const outputs = await session.run({ [inputName]: tensor });
  const output = outputs[outputName];

  if (!output || !('data' in output)) {
    throw new Error('The model returned no readable output.');
  }

  const values = Array.from(output.data as ArrayLike<number>);

  if (
    values.length !== CLASSES.length ||
    values.some((value) => !Number.isFinite(value))
  ) {
    throw new Error(`Unexpected model output size: ${values.length}.`);
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  const probabilities =
    values.every((value) => value >= 0 && value <= 1) &&
    Math.abs(total - 1) < 0.01
      ? values
      : (() => {
          const max = Math.max(...values);
          const exp = values.map((value) => Math.exp(value - max));
          const denominator = exp.reduce((sum, value) => sum + value, 0);
          return exp.map((value) => value / denominator);
        })();

  const index = probabilities.indexOf(Math.max(...probabilities));

  return { label: CLASSES[index], score: probabilities[index] };
}

export default function ImageAnalysis({
  modality,
  title,
  description,
  acceptLabel,
}: Props) {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [prediction, setPrediction] = useState<{
    label: string;
    score: number;
  } | null>(null);

  function handleSelect(selected: File) {
    setError(null);
    setDone(false);
    setPrediction(null);

    if (!selected.type.startsWith('image/')) {
      setError('Please select a supported image.');
      return;
    }

    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Maximum file size is ${MAX_SIZE_MB} MB.`);
      return;
    }

    if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
    setFile({ file: selected, previewUrl: URL.createObjectURL(selected) });
  }

  function handleClear() {
    if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
    setFile(null);
    setError(null);
    setDone(false);
    setPrediction(null);
  }

  async function handleAnalyze() {
    if (!file || busy) return;

    setBusy(true);
    setError(null);
    setDone(false);
    setPrediction(null);

    try {
      if (modality !== 'mri') {
        await addRecord({
          modality,
          fileName: file.file.name,
          fileType: file.file.type,
          fileSize: file.file.size,
          status: 'no_model',
          note: 'No histopathology model is connected.',
        });
        setDone(true);
        return;
      }

      const result = await predict(file.file);

      await addRecord({
        modality,
        fileName: file.file.name,
        fileType: file.file.type,
        fileSize: file.file.size,
        status: 'analyzing',
        note: `Research-demo output: ${result.label}; display score ${(result.score * 100).toFixed(1)}%. Not a clinical diagnosis.`,
      });

      setPrediction(result);
      setDone(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Analysis failed.';
      setError(message);

      try {
        await addRecord({
          modality,
          fileName: file.file.name,
          fileType: file.file.type,
          fileSize: file.file.size,
          status: 'failed',
          note: `Analysis failed: ${message}`,
        });
      } catch (historyError) {
        console.error('Could not save failure record:', historyError);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-bold text-ink-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>

        <div className="mt-5">
          <FileUploader
            accept={acceptLabel}
            maxSizeMb={MAX_SIZE_MB}
            file={file}
            onSelect={handleSelect}
            onClear={handleClear}
            label="Click to select an image"
            hint={`Image file · max ${MAX_SIZE_MB} MB`}
            imageOnly
          />
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" />
            <p className="text-sm text-danger-600">{error}</p>
          </div>
        )}

        {modality === 'mri' ? (
          <p className="mt-4 text-sm text-slate-500">
            Research prototype only. Not intended for medical diagnosis.
          </p>
        ) : (
          <div className="mt-5"><ModelNotConnected /></div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={handleAnalyze} disabled={!file || busy} className="btn-primary">
            {busy ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
            ) : (
              <><ScanLine className="h-4 w-4" /> Analyze</>
            )}
          </button>
          {file && (
            <button onClick={handleClear} disabled={busy} className="btn-ghost">
              Remove file
            </button>
          )}
        </div>

        {prediction && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <h3 className="font-semibold">Preliminary model output</h3>
            <p className="mt-1 text-sm">Class: <strong>{prediction.label}</strong></p>
            <p className="text-sm">Display score: {(prediction.score * 100).toFixed(1)}%</p>
            <p className="mt-2 text-xs text-slate-500">
              This score is not clinically validated. Consult a qualified clinician.
            </p>
          </div>
        )}

        {done && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <p className="text-sm text-slate-600">Analysis attempt recorded in History.</p>
          </div>
        )}
      </div>
      <Disclaimer />
    </div>
  );
}
