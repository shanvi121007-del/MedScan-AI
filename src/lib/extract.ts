/**
 * Local text extraction utilities. Nothing is uploaded to a server.
 *
 * PDF text extraction relies on a browser-side parsing library that is not
 * available in this environment, so PDFs report an honest "unavailable"
 * message. TXT extraction runs natively and works fully.
 */

export interface ExtractResult {
  text: string;
  pageCount: number;
  charCount: number;
}

const ACCEPTED_TEXT_EXT = ['.txt', '.md', '.csv', '.log'];

export class PdfUnavailableError extends Error {
  constructor() {
    super(
      'PDF text extraction is temporarily unavailable. Please upload a TXT file instead.',
    );
    this.name = 'PdfUnavailableError';
  }
}

export function isPdf(file: File): boolean {
  return (
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf')
  );
}

export function isTextLike(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type.startsWith('text/') ||
    ACCEPTED_TEXT_EXT.some((ext) => name.endsWith(ext))
  );
}

export async function extractTxt(file: File): Promise<ExtractResult> {
  const text = await file.text();
  return { text, pageCount: 1, charCount: text.length };
}

export function extractPdf(): Promise<ExtractResult> {
  return Promise.reject(new PdfUnavailableError());
}

export async function extractDocument(file: File): Promise<ExtractResult> {
  if (isTextLike(file)) return extractTxt(file);
  if (isPdf(file)) return extractPdf();
  throw new Error('Unsupported file type. Please upload a PDF or text file.');
}
