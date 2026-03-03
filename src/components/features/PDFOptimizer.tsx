
'use client';

import React, { useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  Grid, Stack, IconButton, Alert, CircularProgress, 
  FormControl, InputLabel, Select, MenuItem, Slider, Divider,
  Chip, Tooltip, Pagination
} from "@mui/material";
import { X, Download, RefreshCw, Settings, Layout, Scale, GripVertical, Trash2 } from 'lucide-react';
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  const handleDragEnd = (draggedItem: ImageItem, targetIndex: number) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const oldIndex = images.findIndex(p => p.id === draggedItem.id);
    const newIndex = startIndex + targetIndex;
    
    if (oldIndex === newIndex) return;
    
    setPagesArray(prev => {
      const next = [...prev];
      const [removed] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, removed);
      return next;
    });
  };

  const setPagesArray = (updater: (prev: ImageItem[]) => ImageItem[]) => {
    setImages(prev => updater(prev));
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

            <AnimatePresence mode="popLayout">
              {images.length > 0 && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight={900}>Document Assembly</Typography>
                    <Chip 
                      label={`${images.length} Pages`} 
                      color="secondary" 
                      size="small" 
                      sx={{ fontWeight: 900, borderRadius: 2 }} 
                    />
                  </Stack>

                  <Box
                    sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                      gap: '20px',
                      padding: '12px 6px 32px 6px'
                    }}
                  >
                    {images.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, idx) => {
                      const absoluteIdx = (currentPage - 1) * itemsPerPage + idx;
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          whileHover={{ y: -5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        >
                          <Card
                            sx={{
                              height: "100%",
                              borderRadius: '12px',
                              overflow: "hidden",
                              border: "1px solid",
                              borderColor: "divider",
                              position: "relative",
                              bgcolor: 'background.paper',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                              transition: 'all 0.2s ease',
                              "&:hover": { 
                                borderColor: 'primary.main',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                "& .page-actions": { opacity: 1 } 
                              },
                            }}
                          >
                            <Box
                              sx={{
                                position: "relative",
                                height: 220,
                                bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 1.5
                              }}
                            >
                              <img
                                src={item.preview}
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  objectFit: "contain",
                                  pointerEvents: "none",
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                  backgroundColor: '#fff',
                                  padding: '2px'
                                }}
                                alt={`page ${absoluteIdx + 1}`}
                              />

                              {/* Page Label */}
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  left: 8,
                                  bgcolor: "secondary.main",
                                  color: "white",
                                  px: 1,
                                  minWidth: 20,
                                  height: 20,
                                  borderRadius: '6px',
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: '11px',
                                  fontWeight: 900,
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                  zIndex: 3
                                }}
                              >
                                {absoluteIdx + 1}
                              </Box>

                              {/* Drag Handle & Selection Overlay */}
                              <Box 
                                sx={{ 
                                  position: 'absolute', 
                                  inset: 0, 
                                  cursor: 'grab', 
                                  '&:active': { cursor: 'grabbing' },
                                  zIndex: 1
                                }}
                                draggable
                                onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                                  e.dataTransfer.setData('text/plain', absoluteIdx.toString());
                                  if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.style.opacity = '0.4';
                                  }
                                }}
                                onDragEnd={(e: React.DragEvent<HTMLDivElement>) => {
                                  if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.style.opacity = '1';
                                  }
                                }}
                                onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
                                onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                                  e.preventDefault();
                                  const fromIdxStr = e.dataTransfer.getData('text/plain');
                                  const fromIdx = parseInt(fromIdxStr);
                                  if (!isNaN(fromIdx) && fromIdx !== absoluteIdx) {
                                    handleDragEnd(images[fromIdx], idx);
                                  }
                                }}
                              >
                                <Box sx={{ position: 'absolute', top: 8, right: 8, color: 'text.disabled', zIndex: 3 }}>
                                  <GripVertical size={16} />
                                </Box>
                              </Box>

                              {/* Hover Actions */}
                              <Box
                                className="page-actions"
                                sx={{
                                  position: "absolute",
                                  bottom: 8,
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  bgcolor: "background.paper",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 0.5,
                                  p: 0.5,
                                  borderRadius: '8px',
                                  opacity: 0,
                                  transition: "all 0.2s ease",
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                  zIndex: 5
                                }}
                              >
                                <Tooltip title="Remove Page">
                                  <IconButton
                                    size="small"
                                    onClick={() => removeImage(item.id)}
                                    sx={{ 
                                      color: "error.main",
                                      p: 0.5
                                    }}
                                  >
                                    <Trash2 size={16} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </Box>

                  {images.length > itemsPerPage && (
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                      <Pagination 
                        count={Math.ceil(images.length / itemsPerPage)} 
                        page={currentPage} 
                        onChange={(_: React.ChangeEvent<unknown>, v: number) => setCurrentPage(v)}
                        color="secondary"
                        sx={{
                          "& .MuiPaginationItem-root": { fontWeight: 900, borderRadius: 2 }
                        }}
                      />
                    </Box>
                  )}
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
