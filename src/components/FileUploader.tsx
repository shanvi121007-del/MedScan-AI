import { UploadCloud, X, ImageIcon, FileText } from 'lucide-react';

export interface UploadedFile {
  file: File;
  previewUrl?: string;
}

interface FileUploaderProps {
  accept: string;
  maxSizeMb: number;
  file: UploadedFile | null;
  onSelect: (file: File) => void | Promise<void>;
  onClear: () => void;
  label: string;
  hint?: string;
  imageOnly?: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function FileUploader({
  accept,
  maxSizeMb,
  file,
  onSelect,
  onClear,
  label,
  hint,
  imageOnly = true,
}: FileUploaderProps) {
  const Icon = imageOnly ? ImageIcon : FileText;

  return (
    <div className="space-y-3">
      {!file && (
        <label className="group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:border-brand-400 hover:bg-brand-50/40 transition-colors cursor-pointer px-6 py-10 text-center">
          <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
            <UploadCloud className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-800">{label}</p>
            <p className="text-xs text-slate-500 mt-1">
              {hint ?? `Max ${maxSizeMb} MB · ${accept}`}
            </p>
          </div>
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) onSelect(selected);
              e.target.value = '';
            }}
          />
        </label>
      )}

      {file && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-start gap-3 p-3">
            {file.previewUrl ? (
              <img
                src={file.previewUrl}
                alt="Preview"
                className="h-24 w-24 rounded-xl object-cover bg-slate-100"
              />
            ) : (
              <div className="h-24 w-24 rounded-xl bg-brand-50 flex items-center justify-center">
                <Icon className="h-9 w-9 text-brand-600" />
              </div>
            )}
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-sm font-semibold text-ink-800 truncate">{file.file.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{formatSize(file.file.size)}</p>
              <p className="text-xs text-slate-400 mt-0.5">{file.file.type || 'unknown type'}</p>
            </div>
            <button
              onClick={onClear}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-danger-600"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
