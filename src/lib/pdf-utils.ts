import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using the local file in /public
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

import { PageSizes } from 'pdf-lib';

export interface PDFOptions {
  pageSize?: 'A4' | 'LETTER' | 'ORIGINAL';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
}

/**
 * Converts an array of image files (JPEG/PNG) into a single PDF document.
 */
export const imagesToPDF = async (
  images: File[], 
  options: PDFOptions = {}
): Promise<Uint8Array> => {
  const { pageSize = 'A4', orientation = 'portrait', margin = 0 } = options;
  const pdfDoc = await PDFDocument.create();

  for (const imageFile of images) {
    const imageBytes = await imageFile.arrayBuffer();
    let image;

    try {
      if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
        image = await pdfDoc.embedJpg(imageBytes);
      } else if (imageFile.type === 'image/png') {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        continue;
      }
    } catch (e) {
      console.error('Failed to embed image:', imageFile.name, e);
      continue;
    }

    let pWidth, pHeight;
    if (pageSize === 'ORIGINAL') {
      const dim = image.scale(1);
      pWidth = dim.width;
      pHeight = dim.height;
    } else {
      const standardSize = pageSize === 'A4' ? PageSizes.A4 : PageSizes.Letter;
      pWidth = orientation === 'portrait' ? standardSize[0] : standardSize[1];
      pHeight = orientation === 'portrait' ? standardSize[1] : standardSize[0];
    }

    const page = pdfDoc.addPage([pWidth, pHeight]);
    
    // Calculate best fit within margins
    const availableWidth = pWidth - (margin * 2);
    const availableHeight = pHeight - (margin * 2);
    
    const scale = Math.min(
      availableWidth / image.width,
      availableHeight / image.height
    );

    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    
    // Center the image
    const x = (pWidth - drawWidth) / 2;
    const y = (pHeight - drawHeight) / 2;

    page.drawImage(image, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
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
  options: {
    format?: 'image/jpeg' | 'image/png' | 'image/webp',
    scale?: number,
    quality?: number,
    onProgress?: (percent: number) => void
  } = {}
): Promise<{ blob: Blob; name: string }[]> => {
  const { format = 'image/jpeg', scale = 2.0, quality = 0.9, onProgress } = options;
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const result: { blob: Blob; name: string }[] = [];

  const extMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;
    
    const blob = await new Promise<Blob>((resolve) => 
      canvas.toBlob((b) => resolve(b!), format, quality)
    );
    
    result.push({
      blob,
      name: `page-${i}.${extMap[format]}`
    });

    if (onProgress) {
      onProgress(Math.round((i / numPages) * 100));
    }
    
    page.cleanup();
  }

  return result;
};

