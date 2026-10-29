import ImageAnalysis from './ImageAnalysis';

export default function MriAnalysis() {
  return (
    <ImageAnalysis
      modality="mri"
      title="MRI Analysis"
      description="Upload an MRI image to preview it and prepare it for model-assisted research analysis."
      acceptLabel="image/*"
    />
  );
}


