
'use client';

import React, { useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  Grid, Stack, CircularProgress, LinearProgress, Divider
} from '@mui/material';
import { 
  FileText, RefreshCw, Save, 
  Image as ImageIcon, Scissors, Layers 
} from 'lucide-react';
import { formatFileSize } from '@/lib/image-utils';
import { pdfToImages, imagesToPDF } from '@/lib/pdf-utils';
import { FileDropzone } from '../common/FileDropzone';
import { ToolLayout } from '../common/ToolLayout';
import { motion, AnimatePresence } from 'framer-motion';

interface PageItem {
  blob: Blob;
  url: string;
  name: string;
  size: number;
}

export function PDFHybridTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelected = useCallback(async (files: FileList | File[]) => {
    const selectedFile = files[0];
    if (selectedFile?.type !== 'application/pdf') return;

    setFile(selectedFile);
    setIsProcessing(true);
    setProgress(0);
    setPages([]);

    try {
      const extractedPages = await pdfToImages(selectedFile, {
        scale: 2.0,
        format: 'image/jpeg',
        quality: 0.9,
        onProgress: (p) => setProgress(p)
      });

      const pageItems = extractedPages.map(p => ({
        ...p,
        url: URL.createObjectURL(p.blob),
        size: p.blob.size
      }));

      setPages(pageItems);
    } catch (err) {
      console.error('PDF Processing Error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const downloadImages = async () => {
    pages.forEach((page, idx) => {
      const a = document.createElement('a');
      a.href = page.url;
      a.download = `page_${idx + 1}.jpg`;
      a.click();
    });
  };

  const rebuildPDF = async () => {
    setIsProcessing(true);
    try {
      const files = pages.map(p => new File([p.blob], p.name, { type: 'image/jpeg' }));
      const pdfBytes = await imagesToPDF(files, { pageSize: 'ORIGINAL' });
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rebuilt_document.pdf';
      a.click();
    } catch (err) {
      console.error('PDF Rebuild Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    pages.forEach(p => URL.revokeObjectURL(p.url));
    setFile(null);
    setPages([]);
    setProgress(0);
  };

  return (
    <ToolLayout 
      toolName="Surgical Editor" 
      title="PDF Surgical Editor"
      description="Deconstruct PDFs into high-quality images, modify them, and rebuild. The ultimate tool for fixing, optimizing, or extracting from existing PDF documents."
    >
      <Grid container spacing={4}>
        {/* Left Side: Control Panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {!file ? (
              <FileDropzone 
                onFilesSelected={handleFileSelected}
                accept=".pdf"
                title="Select PDF for Surgery"
                subtitle="PDF will be sliced into individual pages"
                icon={<Scissors size={32} />}
              />
            ) : (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FileText size={18} /> ACTIVE DOCUMENT
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={2}>
                    <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                      <Typography variant="body2" fontWeight={900} noWrap>{file.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatFileSize(file.size)} • {pages.length} Pages</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="secondary" 
                        startIcon={<Save />}
                        onClick={rebuildPDF}
                        disabled={isProcessing || pages.length === 0}
                      >
                        Rebuild PDF
                      </Button>
                      <Button variant="outlined" color="error" onClick={clearAll} disabled={isProcessing}>
                        <RefreshCw size={18} />
                      </Button>
                    </Box>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<ImageIcon />}
                      onClick={downloadImages}
                      disabled={isProcessing || pages.length === 0}
                    >
                      Extract All Pages
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Card variant="outlined" sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={900} gutterBottom>WHY USE THIS?</Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  This tool deconstructs your PDF into 300DPI images. You can extract high-quality assets or rebuild the PDF to significantly reduce its size while keeping it professional.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Side: Workspace */}
        <Grid size={{ xs: 12, md: 8 }}>
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0' }}>
                <CircularProgress size={60} thickness={4} sx={{ mb: 4 }} />
                <Typography variant="h5" fontWeight={900} gutterBottom>Slicing Document...</Typography>
                <Typography variant="body2" color="text.secondary">Running browser-side extraction via WebWorkers</Typography>
                <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
                  <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>{progress}% Complete</Typography>
                </Box>
              </motion.div>
            ) : pages.length > 0 ? (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 3 }}>Deconstructed Pages</Typography>
                <Grid container spacing={2}>
                  {pages.map((page, idx) => (
                    <Grid size={{ xs: 6, sm: 4, lg: 3 }} key={idx}>
                      <Card sx={{ height: '100%', position: 'relative', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}>
                        <Box sx={{ height: 180, bgcolor: 'action.hover', position: 'relative', overflow: 'hidden' }}>
                          <img src={page.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="page" />
                          <Box sx={{ position: 'absolute', top: 6, left: 6, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', px: 1, py: 0.2, borderRadius: 1, fontSize: '10px', fontWeight: 900 }}>
                            P{idx + 1}
                          </Box>
                        </Box>
                        <Box sx={{ p: 1, textAlign: 'center' }}>
                          <Typography variant="caption" fontWeight={700} color="text.secondary">
                            {formatFileSize(page.size)}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stack spacing={2} alignItems="center">
                  <Box sx={{ p: 3, bgcolor: 'action.hover', borderRadius: '50%', color: 'text.disabled' }}>
                    <Layers size={48} />
                  </Box>
                  <Typography variant="body1" color="text.disabled">Select a PDF to begin the surgical extraction</Typography>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>
      </Grid>
    </ToolLayout>
  );
}
