
import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

export const compressImage = async (
  file: File,
  targetSizeKB: number,
  options: CompressionOptions = {}
): Promise<File> => {
  // Initial target size in MB
  let currentMaxSizeMB = targetSizeKB / 1024;
  
  // Basic options
  const baseOptions = {
    maxSizeMB: currentMaxSizeMB,
    maxWidthOrHeight: options.maxWidthOrHeight || 1920,
    useWebWorker: options.useWebWorker !== undefined ? options.useWebWorker : true,
    ...options,
  };

  try {
    let compressedFile = await imageCompression(file, baseOptions);
    
    // If the compressed file is still larger than target, try a bit more (max 3 attempts)
    let attempts = 0;
    while (compressedFile.size / 1024 > targetSizeKB && attempts < 2) {
      currentMaxSizeMB *= 0.8; // Reduce target by 20% to hit the KB limit more accurately
      compressedFile = await imageCompression(file, {
        ...baseOptions,
        maxSizeMB: currentMaxSizeMB,
      });
      attempts++;
    }

    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw error;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
