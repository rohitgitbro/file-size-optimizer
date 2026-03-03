
'use client';

import React, { useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  Grid, Stack, IconButton, Alert, CircularProgress, 
  FormControl, InputLabel, Select, MenuItem, Slider, Divider
} from '@mui/material';
import { X, Download, RefreshCw, ArrowUp, ArrowDown, Settings, Layout, Scale } from 'lucide-react';
import { formatFileSize } from '@/lib/image-utils';
import { imagesToPDF, PDFOptions } from '@/lib/pdf-utils';
import { FileDropzone } from '../common/FileDropzone';
import { ToolLayout } from '../common/ToolLayout';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  // PDF Options
  const [options, setOptions] = useState<PDFOptions>({
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 20
  });

  const addImages = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(
      (f) => f.type === 'image/jpeg' || f.type === 'image/jpg' || f.type === 'image/png'
    );

    if (validFiles.length !== fileArray.length) {
      setError('Only JPEG and PNG images are supported.');
    } else {
      setError(null);
    }

    const newItems: ImageItem[] = validFiles.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setImages((prev) => [...prev, ...newItems]);
    setResult(null);
  }, []);

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
      const pdfBytes = await imagesToPDF(images.map((i) => i.file), options);
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult({ url, size: blob.size });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout 
      toolName="PDF Studio" 
      title="Images to PDF Studio"
      description="Create professional PDF documents from your images. Adjust page size, orientation, and margins with real-time browser processing."
    >
      <Grid container spacing={4}>
        {/* Sidebar: Settings */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Settings size={18} /> DOCUMENT SETTINGS
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Page Size</InputLabel>
                    <Select 
                      value={options.pageSize} 
                      label="Page Size" 
                      onChange={(e) => setOptions({...options, pageSize: e.target.value as 'A4' | 'LETTER' | 'ORIGINAL'})}
                    >
                      <MenuItem value="A4">A4 (Standard)</MenuItem>
                      <MenuItem value="LETTER">Letter (US)</MenuItem>
                      <MenuItem value="ORIGINAL">Original (Image size)</MenuItem>
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Layout size={14} /> ORIENTATION
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {['portrait', 'landscape'].map((o) => (
                        <Button
                          key={o}
                          fullWidth
                          size="small"
                          variant={options.orientation === o ? 'contained' : 'outlined'}
                          onClick={() => setOptions({...options, orientation: o as 'portrait' | 'landscape'})}
                          sx={{ textTransform: 'capitalize' }}
                        >
                          {o}
                        </Button>
                      ))}
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Scale size={14} /> MARGINS ({options.margin}px)
                    </Typography>
                    <Slider
                      value={options.margin}
                      min={0}
                      max={100}
                      onChange={(_, v) => setOptions({...options, margin: v as number})}
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={images.length === 0 || isProcessing}
                    onClick={handleConvert}
                    startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <RefreshCw size={20} />}
                  >
                    {isProcessing ? 'Creating PDF...' : 'Generate PDF Now'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {result && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Card sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={800} gutterBottom>SUCCESS!</Typography>
                    <Typography variant="h4" fontWeight={900}>{formatFileSize(result.size)}</Typography>
                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>PDF Document is Ready</Typography>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="primary" 
                      startIcon={<Download />}
                      href={result.url}
                      download="document.pdf"
                    >
                      Download PDF
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </Stack>
        </Grid>

        {/* Main Area: Image Queue */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            <FileDropzone 
              onFilesSelected={addImages}
              accept="image/*"
              multiple
              title="Add images for your PDF"
              subtitle="JPG or PNG images supported"
            />

            <AnimatePresence>
              {images.length > 0 && (
                <Box>
                  <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Page Ordering</Typography>
                  <Grid container spacing={2}>
                    {images.map((item, index) => (
                      <Grid size={{ xs: 6, sm: 4, lg: 3 }} key={item.id}>
                        <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <Card sx={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
                            <Box sx={{ height: 140, bgcolor: 'action.hover', position: 'relative' }}>
                              <img src={item.preview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="page" />
                              <Box sx={{ position: 'absolute', top: 4, left: 4, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', px: 1, borderRadius: 1, fontSize: '10px', fontWeight: 900 }}>
                                PAGE {index + 1}
                              </Box>
                              <IconButton 
                                size="small" 
                                sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#fff' } }}
                                onClick={() => removeImage(item.id)}
                              >
                                <X size={14} color="#d32f2f" />
                              </IconButton>
                            </Box>
                            <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ p: 1 }}>
                              <IconButton size="small" onClick={() => moveImage(index, 'up')} disabled={index === 0}>
                                <ArrowUp size={14} />
                              </IconButton>
                              <IconButton size="small" onClick={() => moveImage(index, 'down')} disabled={index === images.length - 1}>
                                <ArrowDown size={14} />
                              </IconButton>
                            </Stack>
                          </Card>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </AnimatePresence>
          </Stack>
        </Grid>
      </Grid>
      
      {error && <Alert severity="warning" sx={{ mt: 3 }}>{error}</Alert>}
    </ToolLayout>
  );
}
