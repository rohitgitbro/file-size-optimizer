import { createTheme, PaletteMode, Shadows } from '@mui/material';

declare module '@mui/material/styles' {
  interface Theme {
    gradients: {
      hero: string;
      text: string;
    };
  }
  interface ThemeOptions {
    gradients?: {
      hero?: string;
      text?: string;
    };
  }
}

declare module '@mui/material/styles' {
  interface TypeBackground {
    subtle: string;
    glass: string;
  }
  interface TypeBackgroundOptions {
    subtle?: string;
    glass?: string;
  }
  interface Palette {
    themeToggle: string;
    brand: {
      fast: string;
      private: string;
    };
    tools: {
      image: string;
      pdf: string;
      merge: string;
      surgical: string;
    };
  }
  interface PaletteOptions {
    themeToggle?: string;
    brand?: {
      fast?: string;
      private?: string;
    };
    tools?: {
      image?: string;
      pdf?: string;
      merge?: string;
      surgical?: string;
    };
  }
}

export const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    themeToggle: mode === 'dark' ? '#ffb74d' : '#1a237e',
    brand: {
      fast: mode === 'dark' ? '#ffb74d' : '#ff9100',
      private: mode === 'dark' ? '#7986cb' : '#1a237e',
    },
    tools: {
      image: mode === 'dark' ? '#7986cb' : '#3949ab',
      pdf: mode === 'dark' ? '#69f0ae' : '#00e676',
      merge: mode === 'dark' ? '#ffb74d' : '#ff9100',
      surgical: mode === 'dark' ? '#ff4081' : '#f50057',
    },
    primary: {
      main: mode === 'light' ? '#1a237e' : '#7986cb',
      light: mode === 'light' ? '#534bae' : '#9fa8da',
      dark: mode === 'light' ? '#000051' : '#303f9f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: mode === 'light' ? '#00e676' : '#69f0ae',
      light: mode === 'light' ? '#66ffa6' : '#b9f6ca',
      dark: mode === 'light' ? '#00b248' : '#00c853',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    background: {
      default: mode === 'light' ? '#f8fafd' : '#0a0c12',
      paper: mode === 'light' ? '#ffffff' : '#141a24',
      subtle: mode === 'light' ? '#f0f4f8' : '#0c111a',
      glass: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(20, 26, 36, 0.8)',
    },
    text: {
      primary: mode === 'light' ? '#1a1c1e' : '#e3e6e8',
      secondary: mode === 'light' ? '#5f6368' : '#9aa0a6',
    },
    action: {
      hover: mode === 'light' ? 'rgba(26, 35, 126, 0.04)' : 'rgba(255, 255, 255, 0.05)',
      selected: mode === 'light' ? 'rgba(26, 35, 126, 0.08)' : 'rgba(255, 255, 255, 0.12)',
    },
    divider: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
  },
  gradients: {
    hero: mode === 'dark'
      ? 'radial-gradient(circle at 50% -20%, rgba(121, 134, 203, 0.15) 0%, transparent 60%)' 
      : 'radial-gradient(circle at 50% -20%, rgba(26, 35, 126, 0.05) 0%, transparent 60%)',
    text: mode === 'dark'
      ? 'linear-gradient(135deg, #7986cb 0%, #9fa8da 100%)'
      : 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "system-ui", sans-serif',
    h1: { fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.02em' },
    h2: { fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.01em' },
    h4: { fontSize: '1.75rem', fontWeight: 700 },
    h5: { fontSize: '1.5rem', fontWeight: 700 },
    h6: { fontSize: '1.25rem', fontWeight: 700 },
    button: { textTransform: 'none' as const, fontWeight: 700, borderRadius: 12 },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.05),0px 1px 1px 0px rgba(0,0,0,0.04),0px 1px 3px 0px rgba(0,0,0,0.03)',
    '0px 3px 1px -2px rgba(0,0,0,0.05),0px 2px 2px 0px rgba(0,0,0,0.04),0px 1px 5px 0px rgba(0,0,0,0.03)',
    '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
    '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.03)',
    '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.03)',
    ...Array(19).fill('none') // Fill remaining shadows
  ] as Shadows,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          background: mode === 'light' 
            ? 'linear-gradient(45deg, #1a237e 30%, #3949ab 90%)'
            : 'linear-gradient(45deg, #7986cb 30%, #5c6bc0 90%)',
          '&:hover': {
            background: mode === 'light'
              ? 'linear-gradient(45deg, #000051 30%, #1a237e 90%)'
              : 'linear-gradient(45deg, #5c6bc0 30%, #3f51b5 90%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid',
          borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
          boxShadow: mode === 'light' ? '0 10px 30px -5px rgba(0,0,0,0.04)' : 'none',
        },
      },
    },
  },
});

export const lightTheme = createTheme(getDesignTokens('light'));
export const darkTheme = createTheme(getDesignTokens('dark'));
