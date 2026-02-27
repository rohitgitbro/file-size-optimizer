import { Container, Box, Typography, Grid, Card, CardContent, Button, Stack, Chip, Divider } from '@mui/material';
import { Image as ImageIcon, FileText, Zap, ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { ImageOptimizer } from '@/components/features/ImageOptimizer';
import { PDFOptimizer } from '@/components/features/PDFOptimizer';
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
                  Precise File Tools for <Box component="span" sx={{ color: 'primary.main' }}>Gov Forms</Box>
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.2rem', maxWidth: 600 }}>
                  Resize images and compress PDFs to exact KB requirements for SSC, UPSC, IBPS, and other government applications. No upload to server, completely private.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" size="large" endIcon={<ArrowRight />} href="#tools">
                    Start Now
                  </Button>
                  <Button variant="outlined" size="large">
                    Learn Privacy
                  </Button>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box sx={{ p: 4, bgcolor: 'primary.main', borderRadius: 4, color: 'white', position: 'relative', overflow: 'hidden' }}>
                  <Typography variant="h6" gutterBottom fontWeight={700}>Why GovFormOptimizer?</Typography>
                  <Stack spacing={2} sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Zap size={24} />
                      <Typography variant="body2">Instant client-side processing (&lt;2s)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <ShieldCheck size={24} />
                      <Typography variant="body2">Preset targets for SSC, UPSC, PSC</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Lock size={24} />
                      <Typography variant="body2">Military-grade privacy (No Server Upload)</Typography>
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
                Choose Your Tool
              </Typography>
              <Typography variant="body1" align="center" color="text.secondary">
                Select the tool you need for your application
              </Typography>
            </Box>

            <Grid container spacing={4} sx={{ mb: 10 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ mb: 2, display: 'inline-flex', p: 1.5, bgcolor: 'primary.light', borderRadius: 2, color: 'white' }}>
                      <ImageIcon size={32} />
                    </Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>Image Optimizer</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Compress and resize photos, signatures, and certificates to exact KB limits.
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                      <Chip label="SSC Photo" size="small" />
                      <Chip label="Signatures" size="small" />
                      <Chip label="Custom KB" size="small" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ mb: 2, display: 'inline-flex', p: 1.5, bgcolor: 'secondary.main', borderRadius: 2, color: 'white' }}>
                      <FileText size={32} />
                    </Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>PDF Compressor</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Reduce PDF size for document uploads while keeping text crystal clear.
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                      <Chip label="Standard" size="small" />
                      <Chip label="Multi-page" size="small" />
                      <Chip label="Fast" size="small" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Interactive Tools */}
            <Box sx={{ py: 4 }}>
              <Typography variant="h4" align="center" fontWeight={800} sx={{ mb: 6 }}>
                Image Optimization Tool
              </Typography>
              <ImageOptimizer />
              
              <Divider sx={{ my: 10 }} />
              
              <Typography variant="h4" align="center" fontWeight={800} sx={{ mb: 6 }}>
                PDF Compression Tool
              </Typography>
              <PDFOptimizer />
            </Box>
          </Container>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}

