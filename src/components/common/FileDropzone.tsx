
'use client';

import React, { useState } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { Upload, File as FileIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileDropzoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
  maxSize?: number; // In bytes
  icon?: React.ReactNode;
}

export function FileDropzone({
  onFilesSelected,
  accept = '*',
  multiple = false,
  title = 'Drag & Drop files here',
  subtitle = 'or click to browse from your device',
  icon
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(e.target.files);
    }
  };

  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      sx={{
        position: 'relative',
        cursor: 'pointer',
        borderRadius: 4,
        overflow: 'hidden',
        minHeight: 240,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        bgcolor: isDragging ? 'action.selected' : 'background.paper',
        border: '2px dashed',
        borderColor: isDragging ? 'primary.main' : 'divider',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
        }
      }}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleInputChange}
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={isDragging ? 'dragging' : 'idle'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center', px: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '20px',
                bgcolor: isDragging ? 'primary.main' : 'primary.light',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                boxShadow: isDragging ? '0 8px 16px rgba(26, 35, 126, 0.3)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {icon || (isDragging ? <Upload size={32} /> : <FileIcon size={32} />)}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="text.primary">
                {isDragging ? 'Drop it here!' : title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            </Box>
          </Stack>
        </motion.div>
      </AnimatePresence>

      {/* Decorative Glow */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26, 35, 126, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />
    </Box>
  );
}
