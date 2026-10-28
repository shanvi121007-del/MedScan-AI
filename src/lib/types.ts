export type Modality = 'mri' | 'histopathology' | 'report';

export type AnalysisStatus = 'pending' | 'analyzing' | 'no_model' | 'failed';

export interface AnalysisRecord {
  id: string;
  modality: Modality;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: AnalysisStatus;
  createdAt: number;
  note: string;
}

export const MODALITY_LABEL: Record<Modality, string> = {
  mri: 'MRI Analysis',
  histopathology: 'Histopathology',
  report: 'Clinical Report',
};
