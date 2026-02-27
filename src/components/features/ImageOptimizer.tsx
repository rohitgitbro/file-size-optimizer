
'use client';

import React, { useState, useRef } from 'react';
import { 
  Box, Card, CardContent, Typography, Button, TextField, 
  Slider, Stack, CircularProgress, Alert, Grid
} from '@mui/material';
import { Upload, Download, RefreshCw, Smartphone, Link2, Link2Off } from 'lucide-react';
import { compressImage, formatFileSize } from '@/lib/image-utils';

export function ImageOptimizer() {
  const [file, setFile] = useState<File | null>(null);
  const [targetSize, setTargetSize] = useState<number | ''>(100);
  const [unit, setUnit] = useState<'KB' | 'MB'>('KB');
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [customWidth, setCustomWidth] = useState<number | ''>('');
  const [customHeight, setCustomHeight] = useState<number | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; url: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLinked, setIsLinked] = useState(true);
  const [originalRatio, setOriginalRatio] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, WEBP).');
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        setOriginalRatio(ratio);
        setCustomWidth(img.width);
        setCustomHeight(img.height);
        setFile(selected);
        setResult(null);
        setError(null);
      };
      img.src = URL.createObjectURL(selected);
    }
  };

  const handleWidthChange = (val: string) => {
    if (val === '') {
      setCustomWidth('');
      return;
    }
    const num = Number(val);
    if (isNaN(num)) return;
    setCustomWidth(num);
    if (isLinked && originalRatio) {
      setCustomHeight(Math.round(num / originalRatio));
    }
  };

  const handleHeightChange = (val: string) => {
    if (val === '') {
      setCustomHeight('');
      return;
    }
    const num = Number(val);
    if (isNaN(num)) return;
    setCustomHeight(num);
    if (isLinked && originalRatio) {
      setCustomWidth(Math.round(num * originalRatio));
    }
  };

  const handleProcess = async (sizeOverride?: number, unitOverride?: 'KB' | 'MB') => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    
    const currentSize = sizeOverride !== undefined ? sizeOverride : (targetSize === '' ? 100 : targetSize);
    const currentUnit = unitOverride || unit;
    const targetKB = currentUnit === 'MB' ? Number(currentSize) * 1024 : Number(currentSize);

    try {
      const compressed = await compressImage(file, targetKB, { 
        maxWidthOrHeight: (customWidth && customHeight) ? undefined : maxWidth,
        width: typeof customWidth === 'number' ? customWidth : undefined,
        height: typeof customHeight === 'number' ? customHeight : undefined
      });
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

  const downloadResult = () => {
    if (!result || !file) return;
    const link = document.createElement('a');
    link.href = result.url;
    link.download = `optimized_${file.name}`;
    link.click();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: 2 }}>
      <Typography variant="h4" fontWeight={900} gutterBottom align="center" sx={{ letterSpacing: -0.5 }}>
        Precise Image Optimizer
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
        Professional-grade resizing and compression. Automatically detects your image dimensions for the perfect fit.
      </Typography>

      <Card sx={{ border: '2px dashed', borderColor: 'divider', mb: 6, borderRadius: 4, bgcolor: 'action.hover' }}>
        <CardContent sx={{ py: 8, textAlign: 'center' }}>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          {!file ? (
            <Box onClick={() => fileInputRef.current?.click()} sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }}>
              <Upload size={64} strokeWidth={1.5} color="rgba(0,0,0,0.2)" />
              <Typography variant="h5" sx={{ mt: 3, fontWeight: 700 }}>Upload Image</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Drag & drop or click to browse (Max 20MB)</Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'inline-flex', p: 1, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, mb: 2 }}>
                <Smartphone size={20} />
              </Box>
              <Typography variant="h6" fontWeight={800}>{file.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{formatFileSize(file.size)}</Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => { setFile(null); setResult(null); }}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Change File
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {file && (
        <Stack spacing={4}>
          {/* Row 1: Previews */}
          <Card variant="outlined" sx={{ overflow: 'hidden', borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <Grid container>
              <Grid size={{ xs: 12, md: 6 }} sx={{ borderRight: { md: '1px solid' }, borderColor: 'divider' }}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
                  <Typography variant="caption" fontWeight={900} letterSpacing={1.5}>ORIGINAL IMAGE</Typography>
                </Box>
                <Box sx={{ p: { xs: 2, md: 4 }, position: 'relative', display: 'flex', justifyContent: 'center', minHeight: { xs: 300, md: 450 }, alignItems: 'center', bgcolor: 'grey.100' }}>
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="Original" 
                    style={{ maxWidth: '100%', maxHeight: 500, objectFit: 'contain', borderRadius: '4px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }} 
                  />
                  <Box sx={{ 
                    position: 'absolute', bottom: 16, px: 2, py: 0.5, 
                    bgcolor: 'rgba(0,0,0,0.8)', color: 'white', 
                    borderRadius: 2, fontSize: '0.75rem', fontWeight: 700,
                    backdropFilter: 'blur(4px)'
                  }}>
                    {formatFileSize(file.size)} {typeof customWidth === 'number' && ` • ${customWidth}x${customHeight}px`}
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderBottom: '1px solid', borderColor: 'primary.dark', display: 'flex', justifyContent: 'center' }}>
                  <Typography variant="caption" fontWeight={900} letterSpacing={1.5}>OPTIMIZED RESULT</Typography>
                </Box>
                <Box sx={{ p: { xs: 2, md: 4 }, position: 'relative', display: 'flex', justifyContent: 'center', minHeight: { xs: 300, md: 450 }, alignItems: 'center', bgcolor: 'background.paper' }}>
                  {isProcessing ? (
                    <Stack spacing={3} alignItems="center">
                      <CircularProgress size={48} thickness={4} />
                      <Typography variant="h6" fontWeight={700} color="text.secondary">Processing...</Typography>
                    </Stack>
                  ) : result ? (
                    <>
                      <img 
                        src={result.url} 
                        alt="Optimized" 
                        style={{ maxWidth: '100%', maxHeight: 500, objectFit: 'contain', borderRadius: '4px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.05))' }} 
                      />
                      <Box sx={{ 
                        position: 'absolute', bottom: 16, px: 2, py: 0.5, 
                        bgcolor: 'success.main', color: 'white', 
                        borderRadius: 2, fontSize: '0.75rem', fontWeight: 900,
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
                      }}>
                        {formatFileSize(result.size)} ({((1 - result.size / file.size) * 100).toFixed(0)}% smaller)
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.disabled" fontWeight={600}>Adjust settings below to optimize</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* Row 2: Settings */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card variant="outlined" sx={{ borderRadius: 4, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 28, height: 28, bgcolor: 'primary.main', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>1</Box>
                    Target File Size
                  </Typography>

                  <Grid container spacing={1}>
                    {[20, 50, 100, 150, 200, 500].map((kb) => (
                      <Grid size={{ xs: 4, sm: 2 }} key={kb}>
                        <Box 
                          onClick={() => { setTargetSize(kb); setUnit('KB'); setTimeout(() => handleProcess(kb, 'KB'), 0); }} 
                          sx={{ 
                            width: '100%', borderRadius: 2, py: 1.2, textAlign: 'center', cursor: 'pointer',
                            border: '1.5px solid', borderColor: (targetSize === kb && unit === 'KB') ? 'primary.main' : 'divider',
                            bgcolor: (targetSize === kb && unit === 'KB') ? 'primary.main' + '08' : 'background.paper',
                            color: (targetSize === kb && unit === 'KB') ? 'primary.main' : 'text.primary',
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                          }}
                        >
                          <Typography variant="caption" fontWeight={800}>{kb}KB</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ mt: 3, p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', bgcolor: 'white', p: 0.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        {['KB', 'MB'].map((u) => (
                          <Box
                            key={u}
                            onClick={() => setUnit(u as 'KB' | 'MB')}
                            sx={{
                              px: 3, py: 0.5, cursor: 'pointer', borderRadius: 1.5, fontSize: '0.7rem', fontWeight: 900,
                              bgcolor: unit === u ? 'primary.main' : 'transparent',
                              color: unit === u ? 'white' : 'text.disabled',
                            }}
                          >
                            {u}
                          </Box>
                        ))}
                      </Box>
                      <TextField
                        size="small"
                        placeholder="Value"
                        type="number"
                        value={targetSize}
                        onChange={(e) => setTargetSize(e.target.value === '' ? '' : Number(e.target.value))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white', fontWeight: 800, width: 100 } }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Card variant="outlined" sx={{ borderRadius: 4, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 28, height: 28, bgcolor: 'primary.main', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>2</Box>
                    Resize Settings
                  </Typography>

                  <Stack spacing={2.5}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" fontWeight={800} color="text.secondary">WIDTH</Typography>
                        <TextField
                          fullWidth size="small" placeholder="Auto" value={customWidth}
                          onChange={(e) => handleWidthChange(e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: 'background.paper', fontSize: '0.8rem' } }}
                        />
                      </Box>
                      
                      <Box 
                        onClick={() => setIsLinked(!isLinked)}
                        sx={{ 
                          mt: 2.5, cursor: 'pointer', color: isLinked ? 'primary.main' : 'text.disabled',
                          display: 'flex', alignItems: 'center', transition: 'all 0.2s',
                          '&:hover': { color: 'primary.main', transform: 'scale(1.1)' }
                        }}
                      >
                        {isLinked ? <Link2 size={20} /> : <Link2Off size={20} />}
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" fontWeight={800} color="text.secondary">HEIGHT</Typography>
                        <TextField
                          fullWidth size="small" placeholder="Auto" value={customHeight}
                          onChange={(e) => handleHeightChange(e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: 'background.paper', fontSize: '0.8rem' } }}
                        />
                      </Box>
                    </Box>

                    <Box>
                      <Slider
                        value={maxWidth} min={200} max={3840} step={100}
                        onChange={(_, val) => setMaxWidth(val as number)}
                        valueLabelDisplay="auto" size="small"
                        sx={{ color: 'primary.main', mb: 0 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>Max {maxWidth}px</Typography>
                        <Button 
                          size="small" variant="text" color="error"
                          onClick={() => { setMaxWidth(1920); setCustomWidth(''); setCustomHeight(''); }} 
                          sx={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'none', minWidth: 0, p: 0 }}
                        >
                          Reset Dimensions
                        </Button>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Row 3: Actions */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ pb: 8 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={isProcessing ? <CircularProgress size={24} color="inherit" /> : <RefreshCw size={24} />}
              onClick={() => handleProcess()}
              disabled={isProcessing}
              sx={{ 
                py: 2, px: 8, fontWeight: 900, borderRadius: 10, fontSize: '1.1rem', 
                boxShadow: '0 8px 30px rgba(63, 81, 181, 0.4)', textTransform: 'none',
                flex: { sm: 1 }, maxWidth: { sm: 400 }
              }}
            >
              {isProcessing ? 'Optimizing...' : 'Optimize Now'}
            </Button>
            {result && (
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                startIcon={<Download />}
                onClick={downloadResult}
                sx={{ 
                  py: 2, px: 8, borderRadius: 10, fontWeight: 700, textTransform: 'none',
                  flex: { sm: 1 }, maxWidth: { sm: 400 }
                }}
              >
                Download Result
              </Button>
            )}
          </Stack>
        </Stack>
      )}
      {error && !file && <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>{error}</Alert>}
      {error && file && <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>{error}</Alert>}
    </Box>
  );
}
