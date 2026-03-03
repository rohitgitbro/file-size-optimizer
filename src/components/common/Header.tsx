
'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, useTheme, Box, Container, Stack } from '@mui/material';
import { useColorMode } from '@/context/ThemeContext';
import Link from 'next/link';
import { Moon, Sun, Command, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function Header() {
  const theme = useTheme();
  const { toggleColorMode, mode } = useColorMode();

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`, 
        bgcolor: 'background.paper', 
        color: 'text.primary',
        backdropFilter: 'blur(8px)',
        background: theme.palette.background.glass
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 64 }}>
          {/* Logo */}
          <Box 
            display="flex" 
            alignItems="center" 
            component={Link} 
            href="/" 
            sx={{ 
              textDecoration: 'none', 
              color: 'inherit', 
              flexGrow: 1,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.02)' }
            }}
          >
            <Box 
              sx={{ 
                mr: 1.5, 
                width: 32, 
                height: 32, 
                bgcolor: 'primary.main', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(26, 35, 126, 0.2)'
              }}
            >
              <Command size={20} strokeWidth={2.5} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -1, fontSize: '1.25rem' }}>
              Opti<Box component="span" sx={{ color: 'primary.main' }}>File</Box>
            </Typography>
          </Box>
          
          {/* Desktop Nav */}
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, mr: 3 }}>
            <Button component={Link} href="/" color="inherit" sx={{ fontWeight: 700, opacity: 0.7, '&:hover': { opacity: 1 } }}>Dashboard</Button>
            <Button 
              color="primary" 
              variant="outlined" 
              startIcon={<ShieldCheck size={16} />} 
              sx={{ 
                fontWeight: 800, 
                px: 2,
                borderRadius: '10px',
                borderWidth: '2px',
                '&:hover': { borderWidth: '2px' },
                color: 'primary.main',
                borderColor: 'primary.main'
              }}
            >
              Privacy First
            </Button>
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: '1px', height: 20, bgcolor: 'divider', mx: 1, display: { xs: 'none', sm: 'block' } }} />

            <motion.div whileTap={{ scale: 0.9 }}>
              <IconButton 
                onClick={toggleColorMode} 
                sx={{ 
                  bgcolor: 'action.hover',
                  color: 'themeToggle',
                  borderRadius: '12px',
                  width: 40,
                  height: 40
                }}
              >
                {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </IconButton>
            </motion.div>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
