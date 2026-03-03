
'use client';

import React, { useState, useCallback } from 'react';
import { 
  Box, Card, CardContent, Typography, Button, TextField, 
  Slider, Stack, CircularProgress, Alert, Grid, Chip, IconButton, Tooltip, Divider,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { 
  Download, RefreshCw, Trash2,  
  Minimize, Lock, Unlock,
  Settings2, ChevronRight, AlertCircle, Sparkles, GripVertical
} from 'lucide-react';
import { compressImage, formatFileSize } from '@/lib/image-utils';
import { FileDropzone } from '../common/FileDropzone';
import { ToolLayout } from '../common/ToolLayout';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

interface OptimizedResult {
  file: File;
  blob: Blob;
  url: string;
  originalSize: number;
  optimizedSize: number;
  id: string;
  isProcessing: boolean;
  status: 'idle' | 'processing' | 'done' | 'error';
  dimensions?: { width: number; height: number };
}

export function ImageOptimizer() {
  const [results, setResults] = useState<OptimizedResult[]>([]);
  const [targetSize, setTargetSize] = useState<number>(100);
  const [unit, setUnit] = useState<'KB' | 'MB'>('KB');
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [explicitWidth, setExplicitWidth] = useState<string>('');
  const [explicitHeight, setExplicitHeight] = useState<string>('');
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [outputFormat, setOutputFormat] = useState<string>('original');
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Aspect Ratio Lock Logic
  const handleWidthChange = (val: string) => {
    setExplicitWidth(val);
    if (lockAspectRatio && results.length > 0 && val) {
      const firstItem = results[0];
      if (firstItem.dimensions) {
        const ratio = firstItem.dimensions.height / firstItem.dimensions.width;
        setExplicitHeight(Math.round(parseInt(val) * ratio).toString());
      }
    }
  };

  const handleHeightChange = (val: string) => {
    setExplicitHeight(val);
    if (lockAspectRatio && results.length > 0 && val) {
      const firstItem = results[0];
      if (firstItem.dimensions) {
        const ratio = firstItem.dimensions.width / firstItem.dimensions.height;
        setExplicitWidth(Math.round(parseInt(val) * ratio).toString());
      }
    }
  };

  const handleFilesSelected = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(f => f.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      setError('Please select valid image files.');
      return;
    }

    const newResults: OptimizedResult[] = validFiles.map(f => {
      const id = Math.random().toString(36).substr(2, 9);
      
      // Try to get dimensions
      const img = new Image();
      img.src = URL.createObjectURL(f);
      img.onload = () => {
        setResults(prev => prev.map(r => r.id === id ? { ...r, dimensions: { width: img.width, height: img.height } } : r));
        URL.revokeObjectURL(img.src);
      };

      return {
        file: f,
        blob: new Blob(),
        url: '',
        originalSize: f.size,
        optimizedSize: 0,
        id,
        isProcessing: false,
        status: 'idle'
      };
    });

    setResults(prev => [...newResults, ...prev]);
    setError(null);
  }, []);

  const processImage = async (item: OptimizedResult) => {
    setResults(prev => prev.map(r => r.id === item.id ? { ...r, status: 'processing', isProcessing: true } : r));
    
    const targetKB = unit === 'MB' ? targetSize * 1024 : targetSize;
    const format = outputFormat === 'original' ? item.file.type : `image/${outputFormat}`;

    try {
      const compressed = await compressImage(item.file, targetKB, { 
        maxWidthOrHeight: maxWidth,
        width: explicitWidth ? parseInt(explicitWidth) : undefined,
        height: explicitHeight ? parseInt(explicitHeight) : undefined,
        fileType: format
      });
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
    const ext = outputFormat === 'original' ? item.file.name.split('.').pop() : outputFormat;
    link.download = `optimized_${item.file.name.split('.')[0]}.${ext}`;
    link.click();
  };

  return (
    <ToolLayout 
      toolName="Image Optimizer" 
      title="Pro Content Optimizer"
      description="Surgical precision for your visual assets. Compress, resize, and convert formats with professional-grade local processing."
    >
      <Grid container spacing={4}>
        {/* Advanced Settings Column */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <Card sx={{ 
              borderRadius: 4, 
              border: '1px solid', 
              borderColor: 'divider',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Settings2 size={20} />
                <Typography variant="subtitle1" fontWeight={900}>Control Center</Typography>
              </Box>
              
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={4}>
                  {/* Size Target */}
                  <Box>
                    <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ letterSpacing: 1.5 }}>TARGET SIZE</Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={targetSize}
                        onChange={(e) => setTargetSize(Number(e.target.value))}
                        sx={{ flex: 1 }}
                        InputProps={{ sx: { fontWeight: 800, borderRadius: 2 } }}
                      />
                      <ToggleButtonGroup
                        value={unit}
                        exclusive
                        onChange={(_, v) => v && setUnit(v)}
                        size="small"
                        sx={{ height: 40 }}
                      >
                        <ToggleButton value="KB" sx={{ px: 2, fontWeight: 800 }}>KB</ToggleButton>
                        <ToggleButton value="MB" sx={{ px: 2, fontWeight: 800 }}>MB</ToggleButton>
                      </ToggleButtonGroup>
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Manual Scaling */}
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ letterSpacing: 1.5 }}>SURGICAL RESIZE</Typography>
                      <Tooltip title={lockAspectRatio ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}>
                        <IconButton size="small" onClick={() => setLockAspectRatio(!lockAspectRatio)} color={lockAspectRatio ? "primary" : "default"}>
                          {lockAspectRatio ? <Lock size={16} /> : <Unlock size={16} />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    
                    <Grid container spacing={2} sx={{ mt: 1.5 }}>
                      <Grid size={{ xs: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Width (px)"
                          placeholder="Auto"
                          value={explicitWidth}
                          onChange={(e) => handleWidthChange(e.target.value)}
                          InputProps={{ sx: { borderRadius: 2, fontWeight: 700 } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Height (px)"
                          placeholder="Auto"
                          value={explicitHeight}
                          onChange={(e) => handleHeightChange(e.target.value)}
                          InputProps={{ sx: { borderRadius: 2, fontWeight: 700 } }}
                        />
                      </Grid>
                    </Grid>
                    
                    {!explicitWidth && !explicitHeight && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="caption" color="text.secondary">Relative Scale: {maxWidth}px</Typography>
                        <Slider
                          value={maxWidth}
                          min={200}
                          max={4000}
                          step={100}
                          onChange={(_, v) => setMaxWidth(v as number)}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    )}
                  </Box>

                  <Divider />

                  {/* Format Conversion */}
                  <Box>
                    <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ letterSpacing: 1.5 }}>OUTPUT FORMAT</Typography>
                    <Box sx={{ mt: 1.5 }}>
                      <ToggleButtonGroup
                        fullWidth
                        value={outputFormat}
                        exclusive
                        onChange={(_, v) => v && setOutputFormat(v)}
                        size="small"
                      >
                        <ToggleButton value="original" sx={{ fontWeight: 800 }}>Default</ToggleButton>
                        <ToggleButton value="webp" sx={{ fontWeight: 800 }}>WebP</ToggleButton>
                        <ToggleButton value="jpeg" sx={{ fontWeight: 800 }}>JPG</ToggleButton>
                        <ToggleButton value="png" sx={{ fontWeight: 800 }}>PNG</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  </Box>

                  <Button 
                    fullWidth 
                    variant="contained" 
                    size="large" 
                    startIcon={isBatchProcessing ? <CircularProgress size={20} color="inherit" /> : <Sparkles size={18} />}
                    onClick={processAll}
                    disabled={isBatchProcessing || results.filter(r => r.status === 'idle').length === 0}
                    sx={{ 
                      py: 2, 
                      borderRadius: 3, 
                      boxShadow: '0 10px 20px rgba(26, 35, 126, 0.2)',
                      fontSize: '1rem',
                      fontWeight: 900
                    }}
                  >
                    {isBatchProcessing ? "Processing..." : "Start Batch Render"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'background.subtle', border: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={2}>
                <AlertCircle size={20} color="#1a237e" />
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                  Our local-only engine avoids server uploads, giving you instant results and 100% data sovereignity.
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Grid>

        {/* Workspace Column */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            <FileDropzone 
              onFilesSelected={handleFilesSelected}
              accept="image/*"
              multiple
              title="Import High-Res Assets"
              subtitle="Drag & drop JPG, PNG or WebP files"
            />

            <AnimatePresence>
              {results.length > 0 && (
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
                    <Typography variant="h6" fontWeight={900}>The Bench <Chip label={results.length} size="small" color="primary" sx={{ fontWeight: 900, height: 20 }} /></Typography>
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<Trash2 size={16} />} 
                      onClick={() => setResults([])}
                      sx={{ fontWeight: 800 }}
                    >
                      Clear Workspace
                    </Button>
                  </Box>
                  
                  <Reorder.Group
                    axis="y"
                    values={results}
                    onReorder={setResults}
                    style={{ listStyle: 'none', padding: 0 }}
                  >
                    {results.map((item) => (
                      <Reorder.Item
                        key={item.id}
                        value={item}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            p: 2, 
                            mb: 2,
                            borderRadius: 4,
                            display: 'flex', 
                            alignItems: 'center',
                            borderColor: item.status === 'done' ? 'secondary.main' : 'divider',
                            transition: 'all 0.3s ease',
                            '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }
                          }}
                        >
                          {/* Drag Handle */}
                          <Box sx={{ color: 'text.disabled', mr: 2, cursor: 'grab', '&:active': { cursor: 'grabbing' } }}>
                            <GripVertical size={20} />
                          </Box>

                          {/* Thumbnail */}
                          <Box sx={{ width: 60, height: 60, borderRadius: 2, bgcolor: 'action.hover', overflow: 'hidden', flexShrink: 0, border: '1px solid', borderColor: 'divider' }}>
                            <img 
                              src={item.status === 'done' ? item.url : (item.file ? URL.createObjectURL(item.file) : '')} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              alt="asset"
                            />
                          </Box>
                          
                          {/* Meta */}
                          <Box sx={{ ml: 2.5, flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={900} sx={{ mb: 0.5 }} noWrap>{item.file.name}</Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Minimize size={14} color="#666" />
                                <Typography variant="caption" fontWeight={700} color="text.secondary">{formatFileSize(item.originalSize)}</Typography>
                              </Stack>
                              {item.status === 'done' && (
                                <>
                                  <ChevronRight size={14} color="#ccc" />
                                  <Typography variant="caption" fontWeight={900} color="secondary.main">{formatFileSize(item.optimizedSize)}</Typography>
                                  <Typography variant="caption" sx={{ bgcolor: 'secondary.main', color: 'white', px: 1, borderRadius: 1, fontWeight: 900, fontSize: '0.6rem' }}>
                                    -{Math.round((1 - item.optimizedSize / item.originalSize) * 100)}%
                                  </Typography>
                                </>
                              )}
                            </Stack>
                          </Box>

                          {/* Actions */}
                          <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                            {item.status === 'processing' && <CircularProgress size={24} />}
                            {item.status === 'done' && (
                              <Button 
                                variant="contained" 
                                color="secondary" 
                                size="small" 
                                onClick={() => downloadResult(item)}
                                startIcon={<Download size={14} />}
                                sx={{ borderRadius: 2, fontWeight: 900 }}
                              >
                                Get
                              </Button>
                            )}
                            {item.status === 'idle' && (
                              <IconButton size="small" onClick={() => processImage(item)} color="primary">
                                <RefreshCw size={18} />
                              </IconButton>
                            )}
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => removeResult(item.id)} 
                              disabled={item.isProcessing}
                              sx={{ ml: 1 }}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Stack>
                        </Card>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </Stack>
              )}
            </AnimatePresence>
          </Stack>
        </Grid>
      </Grid>
      
      {error && (
        <Alert severity="error" icon={<AlertCircle size={20} />} sx={{ mt: 3, borderRadius: 4, fontWeight: 700 }}>{error}</Alert>
      )}
    </ToolLayout>
  );
}

