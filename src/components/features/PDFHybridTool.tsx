
'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  Grid, Stack, IconButton, Alert, CircularProgress, 
  LinearProgress, Slider, Select, MenuItem, FormControl, InputLabel, Divider, Tooltip
} from '@mui/material';
import { 
  FileText, Download, RefreshCw, X, Image as ImageIcon, 
  Settings, Save, ZoomIn, Info
} from 'lucide-react';
import { formatFileSize } from '@/lib/image-utils';
import { pdfToImages, imagesToPDF } from '@/lib/pdf-utils';

interface PDFPageResult {
  blob: Blob;
  name: string;
  url: string;
  size: number;
}

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export function PDFHybridTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pages, setPages] = useState<PDFPageResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Settings
  const [format, setFormat] = useState<OutputFormat>('image/jpeg');
  const [scale, setScale] = useState<number>(2);
  const [quality, setQuality] = useState<number>(80);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((files: FileList | File[]) => {
    const selected = files[0];
    if (selected) {
      if (selected.type !== 'application/pdf') {
        setError('Please select a PDF file.');
        return;
      }
      setFile(selected);
      setPages([]);
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

  const clearPages = () => {
    pages.forEach(p => URL.revokeObjectURL(p.url));
    setPages([]);
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    clearPages();

    try {
      const images = await pdfToImages(file, {
        format,
        scale,
        quality: quality / 100,
        onProgress: (p) => setProgress(p)
      });
      
      const pageResults = images.map((img) => ({
        ...img,
        url: URL.createObjectURL(img.blob),
        size: img.blob.size
      }));
      
      setPages(pageResults);
    } catch (err: any) {
      setError(err.message || 'Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImages = () => {
    pages.forEach((page) => {
      const a = document.createElement('a');
      a.href = page.url;
      a.download = page.name;
      a.click();
    });
  };

  const rebuildPDF = async () => {
    if (pages.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const files = pages.map(p => new File([p.blob], p.name, { type: p.blob.type }));
      const pdfBytes = await imagesToPDF(files);
      
      const blob = new Blob([pdfBytes.buffer as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimized_${file?.name || 'document.pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('PDF Rebuild failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    clearPages();
    setFile(null);
    setError(null);
    setProgress(0);
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom align="center">
        PDF Magic: Edit & Rebuild
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Deconstruct any PDF into images, optimize them, and rebuild a new PDF instantly.
      </Typography>

      <Grid container spacing={4}>
        {/* Left Side: Upload & Settings */}
        <Grid size={{ xs: 12, md: file ? 4 : 12 }}>
          <Card
            sx={{
              border: '2px dashed',
              borderColor: isDragging ? 'primary.main' : 'divider',
              mb: 3,
              bgcolor: isDragging ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
              transition: 'all 0.2s',
              cursor: 'pointer',
              display: file ? 'none' : 'block'
            }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent sx={{ py: 5, textAlign: 'center' }}>
              <input type="file" accept=".pdf" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
              <FileText size={48} color="rgba(128,128,128,0.4)" />
              <Typography variant="h6" sx={{ mt: 2 }}>Click or Drop PDF</Typography>
              <Typography variant="body2" color="text.secondary">Select a PDF to begin surgical editing</Typography>
            </CardContent>
          </Card>

          {file && (
            <Stack spacing={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Settings size={18} /> GLOBAL SETTINGS
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Stack spacing={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Output Format</InputLabel>
                      <Select value={format} label="Output Format" onChange={(e) => setFormat(e.target.value as OutputFormat)}>
                        <MenuItem value="image/jpeg">JPG (Best for size)</MenuItem>
                        <MenuItem value="image/png">PNG (Best for text)</MenuItem>
                        <MenuItem value="image/webp">WebP (Modern/Aggressive)</MenuItem>
                      </Select>
                    </FormControl>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        RESOLUTION (SCALE) <Tooltip title="Higher scale = Sharper images but larger size"><Info size={12} /></Tooltip>
                      </Typography>
                      <Slider 
                        value={scale} 
                        min={0.5} max={4} step={0.5} 
                        marks={[{value: 1, label: '1x'}, {value: 2, label: '2x'}, {value: 4, label: '4x'}]} 
                        onChange={(_, v) => setScale(v as number)}
                      />
                    </Box>

                    {format !== 'image/png' && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">COMPRESSION QUALITY ({quality}%)</Typography>
                        <Slider 
                          value={quality} 
                          min={10} max={100} 
                          onChange={(_, v) => setQuality(v as number)}
                          sx={{ color: quality < 40 ? 'error.main' : quality < 70 ? 'warning.main' : 'primary.main' }}
                        />
                      </Box>
                    )}

                    <Button 
                      fullWidth 
                      variant="contained" 
                      size="large"
                      startIcon={<RefreshCw size={20} />}
                      onClick={handleProcess}
                      disabled={isProcessing}
                    >
                      Process PDF
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} noWrap>{file.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{formatFileSize(file.size)}</Typography>
                  <Button size="small" color="error" fullWidth sx={{ mt: 1 }} onClick={clearAll}>Change PDF</Button>
                </CardContent>
              </Card>
            </Stack>
          )}
        </Grid>

        {/* Right Side: Results */}
        <Grid size={{ xs: 12, md: 8 }}>
          {!file && (
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 4, bgcolor: 'rgba(0,0,0,0.02)' }}>
              <Typography color="text.secondary">Upload a PDF to start extracting and editing</Typography>
            </Box>
          )}

          {isProcessing && (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h6">Slicing PDF... {progress}%</Typography>
              <LinearProgress variant="determinate" value={progress} sx={{ mt: 2, maxWidth: 300, mx: 'auto', borderRadius: 2 }} />
            </Box>
          )}

          {pages.length > 0 && !isProcessing && (
            <Box>
              <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={800}>DECONSTRUCTED PAGES ({pages.length})</Typography>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" startIcon={<ImageIcon />} onClick={downloadImages}>Download All Images</Button>
                  <Button variant="contained" size="small" color="secondary" startIcon={<Save />} onClick={rebuildPDF}>Rebuild PDF</Button>
                </Stack>
              </Box>

              <Grid container spacing={2}>
                {pages.map((page, idx) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={idx}>
                    <Card variant="outlined" sx={{ overflow: 'hidden' }}>
                      <Box sx={{ height: 160, bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <img src={page.url} alt={page.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        <Box sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', px: 1, py: 0.2, borderRadius: 1, fontSize: '10px' }}>
                          {formatFileSize(page.size)}
                        </Box>
                      </Box>
                      <Box sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="caption" fontWeight={700} noWrap display="block">Page {idx + 1}</Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
    </Box>
  );
}
