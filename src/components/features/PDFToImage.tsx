
'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  Grid, Stack, IconButton, Alert, CircularProgress, LinearProgress
} from '@mui/material';
import { FileText, Download, RefreshCw, X, Image as ImageIcon } from 'lucide-react';
import { formatFileSize } from '@/lib/image-utils';
import { pdfToImages } from '@/lib/pdf-utils';

interface PDFToImageResult {
  blob: Blob;
  name: string;
  url: string;
}

export function PDFToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<PDFToImageResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((files: FileList | File[]) => {
    const selected = files[0];
    if (selected) {
      if (selected.type !== 'application/pdf') {
        setError('Please select a PDF file.');
        return;
      }
      setFile(selected);
      setResults([]);
      setError(null);
      setProgress(0);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFile(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResults([]);

    try {
      const images = await pdfToImages(file, (p) => setProgress(p));
      const resultsWithUrls = images.map((img) => ({
        ...img,
        url: URL.createObjectURL(img.blob)
      }));
      setResults(resultsWithUrls);
    } catch (err: any) {
      setError(err.message || 'Conversion failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async () => {
    // For now, let's just trigger individual downloads or show them
    // Ideally we could zip them, but let's stick to simple downloads for now
    results.forEach((res) => {
      const a = document.createElement('a');
      a.href = res.url;
      a.download = res.name;
      a.click();
    });
  };

  const downloadSingle = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  };

  const clearAll = () => {
    results.forEach((res) => URL.revokeObjectURL(res.url));
    setFile(null);
    setResults([]);
    setError(null);
    setProgress(0);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom align="center">
        PDF to Image Converter
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Extract pages from your PDF and save them as high-quality JPG images.
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
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <FileText size={48} color="rgba(128,128,128,0.4)" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {isDragging ? 'Drop PDF here' : 'Click or drag & drop a PDF file'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {file ? `Selected: ${file.name} (${formatFileSize(file.size)})` : 'Convert PDF pages to JPG images'}
          </Typography>
        </CardContent>
      </Card>

      {file && !results.length && (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {isProcessing && (
            <Box sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Converting pages... {progress}%
              </Typography>
              <LinearProgress variant="determinate" value={progress} sx={{ mt: 1, borderRadius: 2 }} />
            </Box>
          )}
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <RefreshCw size={20} />}
              onClick={handleConvert}
              disabled={isProcessing}
            >
              {isProcessing ? 'Converting...' : 'Convert to Images'}
            </Button>
            <Button variant="outlined" color="error" onClick={() => setFile(null)} disabled={isProcessing}>
              Cancel
            </Button>
          </Stack>
        </Box>
      )}

      {results.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={800}>
              Extracted Images ({results.length})
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" color="primary" startIcon={<Download />} onClick={downloadAll}>
                Download All
              </Button>
              <Button variant="outlined" color="error" onClick={clearAll}>
                Clear
              </Button>
            </Stack>
          </Box>

          <Grid container spacing={2}>
            {results.map((res, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card variant="outlined" sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={res.url}
                    alt={res.name}
                    sx={{ width: '100%', height: 200, objectFit: 'contain', bgcolor: '#f5f5f5' }}
                  />
                  <CardContent sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: '70%' }}>
                      {res.name}
                    </Typography>
                    <IconButton size="small" onClick={() => downloadSingle(res.url, res.name)}>
                      <Download size={16} />
                    </IconButton>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {error && <Alert severity="warning" sx={{ mt: 3 }}>{error}</Alert>}
    </Box>
  );
}
