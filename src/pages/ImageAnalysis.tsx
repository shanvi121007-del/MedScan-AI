```tsx
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

// Configure ONNX Runtime to load WASM assets from the CDN.
// This avoids relying on Bolt's local WASM asset paths.
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

/**
 * Preprocess an image into an RGB, channels-first tensor.
 *
 * Assumptions to verify against the model:
 * - Input dimensions: [1, 3, 128, 128]
 * - RGB channels
 * - Pixel normalization: [-1, 1]
 */
async function preprocessImage(file: File): Promise<Float32Array> {
  const bitmap = await createImageBitmap(file);

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;

    const context = canvas.getContext('2d', {
      willReadFrequently: true,
    });

    if (!context) {
      throw new Error('Could not prepare the image for analysis.');
    }

    context.drawImage(bitmap, 0, 0, 128, 128);

    const pixels = context.getImageData(
      0,
      0,
      128,
      128,
    ).data;

    const planeSize = 128 * 128;
    const tensorData = new Float32Array(3 * plane*
```
