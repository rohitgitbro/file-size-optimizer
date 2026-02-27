
'use client';

import React from 'react';
import { Box, Container, Typography, Grid, Divider, Link as MuiLink } from '@mui/material';
import { ShieldCheck, Zap, Lock } from 'lucide-react';

export function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', pt: 6, pb: 4, mt: 'auto', borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid size={{ xs: 12, md: 4 }}>
       <Typography variant="h6" fontWeight={800} gutterBottom>
              GovFormOptimizer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Precision tools for Indian government exam aspirants. 100% private, client-side file processing.
            </Typography>
            <Box sx={{ display: 'flex', mt: 2, gap: 2 }}>
              <ShieldCheck size={20} />
              <Zap size={20} />
              <Lock size={20} />
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Tools</Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              <li><MuiLink href="/image-optimizer" variant="body2" color="text.secondary">Image Optimizer</MuiLink></li>
              <li><MuiLink href="/pdf-optimizer" variant="body2" color="text.secondary">PDF Optimizer</MuiLink></li>
              <li><MuiLink href="/converter" variant="body2" color="text.secondary">PDF Converter</MuiLink></li>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
       <Typography variant="subtitle2" fontWeight={700} gutterBottom>Presets</Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              <li><Typography variant="body2" color="text.secondary">SSC Photo</Typography></li>
              <li><Typography variant="body2" color="text.secondary">UPSC Document</Typography></li>
              <li><Typography variant="body2" color="text.secondary">IBPS Thumb</Typography></li>
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span> GovFormOptimizer. Made for Bharat.
        </Typography>
      </Container>
    </Box>
  );
}
