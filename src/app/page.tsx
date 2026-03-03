
'use client';

import React from 'react';
import { 
  Container, Box, Typography, Grid, Card, CardContent, 
  Button, Stack, Chip, useTheme, CircularProgress, IconButton
} from '@mui/material';
import { Palette } from '@mui/material/styles';
import { 
  Image as ImageIcon, FileText, Zap, ShieldCheck, Lock, Search
} from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { ImageOptimizer } from '@/components/features/ImageOptimizer';
import { PDFOptimizer } from '@/components/features/PDFOptimizer';
import { PDFMerger } from '@/components/features/PDFMerger';
import { PDFHybridTool } from '@/components/features/PDFHybridTool';
import { motion, AnimatePresence } from 'framer-motion';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

type ToolId = 'image' | 'pdf-convert' | 'pdf-merge' | 'pdf-surgical' | null;

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTool = searchParams.get('tool') as ToolId;
  const theme = useTheme();

  const setActiveTool = (tool: ToolId) => {
    if (tool) {
      router.push(`/?tool=${tool}`, { scroll: false });
    } else {
      router.push('/', { scroll: false });
    }
  };

  const getTools = (palette: Palette) => [
    {
      id: 'image' as ToolId,
      title: 'Image Optimizer',
      desc: 'Compress & Resize to exact KB',
      icon: <ImageIcon size={28} />,
      color: palette.tools.image,
      chip: 'Most Popular'
    },
    {
      id: 'pdf-convert' as ToolId,
      title: 'Images to PDF',
      desc: 'Professional document creation',
      icon: <FileText size={28} />,
      color: palette.tools.pdf,
    },
    {
      id: 'pdf-merge' as ToolId,
      title: 'PDF Merger',
      desc: 'Combine multiple documents',
      icon: <Search size={28} />,
      color: palette.tools.merge,
    },
    {
      id: 'pdf-surgical' as ToolId,
      title: 'Surgical Editor',
      desc: 'Modify PDF contents directly',
      icon: <Zap size={28} />,
      color: palette.tools.surgical,
    }
  ];

  const tools = getTools(theme.palette);

  return (
    <Box component="main" sx={{ flexGrow: 1 }}>
      <AnimatePresence mode="wait">
        {!activeTool ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero Section */}
            <Box 
              style={{ 
                paddingTop: '80px',
                paddingBottom: '80px',
                background: theme.gradients.hero,
              }}
            >
              <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
                <Box>
                  <Chip 
                    label="100% Client-Side Processing" 
                    color="primary" 
                    variant="outlined"
                    icon={<Lock size={14} />}
                    style={{
                      marginBottom: '24px',
                      fontWeight: 800,
                      paddingLeft: '12px',
                      paddingRight: '12px'
                    }}
                  />
                  <Typography 
                    variant="h1" 
                    gutterBottom 
                    sx={{ 
                      fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', 
                      lineHeight: 1.1, 
                      fontWeight: 900,
                      background: theme.gradients.text,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      color: 'transparent', // Fallback for some browsers
                      mb: 2
                    }}
                  >
                    The Private Way to <br /> Handle Your Files
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    style={{ 
                      marginBottom: '48px', 
                      fontSize: '1.4rem', 
                      maxWidth: '800px', 
                      marginLeft: 'auto', 
                      marginRight: 'auto', 
                      opacity: 0.9 
                    }}
                  >
                    No uploads. No server storage. Your files never leave your computer.
                    Full power file optimization, right in your browser.
                  </Typography>
                </Box>

                <Grid container spacing={3} justifyContent="center">
                  {tools.map((tool, idx) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={tool.id} sx={{ display: 'flex' }}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        style={{ display: 'flex', width: '100%' }}
                      >
                        <Card 
                          onClick={() => setActiveTool(tool.id)}
                          sx={{ 
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: `1px solid ${theme.palette.divider}`,
                            '&:hover': {
                              transform: 'translateY(-8px)',
                              borderColor: tool.color,
                              boxShadow: `0 20px 40px -10px ${tool.color}25`,
                              '& .tool-icon': {
                                bgcolor: tool.color,
                                color: '#fff',
                                transform: 'scale(1.1) rotate(5deg)'
                              }
                            }
                          }}
                        >
                          <CardContent sx={{ p: 4, textAlign: 'left', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            {tool.chip && (
                              <Chip label={tool.chip} size="small" color="secondary" sx={{ position: 'absolute', top: 16, right: 16, height: 20, fontSize: '0.65rem', fontWeight: 900, color: 'rgba(0,0,0,0.85)' }} />
                            )}
                            <Box 
                              className="tool-icon"
                              sx={{ 
                                display: 'inline-flex', 
                                p: 1.5, 
                                bgcolor: 'action.hover', 
                                borderRadius: 3, 
                                color: tool.color,
                                mb: 3,
                                transition: 'all 0.3s ease',
                                width: 'fit-content'
                              }}
                            >
                              {tool.icon}
                            </Box>
                            <Typography variant="h6" fontWeight={900} gutterBottom sx={{ color: 'text.primary' }}>{tool.title}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>{tool.desc}</Typography>
                            
                            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', color: tool.color, fontWeight: 800, fontSize: '0.85rem' }}>
                              Launch Tool <ChevronRight size={16} style={{ marginLeft: 4 }} />
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Container>
            </Box>

            {/* Trust Section */}
            <Box 
              style={{ 
                paddingTop: '80px', 
                paddingBottom: '80px',
                backgroundColor: theme.palette.background.subtle
              }}
            >
              <Container maxWidth="lg">
                <Grid container spacing={8} alignItems="center">
                  {[
                    { icon: <ShieldCheck size={32} />, title: "Bank-Level Privacy", desc: "No files are ever uploaded. Logic runs in your RAM using WebWorkers." },
                    { icon: <Zap size={32} />, title: "Instant Processing", desc: "Zero network latency. Files process as fast as your CPU allows." },
                    { icon: <Lock size={32} />, title: "100% Free", desc: "No subscriptions, no watermarks. Professional tools for everyone." }
                  ].map((item, idx) => (
                    <Grid size={{ xs: 12, md: 4 }} key={idx}>
                      <Stack direction="row" spacing={3}>
                        <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
                        <Box>
                          <Typography variant="h6" fontWeight={800} color="text.primary">{item.title}</Typography>
                          <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </Container>
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="tool-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <Box sx={{ position: 'sticky', top: 64, zIndex: 10, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider', py: 1.5 }}>
              <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button 
                    variant="text" 
                    startIcon={<ArrowLeft size={18} />} 
                    onClick={() => setActiveTool(null)}
                    sx={{ fontWeight: 800, color: 'text.secondary' }}
                  >
                    Back to Dashboard
                  </Button>
                  <Stack direction="row" spacing={1}>
                    {tools.map(t => (
                      <IconButton 
                        key={t.id}
                        size="small"
                        onClick={() => setActiveTool(t.id)}
                        sx={{ 
                          color: activeTool === t.id ? t.color : 'text.disabled',
                          bgcolor: activeTool === t.id ? `${t.color}15` : 'transparent',
                          '&:hover': { bgcolor: `${t.color}25` }
                        }}
                      >
                        {t.icon}
                      </IconButton>
                    ))}
                  </Stack>
                </Box>
              </Container>
            </Box>

            {activeTool === 'image' && <ImageOptimizer />}
            {activeTool === 'pdf-convert' && <PDFOptimizer />}
            {activeTool === 'pdf-merge' && <PDFMerger />}
            {activeTool === 'pdf-surgical' && <PDFHybridTool />}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

export default function Home() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Suspense fallback={<CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />}>
        <DashboardContent />
      </Suspense>
      <Footer />
    </Box>
  );
}

const ChevronRight = ({ size, style }: { size: number, style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const ArrowLeft = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);
