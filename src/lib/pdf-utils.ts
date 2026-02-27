
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
