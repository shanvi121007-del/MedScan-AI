import { useState } from 'react';
import * as ort from 'onnxruntime-web';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ScanLine,
} from 'lucide-react';

import FileUploader, {
  type UploadedFile,
} from '@/components/FileUploader';
import ModelNotConnected from '@/components/ModelNotConnected';
import Disclaimer from '@/components/Disclaimer';
import { addRecord } from '@/lib/history';
import type { Modality } from '@/lib/types';

ort.env.wasm.wasmPaths =
  'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31.1/dist/';

const IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/bmp',
  'image/gif',
];

const MAX_SIZE_MB = 20;

const MODEL_URL =
  'https://github.com/shanvi121007-del/MedScan-AI/releases/download/v1.0.0/brain_tumor_model.onnx';

const CLASS_NAMES = [
  'glioma',
  'meningioma',
  'no tumor',
  'pituitary',
] as const;

interface Props {
  modality: Extract<Modality, 'mri' | 'histopathology'>;
  title: string;
  description: string;
  acceptLabel: string;
}

interface Prediction {
  label: string;
  score: number;
}

let sessionPromise: Promise<ort.InferenceSession> | null = null;

function getModelSession(): Promise<ort.InferenceSession> {
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

async function predictMRI(file: File): Promise<Prediction> {
  const session = await getModelSession();

  if (!session.inputNames[0] || !session.outputNames[0]) {
    throw new Error('The model input or output could not be identified.');
  }

  const bitmap = await createImageBitmap(file);

  let tensorData: Float32Array;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;

    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Could not prepare the MRI image.');
    }

    context.drawImage(bitmap, 0, 0, 128, 128);

    const pixels = context.getImageData(0, 0, 128, 128).data;
    const planeSize = 128 * 128;

    tensorData = new Float32Array(3 * planeSize);

    for (let i = 0; i < planeSize; i++) {
      const pixel = i * 4;

      tensorData[i] = pixels[pixel] / 127.5 - 1;
      tensorData[planeSize + i] = pixels[pixel + 1] / 127.5 - 1;
      tensorData[2 * planeSize + i] = pixels[pixel + 2] / 127.5 - 1;
    }
  } finally {
    bitmap.close();
  }

  const inputName = session.inputNames[0];
  const outputName = session.outputNames[0];

  const tensor = new ort.Tensor(
    'float32',
    tensorData,
    [1, 3, 128, 128],
  );

  const outputs = await session.run({
    [inputName]: tensor,
  });

  const output = outputs[outputName];

  if (!output || !('data' in output)) {
    throw new Error('The model returned no readable output.');
  }

  const values = Array.from(output.data as ArrayLike<number>);

  if (
    values.length !== CLASS_NAMES.length ||
    values.some((value) => !Number.isFinite(value))
  ) {
    throw new Error(
      `Unexpected model output: received ${values.length} values; expected ${CLASS_NAMES.length}.`,
    );
  }

  const sum = values.reduce((total, value) => total + value, 0);

  const isProbabilityVector =
    values.every((value) => value >= 0 && value <= 1) &&
    Math.abs(sum - 1) < 0.01;

  let scores: number[];

  if (isProbabilityVector) {
    scores = values;
  } else {
    const max = Math.max(...values);
    const exponentials = values.map((value) => Math.exp(value - max));
    const denominator = exponentials.reduce(
      (total, value) => total + value,
      0,
    );

    if (!Number.isFinite(denominator) || denominator === 0) {
      throw new Error('The model returned invalid scores.');
    }

    scores = exponentials.map((value) => value / denominator);
  }

  const bestIndex = scores.indexOf(Math.max(...scores));

  return {
    label: CLASS_NAMES[bestIndex],
    score: scores[bestIndex],
  };
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
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  async function handleSelect(selected: File) {
    setError(null);
    setDone(false);
    setPrediction(null);

    if (
      !IMAGE_TYPES.includes(selected.type) &&
      !selected.type.startsWith('image/')
    ) {
      setError('Unsupported format. Please upload a supported image.');
      return;
    }

    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum allowed size is ${MAX_SIZE_MB} MB.`);
      return;
    }

    if (file?.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }

    setFile({
      file: selected,
      previewUrl: URL.createObjectURL(selected),
    });
  }

  function handleClear() {
    if (file?.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }

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
          note: 'No compatible histopathology model is connected.',
        });

        setDone(true);
        return;
      }

      const result = await predictMRI(file.file);

      await addRecord({
        modality,
        fileName: file.file.name,
        fileType: file.file.type,
        fileSize: file.file.size,
        status: 'analyzing',
        note:
          `Research-demo output: ${result.label}; display score ` +
          `${(result.
