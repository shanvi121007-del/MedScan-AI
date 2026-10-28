import ImageAnalysis from './ImageAnalysis';

export default function MriAnalysis() {
  return (
    <ImageAnalysis
      modality="mri"
      title="MRI Analysis"
      description="Upload an MRI image to preview it and prepare for model-assisted review. No prediction is produced until a compatible model is connected."
      acceptLabel="image/png,image/jpeg,image/webp,image/bmp,image/gif"
    />
  );
}
