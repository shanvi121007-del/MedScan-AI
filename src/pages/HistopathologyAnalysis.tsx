import ImageAnalysis from './ImageAnalysis';

export default function HistopathologyAnalysis() {
  return (
    <ImageAnalysis
      modality="histopathology"
      title="Histopathology Analysis"
      description="Upload a tissue slide image to preview it and prepare for AI-assisted tissue characterization research. No prediction is produced until a compatible model is connected."
      acceptLabel="image/png,image/jpeg,image/webp,image/bmp,image/gif"
    />
  );
}
