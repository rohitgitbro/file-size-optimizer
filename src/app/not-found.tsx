
'use client';

import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', py: 10 }}>
        <Container maxWidth="sm">
          <Box textAlign="center">
            <Typography variant="h1" fontWeight={900} color="primary" sx={{ fontSize: '8rem', lineHeight: 1 }}>
              404
            </Typography>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Page Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              The page you are looking for might have been moved or doesn't exist.
              Let's get you back to the home page or choose a tool above.
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              component={Link} 
              href="/"
              startIcon={<Home size={20} />}
            >
              Go to Home
            </Button>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
