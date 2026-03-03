
'use client';

import React from 'react';
import { Box, Typography, Container, Breadcrumbs, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface ToolLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  toolName: string;
}

export function ToolLayout({ children, title, description, toolName }: ToolLayoutProps) {
  return (
    <Box sx={{ py: { xs: 4, md: 8 }, minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Breadcrumbs 
            separator={<ChevronRight size={14} />} 
            sx={{ mb: 4, '& .MuiBreadcrumbs-li': { fontSize: '0.85rem' } }}
          >
            <MuiLink component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              <Home size={14} /> Home
            </MuiLink>
            <Typography color="text.primary" fontWeight={600}>{toolName}</Typography>
          </Breadcrumbs>
        </motion.div>

        {/* Header Section */}
        <Box sx={{ mb: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Typography variant="h3" component="h1" fontWeight={900} gutterBottom sx={{ letterSpacing: -1, background: 'linear-gradient(45deg, #1a237e 30%, #534bae 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, fontSize: '1.1rem', lineHeight: 1.6 }}>
              {description}
            </Typography>
          </motion.div>
        </Box>

        {/* Tool Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </Container>
    </Box>
  );
}
