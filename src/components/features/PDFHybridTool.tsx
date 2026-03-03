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
} from "@mui/material";
import {
  Save,
  Scissors,
  Layers,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  Zap,
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

  const movePage = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= pages.length) return;

    setPages((prev) => {
      const next = [...prev];
      [next[index], next[newIdx]] = [next[newIdx], next[index]];
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
                  <Typography
                    variant="h6"
                    fontWeight={900}
                    sx={{
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Layers size={20} color="#9c27b0" /> Document Canvas
                  </Typography>
                  <Grid container spacing={2}>
                    {pages.map((page, idx) => (
                      <Grid size={{ xs: 6, sm: 4, lg: 3 }} key={page.id}>
                        <Card
                          sx={{
                            height: "100%",
                            borderRadius: 3,
                            overflow: "hidden",
                            border: "1px solid",
                            borderColor: "divider",
                            "&:hover .page-actions": { opacity: 1 },
                          }}
                        >
                          <Box
                            sx={{
                              position: "relative",
                              height: 200,
                              bgcolor: "background.subtle",
                            }}
                          >
                            <img
                              src={page.url}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                              alt={`page ${idx + 1}`}
                            />

                            {/* Page Label */}
                            <Box
                              sx={{
                                position: "absolute",
                                top: 8,
                                left: 8,
                                bgcolor: "secondary.main",
                                color: "white",
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                fontWeight: 900,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                              }}
                            >
                              {idx + 1}
                            </Box>

                            {/* Hover Actions */}
                            <Box
                              className="page-actions"
                              sx={{
                                position: "absolute",
                                inset: 0,
                                bgcolor: "rgba(26, 35, 126, 0.4)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                                opacity: 0,
                                transition: "opacity 0.2s",
                                backdropFilter: "blur(2px)",
                              }}
                            >
                              <Tooltip title="Delete Page">
                                <IconButton
                                  size="small"
                                  onClick={() => removePage(page.id)}
                                  sx={{
                                    bgcolor: "white",
                                    color: "error.main",
                                    "&:hover": {
                                      bgcolor: "error.main",
                                      color: "white",
                                    },
                                  }}
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Move Up">
                                <IconButton
                                  size="small"
                                  disabled={idx === 0}
                                  onClick={() => movePage(idx, "up")}
                                  sx={{
                                    bgcolor: "white",
                                    color: "primary.main",
                                    "&:hover": {
                                      bgcolor: "primary.main",
                                      color: "white",
                                    },
                                  }}
                                >
                                  <ArrowUp size={16} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Move Down">
                                <IconButton
                                  size="small"
                                  disabled={idx === pages.length - 1}
                                  onClick={() => movePage(idx, "down")}
                                  sx={{
                                    bgcolor: "white",
                                    color: "primary.main",
                                    "&:hover": {
                                      bgcolor: "primary.main",
                                      color: "white",
                                    },
                                  }}
                                >
                                  <ArrowDown size={16} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
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
