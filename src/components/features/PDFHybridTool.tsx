"use client";

import React, { useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Stack,
  CircularProgress,
  LinearProgress,
  IconButton,
  Tooltip,
  Chip,
  Pagination,
} from "@mui/material";
import {
  Save,
  Scissors,
  Layers,
  Trash2,
  Download,
  Zap,
  GripVertical
} from "lucide-react";
import { formatFileSize } from "@/lib/image-utils";
import { pdfToImages, imagesToPDF } from "@/lib/pdf-utils";
import { FileDropzone } from "../common/FileDropzone";
import { ToolLayout } from "../common/ToolLayout";
import { motion, AnimatePresence, Reorder } from "framer-motion";

interface PageItem {
  id: string;
  blob: Blob;
  url: string;
}

export function PDFHybridTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processType, setProcessType] = useState<"scan" | "export" | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleFileSelected = useCallback(async (files: FileList | File[]) => {
    const selectedFile = files[0];
    if (selectedFile?.type !== "application/pdf") return;

    setFile(selectedFile);
    setIsProcessing(true);
    setProcessType("scan");
    setProgress(0);
    setPages([]);

    try {
      const extractedPages = await pdfToImages(selectedFile, {
        scale: 2.0,
        format: "image/jpeg",
        quality: 0.9,
        onProgress: (p) => setProgress(p),
      });

      const pageItems = extractedPages.map((p, idx) => ({
        id: `page-${idx}-${Math.random()}`,
        blob: p.blob,
        url: URL.createObjectURL(p.blob),
      }));

      setPages(pageItems);
    } catch (err) {
      console.error("PDF Processing Error:", err);
    } finally {
      setIsProcessing(false);
      setProcessType(null);
    }
  }, []);

  const removePage = (id: string) => {
    setPages((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const onReorder = (newOrder: PageItem[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const newPages = [...pages];
    newPages.splice(startIndex, itemsPerPage, ...newOrder);
    setPages(newPages);
  };

  const handleDragEnd = (draggedItem: PageItem, targetIndex: number) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const oldIndex = pages.findIndex(p => p.id === draggedItem.id);
    const newIndex = startIndex + targetIndex;
    
    if (oldIndex === newIndex) return;
    
    setPages(prev => {
      const next = [...prev];
      const [removed] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, removed);
      return next;
    });
  };

  const downloadAllPages = () => {
    pages.forEach((page, idx) => {
      const a = document.createElement("a");
      a.href = page.url;
      a.download = `page_${idx + 1}.jpg`;
      a.click();
    });
  };

  const rebuildPDF = async () => {
    if (pages.length === 0) return;
    setIsProcessing(true);
    setProcessType("export");
    try {
      const files = pages.map(
        (p, idx) =>
          new File([p.blob], `page_${idx}.jpg`, { type: "image/jpeg" }),
      );
      const pdfBytes = await imagesToPDF(files, { pageSize: "ORIGINAL" });
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `optimized_${file?.name || "document.pdf"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Rebuild Error:", err);
    } finally {
      setIsProcessing(false);
      setProcessType(null);
    }
  };

  const reset = () => {
    pages.forEach((p) => URL.revokeObjectURL(p.url));
    setFile(null);
    setPages([]);
    setProgress(0);
  };

  return (
    <ToolLayout
      toolName="PDF Surgical Optimizer"
      title="Advanced PDF Surgical Optimizer"
      description="Deconstruct, manage, and optimize PDFs at the page level. Extract pages as crisp images or rebuild a slim, professional document."
    >
      <Grid container spacing={4}>
        {/* Left Control Panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {!file ? (
              <FileDropzone
                onFilesSelected={handleFileSelected}
                accept=".pdf"
                title="Upload PDF for Surgery"
                subtitle="Individual pages will be extracted as assets"
                icon={<Scissors size={32} />}
              />
            ) : (
              <Card
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ p: 2, bgcolor: "secondary.main", color: "white" }}>
                  <Typography variant="subtitle2" fontWeight={900}>
                    OPERATING ROOM
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2.5}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "action.hover",
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={900}
                        noWrap
                        sx={{ mb: 0.5 }}
                      >
                        {file.name}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={`${pages.length} Pages`}
                          size="small"
                          sx={{ fontWeight: 800, height: 20, bgcolor: "white" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.size)}
                        </Typography>
                      </Stack>
                    </Box>

                    <Stack spacing={1.5}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        size="large"
                        startIcon={<Save size={18} />}
                        onClick={rebuildPDF}
                        disabled={isProcessing || pages.length === 0}
                        sx={{ py: 1.5, borderRadius: 3, fontWeight: 900 }}
                      >
                        Reconstruct PDF
                      </Button>

                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Download size={18} />}
                        onClick={downloadAllPages}
                        disabled={isProcessing || pages.length === 0}
                        sx={{ borderRadius: 3, fontWeight: 800 }}
                      >
                        Extract All as Images
                      </Button>

                      <Button
                        fullWidth
                        color="error"
                        onClick={reset}
                        disabled={isProcessing}
                        sx={{ fontWeight: 700 }}
                      >
                        Discard & Restart
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Card
              sx={{
                borderRadius: 4,
                bgcolor: "background.subtle",
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle2"
                  fontWeight={900}
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Zap size={16} color="#ed6c02" /> HOW IT WORKS
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        bgcolor: "secondary.main",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                    >
                      1
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      <b>Deconstruct:</b> PDF pages are converted into high-res
                      images to flatten formatting and reduce overhead.
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        bgcolor: "secondary.main",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                    >
                      2
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      <b>Edit:</b> Rearrange or delete specific pages without
                      needing expensive PDF software.
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        bgcolor: "secondary.main",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                    >
                      3
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      <b>Rebuild:</b> Reassemble your document into a fresh,
                      perfectly streamlined PDF.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Workspace Display */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            sx={{
              minHeight: 500,
              bgcolor: "background.paper",
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    zIndex: 10,
                    backgroundColor: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <CircularProgress
                    size={60}
                    thickness={5}
                    color="secondary"
                    sx={{ mb: 4 }}
                  />
                  <Typography variant="h5" fontWeight={900}>
                    {processType === "scan"
                      ? "Slicing Document..."
                      : "Rebuilding PDF..."}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Performing browser-side surgery
                  </Typography>
                  <Box sx={{ width: "80%", maxWidth: 300, mt: 4 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      color="secondary"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ mt: 1, display: "block", fontWeight: 800 }}
                    >
                      {progress}% COMPLETE
                    </Typography>
                  </Box>
                </motion.div>
              ) : pages.length > 0 ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ padding: 24 }}
                >
                  <Box
                    sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                      gap: '20px',
                      padding: '12px 6px 32px 6px'
                    }}
                  >
                    {pages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((page, idx) => {
                      const absoluteIdx = (currentPage - 1) * itemsPerPage + idx;
                      return (
                        <motion.div
                          key={page.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          whileHover={{ y: -5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        >
                          <Card
                            sx={{
                              height: "100%",
                              borderRadius: '12px',
                              overflow: "hidden",
                              border: "1px solid",
                              borderColor: "divider",
                              position: "relative",
                              bgcolor: 'background.paper',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                              transition: 'all 0.2s ease',
                              "&:hover": { 
                                borderColor: 'primary.main',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                "& .page-actions": { opacity: 1 } 
                              },
                            }}
                          >
                            <Box
                              sx={{
                                position: "relative",
                                height: 220,
                                bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 1.5
                              }}
                            >
                              <img
                                src={page.url}
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  objectFit: "contain",
                                  pointerEvents: "none",
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                  backgroundColor: '#fff',
                                  padding: '2px'
                                }}
                                alt={`page ${absoluteIdx + 1}`}
                              />

                              {/* Page Label */}
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  left: 8,
                                  bgcolor: "secondary.main",
                                  color: "white",
                                  px: 1,
                                  minWidth: 20,
                                  height: 20,
                                  borderRadius: '6px',
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: '11px',
                                  fontWeight: 900,
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                  zIndex: 3
                                }}
                              >
                                {absoluteIdx + 1}
                              </Box>

                              {/* Drag Handle & Selection Overlay */}
                              <Box 
                                sx={{ 
                                  position: 'absolute', 
                                  inset: 0, 
                                  cursor: 'grab', 
                                  '&:active': { cursor: 'grabbing' },
                                  zIndex: 1
                                }}
                                draggable
                                onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                                  e.dataTransfer.setData('text/plain', absoluteIdx.toString());
                                  if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.style.opacity = '0.4';
                                  }
                                }}
                                onDragEnd={(e: React.DragEvent<HTMLDivElement>) => {
                                  if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.style.opacity = '1';
                                  }
                                }}
                                onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
                                onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                                  e.preventDefault();
                                  const fromIdxStr = e.dataTransfer.getData('text/plain');
                                  const fromIdx = parseInt(fromIdxStr);
                                  if (!isNaN(fromIdx) && fromIdx !== absoluteIdx) {
                                    handleDragEnd(pages[fromIdx], idx);
                                  }
                                }}
                              >
                                <Box sx={{ position: 'absolute', top: 8, right: 8, color: 'text.disabled', zIndex: 3 }}>
                                  <GripVertical size={16} />
                                </Box>
                              </Box>

                              {/* Hover Actions */}
                              <Box
                                className="page-actions"
                                sx={{
                                  position: "absolute",
                                  bottom: 8,
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  bgcolor: "background.paper",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 0.5,
                                  p: 0.5,
                                  borderRadius: '8px',
                                  opacity: 0,
                                  transition: "all 0.2s ease",
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                  zIndex: 5
                                }}
                              >
                                <Tooltip title="Remove Page">
                                  <IconButton
                                    size="small"
                                    onClick={() => removePage(page.id)}
                                    sx={{ 
                                      color: "error.main",
                                      p: 0.5
                                    }}
                                  >
                                    <Trash2 size={16} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </Box>

                  {pages.length > itemsPerPage && (
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                      <Pagination 
                        count={Math.ceil(pages.length / itemsPerPage)} 
                        page={currentPage} 
                        onChange={(_, v) => setCurrentPage(v)}
                        color="secondary"
                        sx={{
                          "& .MuiPaginationItem-root": { fontWeight: 900, borderRadius: 2 }
                        }}
                      />
                    </Box>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    height: 500,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "32px",
                  }}
                >
                  <Box
                    sx={{
                      p: 4,
                      bgcolor: "background.subtle",
                      borderRadius: "40px",
                      color: "text.disabled",
                      mb: 3,
                    }}
                  >
                    <Layers size={64} strokeWidth={1} />
                  </Box>
                  <Typography
                    variant="h6"
                    fontWeight={900}
                    color="text.secondary"
                    gutterBottom
                  >
                    Empty Canvas
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.disabled"
                    sx={{ maxWidth: 300 }}
                  >
                    Upload a document to slice it into manageable pages. You can
                    rearrange, remove, or extract pages with surgical precision.
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Grid>
      </Grid>
    </ToolLayout>
  );
}
