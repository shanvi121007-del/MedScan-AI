import { useState } from 'react';
import { Loader2, AlertCircle, FileText, CheckCircle2, Copy, RotateCcw, FileWarning } from 'lucide-react';
import FileUploader, { type UploadedFile } from '@/components/FileUploader';
import Disclaimer from '@/components/Disclaimer';
import { extractDocument, isPdf, type ExtractResult } from '@/lib/extract';
import { addRecord } from '@/lib/history';

const maxSizeMb = 15;
const PDF_UNAVAILABLE_MSG =
  'PDF text extraction is temporarily unavailable. Please upload a TXT file instead.';

export default function ClinicalReport() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isPdfFile = file ? isPdf(file.file) : false;

  async function handleSelect(selected: File) {
    setError(null);
    setResult(null);
    const pdf = isPdf(selected);
    const text =
      selected.type.startsWith('text/') ||
      /\.(txt|md|csv|log)$/i.test(selected.name);
    if (!pdf && !text) {
      setError('Unsupported file type. Please upload a PDF or text (.txt) file.');
      return;
    }
    if (selected.size > maxSizeMb * 1024 * 1024) {
      setError(`File is too large. Maximum allowed size is ${maxSizeMb} MB.`);
      return;
    }
    setFile({ file: selected });
    if (pdf) {
      setError(PDF_UNAVAILABLE_MSG);
    }
  }

  function handleClear() {
    setFile(null);
    setError(null);
    setResult(null);
    setSaveError(null);
  }

  async function handleExtract() {
    if (!file || isPdfFile) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setSaveError(null);
    try {
      const res = await extractDocument(file.file);
      setResult(res);
      // Separate try/catch so an insert failure is never misreported as an
      // extraction failure (or vice versa). The save must be awaited and its
      // error surfaced distinctly.
      try {
        await addRecord({
          modality: 'report',
          fileName: file.file.name,
          fileType: file.file.type,
          fileSize: file.file.size,
          status: 'no_model',
          note: `Extracted ${res.charCount} chars from ${res.pageCount} page(s).`,
        });
      } catch (saveErr) {
        // Extraction succeeded, but the history record was not saved.
        setSaveError(
          'Text was extracted, but the analysis could not be saved to your history. ' +
            (saveErr instanceof Error ? saveErr.message : 'Please try again or sign in.'),
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to extract text from this file.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-ink-900">Clinical Report Analysis</h2>
          <p className="text-sm text-slate-500 mt-1">
            Upload a PDF or text file. Text is extracted locally in your browser — nothing is
            uploaded to a server.
          </p>
        </div>

        <FileUploader
          accept=".pdf,.txt,.md,.csv,.log,application/pdf,text/plain"
          maxSizeMb={maxSizeMb}
          file={file}
          onSelect={handleSelect}
          onClear={handleClear}
          label="Click to select a PDF or text file"
          hint={`PDF, TXT, MD, CSV, LOG · max ${maxSizeMb} MB`}
          imageOnly={false}
        />

        {error && (
          <div
            className={`mt-4 flex items-start gap-2 rounded-xl px-4 py-3 ${
              isPdfFile
                ? 'bg-amber-50 border border-amber-300'
                : 'bg-danger-500/10 border border-danger-500/30'
            }`}
          >
            {isPdfFile ? (
              <FileWarning className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-danger-600" />
            )}
            <p
              className={`text-sm ${isPdfFile ? 'text-amber-700' : 'text-danger-600'}`}
            >
              {error}
            </p>
          </div>
        )}

        {saveError && !error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-300 px-4 py-3">
            <FileWarning className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-700">{saveError}</p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={handleExtract}
            disabled={!file || busy || isPdfFile}
            className="btn-primary"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Extracting…
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" /> Extract text
              </>
            )}
          </button>
          {file && (
            <button onClick={handleClear} className="btn-ghost">
              Remove file
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success-600" />
              <h3 className="font-bold text-ink-900">Extracted text</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigator.clipboard?.writeText(result.text)}
                className="btn-ghost !py-1.5 !px-3 text-xs"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
              <button onClick={handleClear} className="btn-ghost !py-1.5 !px-3 text-xs">
                <RotateCcw className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="badge bg-slate-100 text-slate-600">{result.pageCount} page(s)</span>
            <span className="badge bg-slate-100 text-slate-600">{result.charCount.toLocaleString()} characters</span>
          </div>
          {result.charCount === 0 ? (
            <p className="text-sm text-slate-500">
              No selectable text found. This file may not contain extractable text.
            </p>
          ) : (
            <pre className="whitespace-pre-wrap break-words text-sm text-slate-700 bg-slate-50 rounded-xl border border-slate-200 p-4 max-h-96 overflow-y-auto font-sans leading-relaxed">
              {result.text}
            </pre>
          )}
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
