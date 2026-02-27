
'use client';

import React, { useState, useRef } from 'react';
import { 
  Box, Card, CardContent, Typography, Button, TextField, 
  Slider, FormControlLabel, Switch, Grid, Chip, Stack,
  CircularProgress, Alert
} from '@mui/material';
import { Upload, Download, RefreshCw, Smartphone } from 'lucide-react';
import { compressImage, formatFileSize } from '@/lib/image-utils';
import { GOV_PRESETS } from '@/constants/presets';

export function ImageOptimizer() {
  const [file, setFile] = useState<File | null>(null);
  const [targetSize, setTargetSize] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; url: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, WEBP).');
        return;
      }
      setFile(selected);
      setResult(null);
      setError(null);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const compressed = await compressImage(file, targetSize);
      const url = URL.createObjectURL(compressed);
      setResult({
        blob: compressed,
        url,
        size: compressed.size,
      });
    } catch (err) {
      setError('Compression failed. Try a different image or target size.');
    } finally {
      setIsProcessing(false);
    }
  };

  const applyPreset = (kb: number) => {
    setTargetSize(kb);
  };

  const downloadResult = () => {
    if (!result || !file) return;
    const link = document.createElement('a');
    link.href = result.url;
    link.download = `optimized_${file.name}`;
    link.click();
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom align="center">
        Precise Image Optimizer
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Resize and compress images to your exact requirements for SSC, UPSC, and State Gov exams.
      </Typography>

      <Card sx={{ border: '2px dashed', borderColor: 'divider', mb: 4 }}>
        <CardContent sx={{ py: 6, textAlign: 'center' }}>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          {!file ? (
            <Box onClick={() => fileInputRef.current?.click()} sx={{ cursor: 'pointer' }}>
              <Upload size={48} color="rgba(0,0,0,0.3)" />
              <Typography variant="h6" sx={{ mt: 2 }}>Click to upload or drag & drop</Typography>
              <Typography variant="body2" color="text.secondary">Supports JPG, PNG, WEBP (Max 20MB)</Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>{file.name}</Typography>
              <Typography variant="body2" color="text.secondary">{formatFileSize(file.size)}</Typography>
              <Button size="small" sx={{ mt: 1 }} onClick={() => setFile(null)}>Change File</Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {file && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom fontWeight={700}>Target File Size (KB)</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Slider
                    value={targetSize}
                    onChange={(_, val) => setTargetSize(val as number)}
                    min={10}
                    max={1000}
                    sx={{ flexGrow: 1 }}
                  />
                  <TextField
                    size="small"
                    value={targetSize}
                    onChange={(e) => setTargetSize(Number(e.target.value))}
                    sx={{ width: 80 }}
                    type="number"
                  />
                </Box>

                <Typography variant="subtitle2" gutterBottom fontWeight={700}>Quick Presets</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                   <Chip label="SSC Photo (50KB)" onClick={() => applyPreset(50)} />
                   <Chip label="SSC Sign (20KB)" onClick={() => applyPreset(20)} />
                   <Chip label="UPSC (100KB)" onClick={() => applyPreset(100)} />
                   <Chip label="State PSC (200KB)" onClick={() => applyPreset(200)} />
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <RefreshCw size={20} />}
                  onClick={handleProcess}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Optimizing...' : 'Optimize Image'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>

            {result ? (
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'primary.dark', color: 'white' }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" gutterBottom>Optimization Result</Typography>
                  <Typography variant="h4" fontWeight={800}>{formatFileSize(result.size)}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>Target achieved!</Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="large"
                    startIcon={<Download />}
                    onClick={downloadResult}
                  >
                    Download Optimized
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">Optimization metadata will appear here</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      )}

      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
    </Box>
  );
}
