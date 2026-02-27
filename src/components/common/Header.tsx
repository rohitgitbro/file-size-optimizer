'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, useTheme, Box, Container } from '@mui/material';
import { Brightness4, Brightness7, Camera } from '@mui/icons-material';
import { FileText } from 'lucide-react';
import { useColorMode } from '@/context/ThemeContext';
import Link from 'next/link';

export function Header() {
  const theme = useTheme();
  const { toggleColorMode, mode } = useColorMode();

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', color: 'text.primary' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Box display="flex" alignItems="center" component={Link} href="/" sx={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
            <Camera sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              GovForm<Box component="span" sx={{ color: 'primary.main' }}>Tools</Box>
            </Typography>
          </Box>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
            <Button component={Link} href="/image-optimizer" color="inherit">Images</Button>
            <Button component={Link} href="/pdf-converter" color="inherit">Images to PDF</Button>
            <Button component={Link} href="/pdf-merger" color="inherit">PDF Merger</Button>
            <Button component={Link} href="/" color="inherit">Tools</Button>
          </Box>

          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
