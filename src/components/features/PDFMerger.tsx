
'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  Grid, Stack, IconButton, Alert, CircularProgress, Chip, LinearProgress
} from '@mui/material';
import { FileText, X, Download, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { formatFileSize } from '@/lib/image-utils';
import { mergePDFs } from '@/lib/pdf-utils';

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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      id: `${f.name}-${Date.now()}-${Math.random()}`,
    }));

    setPdfs((prev) => [...prev, ...newItems]);
    setResult(null);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addPDFs(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addPDFs(e.dataTransfer.files);
  };

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
      const blob = new Blob([mergedBytes.buffer as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult({ url, size: blob.size });
    } catch (err: any) {
      setError(err.message || 'Merging failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = 'merged_document.pdf';
    a.click();
  };

  const clearAll = () => {
    setPdfs([]);
    setResult(null);
    setError(null);
  };

  const totalSize = pdfs.reduce((sum, i) => sum + i.file.size, 0);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom align="center">
        PDF Merger
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Combine multiple PDF documents into a single file instantly.
      </Typography>

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
            accept=".pdf"
            multiple
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <FileText size={48} color="rgba(128,128,128,0.4)" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {isDragging ? 'Drop PDFs here' : 'Click or drag & drop PDF files'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select two or more PDF files to merge them
          </Typography>
        </CardContent>
      </Card>

      {pdfs.length > 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight={800}>
                    Files ({pdfs.length})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={`Total: ${formatFileSize(totalSize)}`}
                      size="small"
                      variant="outlined"
                    />
                    <Button size="small" color="error" onClick={clearAll}>
                      Clear All
                    </Button>
                  </Box>
                </Box>

                <Stack spacing={1.5} sx={{ maxHeight: 400, overflowY: 'auto', pr: 0.5 }}>
                  {pdfs.map((item, index) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                      }}
                    >
                      <FileText size={24} color="#f44336" />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {item.file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(item.file.size)}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0}>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); movePDF(index, 'up'); }}
                          disabled={index === 0}
                        >
                          <ArrowUp size={14} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); movePDF(index, 'down'); }}
                          disabled={index === pdfs.length - 1}
                        >
                          <ArrowDown size={14} />
                        </IconButton>
                      </Stack>

                      <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); removePDF(item.id); }}>
                        <X size={16} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>

                {isProcessing && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Merging PDFs... {progress}%
                    </Typography>
                    <LinearProgress variant="determinate" value={progress} sx={{ mt: 1, borderRadius: 2 }} />
                  </Box>
                )}

                <Button
                  sx={{ mt: 3 }}
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <RefreshCw size={20} />}
                  onClick={handleMerge}
                  disabled={isProcessing || pdfs.length < 2}
                >
                  {isProcessing ? 'Merging...' : `Merge ${pdfs.length} PDFs`}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            {result ? (
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'primary.dark', color: 'white' }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" gutterBottom>Merged PDF Ready!</Typography>
                  <Typography variant="h4" fontWeight={800}>{formatFileSize(result.size)}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                    {pdfs.length} files combined
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="large"
                    startIcon={<Download />}
                    onClick={handleDownload}
                  >
                    Download Merged PDF
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ height: '100%', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  Your merged PDF will appear here
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
