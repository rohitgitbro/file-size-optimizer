
'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  Grid, Stack, IconButton, Alert, CircularProgress, Chip
} from '@mui/material';
import { ImageIcon, X, Download, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { formatFileSize } from '@/lib/image-utils';
import { imagesToPDF } from '@/lib/pdf-utils';

interface ImageItem {
  file: File;
  preview: string;
  id: string;
}

export function PDFOptimizer() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImages = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(
      (f) => f.type === 'image/jpeg' || f.type === 'image/jpg' || f.type === 'image/png'
    );

    if (validFiles.length !== fileArray.length) {
      setError('Some files were skipped. Only JPEG and PNG images are supported.');
    } else {
      setError(null);
    }

    const newItems: ImageItem[] = validFiles.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      id: `${f.name}-${Date.now()}-${Math.random()}`,
    }));

    setImages((prev) => [...prev, ...newItems]);
    setResult(null);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addImages(e.target.files);
    e.target.value = ''; // allow re-selecting same file
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addImages(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
    setResult(null);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newImages.length) return;
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
    setImages(newImages);
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const pdfBytes = await imagesToPDF(images.map((i) => i.file));
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult({ url, size: blob.size });
    } catch (err: any) {
      setError(err.message || 'Conversion failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = 'converted_images.pdf';
    a.click();
  };

  const clearAll = () => {
    images.forEach((i) => URL.revokeObjectURL(i.preview));
    setImages([]);
    setResult(null);
    setError(null);
  };

  const totalSize = images.reduce((sum, i) => sum + i.file.size, 0);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom align="center">
        Images to PDF Converter
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Upload JPG or PNG images and convert them into a single PDF document.
      </Typography>

      {/* Drop Zone */}
      <Card
        sx={{
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          mb: 3,
          bgcolor: isDragging ? 'primary.main' : 'transparent',
          opacity: isDragging ? 0.8 : 1,
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent sx={{ py: 5, textAlign: 'center' }}>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            multiple
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <ImageIcon size={48} color="rgba(128,128,128,0.4)" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {isDragging ? 'Drop images here' : 'Click or drag & drop images'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supports JPG and PNG · Multiple files supported
          </Typography>
        </CardContent>
      </Card>

      {/* Image List + Actions */}
      {images.length > 0 && (
        <Grid container spacing={3}>
          {/* Left: Image list */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight={800}>
                    Images ({images.length})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={formatFileSize(totalSize)}
                      size="small"
                      variant="outlined"
                    />
                    <Button size="small" color="error" onClick={clearAll}>
                      Clear All
                    </Button>
                  </Box>
                </Box>

                <Stack spacing={1.5} sx={{ maxHeight: 400, overflowY: 'auto', pr: 0.5 }}>
                  {images.map((item, index) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                      }}
                    >
                      {/* Thumbnail */}
                      <Box
                        component="img"
                        src={item.preview}
                        alt={item.file.name}
                        sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
                      />

                      {/* Info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {item.file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(item.file.size)}
                        </Typography>
                      </Box>

                      {/* Reorder Buttons */}
                      <Stack direction="column" spacing={0}>
                        <IconButton
                          size="small"
                          onClick={() => moveImage(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp size={14} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => moveImage(index, 'down')}
                          disabled={index === images.length - 1}
                        >
                          <ArrowDown size={14} />
                        </IconButton>
                      </Stack>

                      {/* Remove */}
                      <IconButton size="small" color="error" onClick={() => removeImage(item.id)}>
                        <X size={16} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>

                <Button
                  sx={{ mt: 3 }}
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <RefreshCw size={20} />}
                  onClick={handleConvert}
                  disabled={isProcessing || images.length === 0}
                >
                  {isProcessing ? 'Converting...' : `Convert ${images.length} Image${images.length > 1 ? 's' : ''} to PDF`}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Right: Result */}
          <Grid size={{ xs: 12, md: 5 }}>
            {result ? (
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'primary.dark', color: 'white' }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" gutterBottom>PDF Ready!</Typography>
                  <Typography variant="h4" fontWeight={800}>{formatFileSize(result.size)}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                    {images.length} page{images.length > 1 ? 's' : ''} combined
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="large"
                    startIcon={<Download />}
                    onClick={handleDownload}
                  >
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ height: '100%', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  Your converted PDF will appear here
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      )}

      {error && <Alert severity="warning" sx={{ mt: 3 }}>{error}</Alert>}
    </Box>
  );
}
