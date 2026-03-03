
import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  width?: number;
  height?: number;
  useWebWorker?: boolean;
}

export const compressImage = async (
  file: File,
  targetSizeKB: number,
  options: CompressionOptions = {}
): Promise<File> => {
  const targetBytes = targetSizeKB * 1024;
  const MARGIN = 0.05; // 5% margin
  const MAX_ITERATIONS = 8;
  
  let minQuality = 0.1;
  let maxQuality = 1.0;
  let bestFile = file;
  let iterations = 0;

  // First pass: Just try standard compression with a reasonable quality
  const initialOptions = {
    maxSizeMB: targetSizeKB / 1024,
    maxWidthOrHeight: options.width || options.height ? undefined : (options.maxWidthOrHeight || 1920),
    width: options.width,
    height: options.height,
    useWebWorker: true,
    initialQuality: 0.8,
    ...options,
  };

  try {
    await imageCompression(file, initialOptions);
    
    // Binary search for the best quality factor
    while (iterations < MAX_ITERATIONS) {
      const currentQuality = (minQuality + maxQuality) / 2;
      const iterOptions = {
        ...initialOptions,
        initialQuality: currentQuality,
      };

      const iteratedFile = await imageCompression(file, iterOptions);
      bestFile = iteratedFile;

      const currentSize = iteratedFile.size;
      
      // If we are within the target size and close to it (e.g. within 5% of the limit)
      if (currentSize <= targetBytes && currentSize >= targetBytes * (1 - MARGIN)) {
        return iteratedFile;
      }

      if (currentSize > targetBytes) {
        maxQuality = currentQuality;
      } else {
        minQuality = currentQuality;
        bestFile = iteratedFile; // Keep track of the best file under the limit
      }
      
      iterations++;
    }

    // If still too big after quality iterations, try reducing dimensions
    if (bestFile.size > targetBytes) {
      let scale = 0.8;
      while (scale > 0.3 && bestFile.size > targetBytes) {
        const scaleOptions = {
          ...initialOptions,
          maxWidthOrHeight: (options.maxWidthOrHeight || 1920) * scale,
          initialQuality: 0.5,
        };
        bestFile = await imageCompression(file, scaleOptions);
        scale -= 0.2;
      }
    }

    return bestFile;
  } catch (error) {
    console.error('Compression failed:', error);
    return file;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
