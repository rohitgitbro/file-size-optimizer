
import { PDFDocument } from 'pdf-lib';

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
