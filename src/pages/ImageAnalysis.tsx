
import { useState } from 'react';
import * as ort from 'onnxruntime-web';
import { env } from 'onnxruntime-web';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ScanLine,
} from 'lucide-react';
import FileUploader, { type UploadedFile } from '@/components/FileUploader';
import ModelNotConnected from '@/components/ModelNotConnected';
import Disclaimer from '@/components/Disclaimer';
import { addRecord } from '@/lib/history';
import type { Modality } from '@/lib/types';

const IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/bmp',
  'image/gif',
];

const MODEL_URL =
  'https://github.com/shanvi121007-del/MedScan-AI/releases/download/v1.0.0/brain_tumor_model.onnx';

const CLASSES = ['glioma', 'meningioma', 'no tumor', 'pituitary'];

let sessionPromise: Promise<ort.InferenceSession> | null = null;

function getSession() {
  if (!sessionPromise) {
    sessionPromise = ort.InferenceSession.create(MODEL_URL, {
      executionProviders: ['wasm'],
    }).catch((error) => {
      sessionPromise = null;
      throw error;
    });
  }
  return sessionPromise;
}

async function predictBrainImage(file: File) {
  const session = await getSession();

  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not prepare the image.');

    context.drawImage(bitmap, 0, 0, 128, 128);
    const pixels = context.getImageData(0, 0, 128, 128).data;
    const planeSize = 128 * 128;
    const input = new Float32Array(3 * planeSize);

    for (let i = 0; i < planeSize; i++) {
      input[i] = (pixels[i * 4] / 255 - 0.5) / 0.5;
      input[planeSize + i] = (pixels[i * 4 + 1] / 255 - 0.5) / 0.5;
      input[2 * planeSize + i] = (pixels[i * 4 + 2] / 255 - 0.5) / 0.5;
    }

    const inputName = session.inputNames[0];
    const outputName = session.outputNames[0];
    if (!inputName || !outputName) {
      throw new Error('The model input or output could not be identified.');
    }

    const tensor = new ort.Tensor('float32', input, [1, 3, 128, 128]);
    const outputs = await session.run({ [inputName]: tensor });
    const output = outputs[outputName];

    if (!output || !('data' in output)) {
      throw new Error('The model returned no readable prediction.');
    }

    const values = Array.from(output.data as ArrayLike<number>);
    if (values.length !== CLASSES.length || values.some((v) => !Number.isFinite(v))) {
      throw new Error(
        `Unexpected model output: received ${values.length} values; expected ${CLASSES.length}.`
      );
    }

    // Convert model scores to a normalized display score.
    const max = Math.max(...values);
    const exps = values.map((v) => Math.exp(v - max));
    const total = exps.reduce((sum, v) => sum + v, 0);
    const scores = exps.map((v) => v / total);
    const best = scores.indexOf(Math.max(...scores));

    return {
      label: CLASSES[best],
      score: scores[best],
    };
  } finally {
    bitmap.close();
  }
}

interface Props {
  modality: Extract<Modality, 'mri' | 'histopathology'>;
  title: string;
  description: string;
  acceptLabel: string;
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

  const maxSizeMb = 20;

  async function handleSelect(selected: File) {
    setError(null);
    setDone(false);
    setPrediction(null);

    if (!IMAGE_TYPES.includes(selected.type) && !selected.type.startsWith('image/')) {
      setError('Unsupported image format.');
      return;
    }
    if (selected.size > maxSizeMb * 1024 * 1024) {
      setError(`File is too large. Maximum allowed size is ${maxSizeMb} MB.`);
      return;
    }

    if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
    setFile({
      file: selected,
      previewUrl: URL.createObjectURL(selected),
    });
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
          note: 'No histopathology model is connected. No prediction produced.',
        });
        setDone(true);
        return;
      }

      const result = await predictBrainImage(file.file);
      setPrediction(result);

      await addRecord({
        modality,
        fileName: file.file.name,
        fileType: file.file.type,
        fileSize: file.file.size,
        status: 'analyzing',
        note: `Research-demo model output: ${result.label}; display score ${(result.score * 100).toFixed(1)}%. Not a clinical diagnosis.`,
      });

      setDone(true);
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : 'Analysis failed. Check model access and try again.';
      setError(msg);

      try {
        await addRecord({
          modality,
          fileName: file.file.name,
          fileType: file.file.type,
          fileSize: file.file.size,
          status: 'failed',
          note: `Analysis failed: ${msg}`,
        });
      } catch {
        // Preserve the original inference error if history recording also fails.
      }
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

        {modality === 'mri' ? (
          <p className="mt-4 text-sm text-slate-500">
            Research demonstration only. Results are not a medical diagnosis.
          </p>
        ) : (
          <div className="mt-5">
            <ModelNotConnected />
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={handleAnalyze} disabled={!file || busy} className="btn-primary">
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

        {prediction && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <h3 className="font-semibold text-slate-800">Preliminary model output</h3>
            <p className="mt-1 text-sm text-slate-700">
              Class: <strong>{prediction.label}</strong>
            </p>
            <p className="text-sm text-slate-700">
              Display score: {(prediction.score * 100).toFixed(1)}%
            </p>
            <p className="mt-2 text-xs text-slate-500">
              This score is not a clinically validated probability. Have scans assessed by a qualified clinician.
            </p>
          </div>
        )}

        {done && (
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-600">
              Attempt recorded in History.
            </p>
          </div>
        )}
      </div>

      <Disclaimer />
    </div>
  );
}