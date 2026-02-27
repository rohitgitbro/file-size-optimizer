import { Container, Box, Typography, Grid, Card, CardContent, Button, Stack, Chip, Divider } from '@mui/material';
import { Image as ImageIcon, FileText, Zap, ShieldCheck, Lock, ArrowRight, Download } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { ImageOptimizer } from '@/components/features/ImageOptimizer';
import { PDFOptimizer } from '@/components/features/PDFOptimizer';
import { PDFMerger } from '@/components/features/PDFMerger';
import { PDFHybridTool } from '@/components/features/PDFHybridTool';
import Link from 'next/link';

export default function Home() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Hero Section */}
        <Box sx={{ bgcolor: 'background.paper', pt: 10, pb: 8, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 7 }}>
                <Chip 
                  label="100% Privacy - All processing happens in your browser" 
                  color="secondary" 
                  size="small" 
                  sx={{ mb: 2, fontWeight: 700 }} 
                />
                <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.1 }}>
                  Precise File Tools for <Box component="span" sx={{ color: 'primary.main' }}>Modern Work</Box>
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.2rem', maxWidth: 600 }}>
                  Optimize images, merge PDFs, and convert formats with ease. No upload to server, completely private and secure.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" size="large" endIcon={<ArrowRight />} href="#tools">
                    See Tools
                  </Button>
                  <Button variant="outlined" size="large">
                    Privacy First
                  </Button>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box sx={{ p: 4, bgcolor: 'primary.main', borderRadius: 4, color: 'white', position: 'relative', overflow: 'hidden' }}>
                  <Typography variant="h6" gutterBottom fontWeight={700}>Security & Speed</Typography>
                  <Stack spacing={2} sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Zap size={24} />
                      <Typography variant="body2">Instant browser processing (&lt;1s)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <ShieldCheck size={24} />
                      <Typography variant="body2">Zero file uploads to any server</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Lock size={24} />
                      <Typography variant="body2">Client-side only architecture</Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }}>
                    <FileText size={150} />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Tools Section */}
        <Box id="tools" sx={{ py: 10 }}>
          <Container maxWidth="lg">
            <Box sx={{ mb: 8 }}>
              <Typography variant="h3" align="center" fontWeight={800} gutterBottom>
                Powerful Browser Tools
              </Typography>
              <Typography variant="body1" align="center" color="text.secondary">
                Secure, fast, and 100% private file manipulation
              </Typography>
            </Box>

            <Grid container spacing={4} sx={{ mb: 10 }}>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2, display: 'inline-flex', p: 1, bgcolor: 'primary.light', borderRadius: 2, color: 'white' }}>
                      <ImageIcon size={24} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Image Optimizer</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Compress and resize images to exact KB limits.
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      <Chip label="Resize" size="small" variant="outlined" />
                      <Chip label="KB Limit" size="small" variant="outlined" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2, display: 'inline-flex', p: 1, bgcolor: 'secondary.main', borderRadius: 2, color: 'white' }}>
                      <FileText size={24} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Images to PDF</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                       Convert multiple JPG/PNG into a single PDF.
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                       <Chip label="Convert" size="small" variant="outlined" />
                       <Chip label="Combine" size="small" variant="outlined" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2, display: 'inline-flex', p: 1, bgcolor: '#4caf50', borderRadius: 2, color: 'white' }}>
                      <FileText size={24} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>PDF Merger</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                       Combine multiple PDFs with custom ordering.
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                       <Chip label="Merge" size="small" variant="outlined" />
                       <Chip label="Reorder" size="small" variant="outlined" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }, cursor: 'pointer' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2, display: 'inline-flex', p: 1, bgcolor: '#ff9800', borderRadius: 2, color: 'white' }}>
                      <Download size={24} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>PDF Surgical Editor</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                       Deconstruct PDF into images, optimize, and rebuild.
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                       <Chip label="Hybrid" size="small" color="primary" />
                       <Chip label="Rebuild PDF" size="small" variant="outlined" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

            </Grid>

            {/* Interactive Tools */}
            <Box sx={{ py: 4 }}>
              <Typography variant="h4" align="center" fontWeight={800} sx={{ mb: 6 }}>
                Image Optimization
              </Typography>
              <ImageOptimizer />
              
              <Divider sx={{ my: 10 }} />
              
              <Typography variant="h4" align="center" fontWeight={800} sx={{ mb: 6 }}>
                Images to PDF
              </Typography>
              <PDFOptimizer />

              <Divider sx={{ my: 10 }} />
              
              <Typography variant="h4" align="center" fontWeight={800} sx={{ mb: 6 }}>
                PDF Merger
              </Typography>
              <PDFMerger />

              <Divider sx={{ my: 10 }} />
              
              <Typography variant="h4" align="center" fontWeight={800} sx={{ mb: 6 }}>
                PDF Surgical Editor
              </Typography>
              <PDFHybridTool />
            </Box>

          </Container>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
