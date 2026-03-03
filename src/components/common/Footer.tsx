'use client';

import React from 'react';
import { Box, Container, Typography, Grid, Divider, Link as MuiLink, Stack, IconButton, useTheme, SxProps, Theme } from '@mui/material';
import { ShieldCheck, Zap, Lock, Twitter, Mail, Command } from 'lucide-react';

export function Footer() {
  const theme = useTheme();
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', pt: 8, pb: 4, mt: 'auto', borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} justifyContent="space-between">
          <Grid size={{ xs: 12, md: 4 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ mr: 1, width: 24, height: 24, bgcolor: 'primary.main', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Command size={16} />
              </Box>
              <Typography variant="h6" fontWeight={900} letterSpacing={-0.5} color="text.primary">
                OptiFile
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300, lineHeight: 1.6 }}>
              Professional-grade file optimization tools running 100% in your browser. 
              Maximum privacy, zero latency, no limits.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" sx={{ bgcolor: 'action.hover' }}><Twitter size={18} /></IconButton>
              <IconButton size="small" sx={{ bgcolor: 'action.hover' }}><Mail size={18} /></IconButton>
            </Stack>
          </Grid>
          
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle2" fontWeight={800} gutterBottom color="text.primary">PLATFORM</Typography>
            <Stack spacing={1}>
              <MuiLink href="/" variant="body2" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>All Tools</MuiLink>
              <MuiLink href="#" variant="body2" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>Privacy Policy</MuiLink>
              <MuiLink href="#" variant="body2" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>Terms of Use</MuiLink>
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle2" fontWeight={800} gutterBottom color="text.primary">SOLUTIONS</Typography>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">Gov Exams</Typography>
              <Typography variant="body2" color="text.secondary">Photography</Typography>
              <Typography variant="body2" color="text.secondary">SaaS Editing</Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ bgcolor: 'action.hover', borderStyle: 'dashed' }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }} color="text.primary">
                  <ShieldCheck size={16} color="#00e676" /> SAFE & SECURE
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  No files are uploaded to our servers. All work is done within your browser session.
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> OptiFile. Built for the modern web.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Zap size={14} style={{ color: theme.palette.brand.fast }} />
              <Typography variant="caption" fontWeight={700}>Fast</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Lock size={14} style={{ color: theme.palette.brand.private }} />
              <Typography variant="caption" fontWeight={700}>Private</Typography>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

const Card = ({ children, sx }: { children: React.ReactNode, sx?: SxProps<Theme> }) => (
  <Box sx={{ ...sx, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>{children}</Box>
);
