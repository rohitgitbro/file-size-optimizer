
import { PDFDocument, rgb } from 'pdf-lib';

export const compressPDF = async (
  file: File,
  targetSizeKB: number
): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  // NOTE: True PDF compression in the browser without server-side tools 
  // like Ghostscript is limited. We mostly rely on object squeezing and 
  // dropping metadata here. For heavy compression, we'd typically downscale images inside.
  
  // Strip metadata and minimize
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('');
  pdfDoc.setCreator('');

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  
  // If it's still too big, we'd need a more advanced strategy like re-rendering pages
  // to canvas and then back to PDF with lower quality images.
  
  return pdfBytes;
};

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
      continue;
    }

    const { width, height } = image.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  return await pdfDoc.save();
};
