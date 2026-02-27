
'use client';

import React, { useState, useRef } from 'react';
import { 
  Box, Card, CardContent, Typography, Button, TextField, 
  Slider, Grid, Chip, Stack, CircularProgress, Alert, Divider
} from '@mui/material';
import { Upload, Download, RefreshCw, FileText } from 'lucide-react';
import { formatFileSize } from '@/lib/image-utils';
import { compressPDF } from '@/lib/pdf-utils';

export function PDFOptimizer() {
  const [file, setFile] = useState<File | null>(null);
  const [targetSize, setTargetSize] = useState<number>(500);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Uint8Array; url: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== 'application/pdf') {
        setError('Please select a PDF file.');
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
      const compressedBytes = await compressPDF(file, targetSize);
      const blob = new Blob([compressedBytes.buffer as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult({
        blob: compressedBytes,
        url,
        size: compressedBytes.length,
      });
    } catch (err) {
      setError('PDF compression failed. This might happen with complex or already highly-compressed PDFs.');
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
        PDF Size Compressor
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Reduce PDF file size while maintaining layout integrity for document uploads.
      </Typography>

      <Card sx={{ border: '2px dashed', borderColor: 'divider', mb: 4 }}>
        <CardContent sx={{ py: 6, textAlign: 'center' }}>
          <input
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          {!file ? (
            <Box onClick={() => fileInputRef.current?.click()} sx={{ cursor: 'pointer' }}>
              <FileText size={48} color="rgba(0,0,0,0.3)" />
              <Typography variant="h6" sx={{ mt: 2 }}>Click to upload PDF</Typography>
              <Typography variant="body2" color="text.secondary">Max 50MB</Typography>
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
                    min={50}
                    max={2000}
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
                   <Chip label="Standard (500KB)" onClick={() => applyPreset(500)} />
                   <Chip label="High Compression (200KB)" onClick={() => applyPreset(200)} />
                   <Chip label="Documents (1MB)" onClick={() => applyPreset(1000)} />
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <RefreshCw size={20} />}
                  onClick={handleProcess}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Compressing...' : 'Compress PDF'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>


            {result ? (
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'primary.dark', color: 'white' }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" gutterBottom>Compression Result</Typography>
                  <Typography variant="h4" fontWeight={800}>{formatFileSize(result.size)}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                    {((1 - result.size / file.size) * 100).toFixed(1)}% Smaller
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="large"
                    startIcon={<Download />}
                    onClick={downloadResult}
                  >
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">Compression results will appear here</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      )}

      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
    </Box>
  );
}
