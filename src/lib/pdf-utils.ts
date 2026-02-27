import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using the local file in /public
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

/**
 * Converts an array of image files (JPEG/PNG) into a single PDF document.
 * Each image becomes one page, sized to match the image dimensions.
 */
export const imagesToPDF = async (images: File[]): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();

  for (const imageFile of images) {
    const imageBytes = await imageFile.arrayBuffer();
    let image;

    if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(imageBytes);
    } else if (imageFile.type === 'image/png') {
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      // Skip unsupported formats silently
      continue;
    }

    const { width, height } = image.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });
  }

  return await pdfDoc.save({ useObjectStreams: true });
};

/**
 * Merges multiple PDF files into a single PDF document.
 */
export const mergePDFs = async (
  pdfFiles: File[],
  onProgress?: (percent: number) => void
): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();
  
  for (let i = 0; i < pdfFiles.length; i++) {
    const file = pdfFiles[i];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
    
    if (onProgress) {
      onProgress(Math.round(((i + 1) / pdfFiles.length) * 100));
    }
  }

  return await mergedPdf.save({ useObjectStreams: true });
};

/**
 * Converts a PDF file into multiple image files (one per page).
 */
export const pdfToImages = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ blob: Blob; name: string }[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const result: { blob: Blob; name: string }[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // High resolution
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport } as any).promise;
    
    const blob = await new Promise<Blob>((resolve) => 
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9)
    );
    
    result.push({
      blob,
      name: `page-${i}.jpg`
    });

    if (onProgress) {
      onProgress(Math.round((i / numPages) * 100));
    }
    
    page.cleanup();
  }

  return result;
};
