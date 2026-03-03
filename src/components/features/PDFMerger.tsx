
'use client';

import React, { useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  Grid, Stack, IconButton, Alert, CircularProgress, LinearProgress, Divider, Tooltip
} from '@mui/material';
import { FileText, Download, RefreshCw, ArrowUp, ArrowDown, Files, Trash2 } from 'lucide-react';
import { formatFileSize } from '@/lib/image-utils';
import { mergePDFs } from '@/lib/pdf-utils';
import { FileDropzone } from '../common/FileDropzone';
import { ToolLayout } from '../common/ToolLayout';
import { motion, AnimatePresence } from 'framer-motion';

interface PDFItem {
  file: File;
  id: string;
}

export function PDFMerger() {
  const [pdfs, setPdfs] = useState<PDFItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addPDFs = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((f) => f.type === 'application/pdf');

    if (validFiles.length !== fileArray.length) {
      setError('Some files were skipped. Only PDF files are supported.');
    } else {
      setError(null);
    }

    const newItems: PDFItem[] = validFiles.map((f) => ({
      file: f,
      id: Math.random().toString(36).substr(2, 9),
    }));

    setPdfs((prev) => [...prev, ...newItems]);
    setResult(null);
  }, []);

  const removePDF = (id: string) => {
    setPdfs((prev) => prev.filter((i) => i.id !== id));
    setResult(null);
  };

  const movePDF = (index: number, direction: 'up' | 'down') => {
    const newPdfs = [...pdfs];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newPdfs.length) return;
    [newPdfs[index], newPdfs[swapIndex]] = [newPdfs[swapIndex], newPdfs[index]];
    setPdfs(newPdfs);
  };

  const handleMerge = async () => {
    if (pdfs.length < 2) {
      setError('Please add at least two PDF files to merge.');
      return;
    }
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const mergedBytes = await mergePDFs(
        pdfs.map((p) => p.file),
        (p) => setProgress(p)
      );
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult({ url, size: blob.size });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Merging failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalSize = pdfs.reduce((sum, i) => sum + i.file.size, 0);

  return (
    <ToolLayout 
      toolName="PDF Merger" 
      title="Advanced PDF Merger"
      description="Combine multiple PDF documents into a single professional file. Reorder pages instantly with browser-side processing."
    >
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3}>
            <FileDropzone 
              onFilesSelected={addPDFs}
              accept=".pdf"
              multiple
              title="Add PDF documents"
              subtitle="Drag multiple PDFs or click to browse"
              icon={<Files size={32} />}
            />

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  MERGE SUMMARY
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Total Files:</Typography>
                    <Typography variant="body2" fontWeight={800}>{pdfs.length}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Est. Output Size:</Typography>
                    <Typography variant="body2" fontWeight={800}>{formatFileSize(totalSize)}</Typography>
                  </Box>
                  
                  {isProcessing && (
                    <Box>
                      <Typography variant="caption" color="primary" fontWeight={800}>Merging Documents... {progress}%</Typography>
                      <LinearProgress variant="determinate" value={progress} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleMerge}
                    disabled={isProcessing || pdfs.length < 2}
                    startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <RefreshCw size={20} />}
                  >
                    Merge All Files
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {result && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Card sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom>MERGED SUCCESSFULLY</Typography>
                    <Typography variant="h4" fontWeight={900}>{formatFileSize(result.size)}</Typography>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="primary" 
                      startIcon={<Download />}
                      href={result.url}
                      download="merged_document.pdf"
                      sx={{ mt: 2 }}
                    >
                      Download Merged PDF
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>
            <AnimatePresence>
              {pdfs.length > 0 ? (
                pdfs.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    layout
                  >
                    <Card variant="outlined" sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 2,
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                    }}>
                      <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: 2, color: 'white', mr: 2 }}>
                        <FileText size={24} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={800} noWrap color="text.primary">{item.file.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatFileSize(item.file.size)}</Typography>
                      </Box>
                      
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Move Up">
                          <IconButton size="small" onClick={() => movePDF(index, 'up')} disabled={index === 0}>
                            <ArrowUp size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Move Down">
                          <IconButton size="small" onClick={() => movePDF(index, 'down')} disabled={index === pdfs.length - 1}>
                            <ArrowDown size={18} />
                          </IconButton>
                        </Tooltip>
                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                        <IconButton size="small" color="error" onClick={() => removePDF(item.id)}>
                          <Trash2 size={18} />
                        </IconButton>
                      </Stack>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 4 }}>
                  <Typography color="text.secondary">Queue is empty. Add some PDFs to begin.</Typography>
                </Box>
              )}
            </AnimatePresence>
          </Stack>
        </Grid>
      </Grid>
      
      {error && <Alert severity="error" sx={{ mt: 3, borderRadius: 4 }}>{error}</Alert>}
    </ToolLayout>
  );
}
