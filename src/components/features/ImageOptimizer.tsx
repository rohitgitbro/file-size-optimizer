
'use client';

import React, { useState, useCallback } from 'react';
import { 
  Box, Card, CardContent, Typography, Button, TextField, 
  Slider, Stack, CircularProgress, Alert, Grid, Chip, IconButton, Tooltip, Divider
} from '@mui/material';
import { Download, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import { compressImage, formatFileSize } from '@/lib/image-utils';
import { FileDropzone } from '../common/FileDropzone';
import { ToolLayout } from '../common/ToolLayout';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizedResult {
  file: File;
  blob: Blob;
  url: string;
  originalSize: number;
  optimizedSize: number;
  id: string;
  isProcessing: boolean;
  status: 'idle' | 'processing' | 'done' | 'error';
}

export function ImageOptimizer() {
  const [results, setResults] = useState<OptimizedResult[]>([]);
  const [targetSize, setTargetSize] = useState<number>(100);
  const [unit, setUnit] = useState<'KB' | 'MB'>('KB');
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(f => f.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      setError('Please select valid image files (JPG, PNG, WEBP).');
      return;
    }

    const newResults: OptimizedResult[] = validFiles.map(f => ({
      file: f,
      blob: new Blob(), // Placeholder
      url: '',
      originalSize: f.size,
      optimizedSize: 0,
      id: Math.random().toString(36).substr(2, 9),
      isProcessing: false,
      status: 'idle'
    }));

    setResults(prev => [...newResults, ...prev]);
    setError(null);
  }, []);

  const processImage = async (item: OptimizedResult) => {
    setResults(prev => prev.map(r => r.id === item.id ? { ...r, status: 'processing', isProcessing: true } : r));
    
    const targetKB = unit === 'MB' ? targetSize * 1024 : targetSize;

    try {
      const compressed = await compressImage(item.file, targetKB, { maxWidthOrHeight: maxWidth });
      const url = URL.createObjectURL(compressed);
      
      setResults(prev => prev.map(r => r.id === item.id ? { 
        ...r, 
        blob: compressed, 
        url, 
        optimizedSize: compressed.size, 
        status: 'done',
        isProcessing: false 
      } : r));
    } catch {
      setResults(prev => prev.map(r => r.id === item.id ? { ...r, status: 'error', isProcessing: false } : r));
    }
  };

  const processAll = async () => {
    setIsBatchProcessing(true);
    const idleItems = results.filter(r => r.status === 'idle');
    for (const item of idleItems) {
      await processImage(item);
    }
    setIsBatchProcessing(false);
  };

  const removeResult = (id: string) => {
    setResults(prev => {
      const item = prev.find(r => r.id === id);
      if (item?.url) URL.revokeObjectURL(item.url);
      return prev.filter(r => r.id !== id);
    });
  };

  const downloadResult = (item: OptimizedResult) => {
    if (!item.url) return;
    const link = document.createElement('a');
    link.href = item.url;
    link.download = `optimized_${item.file.name}`;
    link.click();
  };

  return (
    <ToolLayout 
      toolName="Image Optimizer" 
      title="Precise Image Optimizer"
      description="Professional-grade compression and resizing. Process multiple images at once, target exact file sizes, and keep your data 100% private."
    >
      <Grid container spacing={4}>
        {/* Settings Panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom color="primary">
                  OPTIMIZATION SETTINGS
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">TARGET FILE SIZE</Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={targetSize}
                        onChange={(e) => setTargetSize(Number(e.target.value))}
                        sx={{ flex: 1 }}
                      />
                      <Box sx={{ display: 'flex', bgcolor: 'action.hover', p: 0.5, borderRadius: 2 }}>
                        {['KB', 'MB'].map((u) => (
                          <Button
                            key={u}
                            size="small"
                            variant={unit === u ? 'contained' : 'text'}
                            onClick={() => setUnit(u as 'KB' | 'MB')}
                            sx={{ minWidth: 40, py: 0.5, borderRadius: 1.5 }}
                          >
                            {u}
                          </Button>
                        ))}
                      </Box>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">MAX WIDTH/HEIGHT ({maxWidth}px)</Typography>
                    <Slider
                      value={maxWidth}
                      min={200}
                      max={3840}
                      step={100}
                      onChange={(_, v) => setMaxWidth(v as number)}
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Button 
                    fullWidth 
                    variant="contained" 
                    size="large" 
                    startIcon={<RefreshCw size={20} />}
                    onClick={processAll}
                    disabled={isBatchProcessing || results.filter(r => r.status === 'idle').length === 0}
                  >
                    Optimize Queue
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Alert severity="info" variant="outlined" sx={{ borderRadius: 4 }}>
              <Typography variant="caption" fontWeight={600}>
                Your images never leave your browser. All processing is done locally for maximum privacy.
              </Typography>
            </Alert>
          </Stack>
        </Grid>

        {/* Workspace */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            <FileDropzone 
              onFilesSelected={handleFilesSelected}
              accept="image/*"
              multiple
              title="Add images to optimize"
              subtitle="Drag & drop multiple images or click to browse"
            />

            <AnimatePresence>
              {results.length > 0 && (
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={800}>Processing Queue ({results.length})</Typography>
                    <Button size="small" color="error" onClick={() => setResults([])}>Clear All</Button>
                  </Box>
                  
                  {results.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      layout
                    >
                      <Card variant="outlined" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 1.5,
                        borderColor: item.status === 'done' ? 'secondary.main' : 'divider',
                        bgcolor: item.status === 'done' ? 'secondary.main' + '05' : 'background.paper',
                        transition: 'all 0.3s ease'
                      }}>
                        <Box sx={{ width: 60, height: 60, borderRadius: 2, bgcolor: 'action.hover', overflow: 'hidden', flexShrink: 0 }}>
                          <img 
                            src={item.status === 'done' ? item.url : URL.createObjectURL(item.file)} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            alt="preview"
                          />
                        </Box>
                        
                        <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={800} noWrap color="text.primary">{item.file.name}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" color="text.secondary">{formatFileSize(item.originalSize)}</Typography>
                            {item.status === 'done' && (
                              <>
                                <ChevronRight size={12} />
                                <Typography variant="caption" fontWeight={900} color="secondary.main">{formatFileSize(item.optimizedSize)}</Typography>
                                <Chip 
                                  label={`${Math.round((1 - item.optimizedSize / item.originalSize) * 100)}% smaller`} 
                                  size="small" 
                                  color="secondary" 
                                  sx={{ height: 16, fontSize: '0.65rem', fontWeight: 900 }} 
                                />
                              </>
                            )}
                          </Stack>
                        </Box>

                        <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                          {item.status === 'processing' && <CircularProgress size={20} />}
                          {item.status === 'done' && (
                            <>
                              <Tooltip title="Download">
                                <IconButton size="small" color="primary" onClick={() => downloadResult(item)}>
                                  <Download size={18} />
                                </IconButton>
                              </Tooltip>
                              <CheckCircle2 size={18} color="#00e676" />
                            </>
                          )}
                          <IconButton size="small" color="error" onClick={() => removeResult(item.id)} disabled={item.isProcessing}>
                            <Trash2 size={18} />
                          </IconButton>
                        </Stack>
                      </Card>
                    </motion.div>
                  ))}
                </Stack>
              )}
            </AnimatePresence>
          </Stack>
        </Grid>
      </Grid>
      
      {error && (
        <Alert severity="error" sx={{ mt: 3, borderRadius: 4 }}>{error}</Alert>
      )}
    </ToolLayout>
  );
}

const ChevronRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
