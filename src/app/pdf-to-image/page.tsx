
'use client';

import React from 'react';
import { Container, Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { PDFHybridTool } from '@/components/features/PDFHybridTool';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function PDFToImagePage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="lg">
          <Breadcrumbs 
            separator={<ChevronRight size={16} />} 
            sx={{ mb: 4 }}
          >
            <MuiLink 
              component={Link} 
              href="/" 
              sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', textDecoration: 'none' }}
            >
              <Home size={16} style={{ marginRight: 8 }} />
              Home
            </MuiLink>
            <Typography color="text.primary">PDF Surgical Editor</Typography>
          </Breadcrumbs>

          <PDFHybridTool />
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
