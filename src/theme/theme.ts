
import { createTheme, PaletteMode } from '@mui/material';

export const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    primary: {
      main: '#1a237e', // Deep Navy for authority/gov feel
      light: '#534bae',
      dark: '#000051',
    },
    secondary: {
      main: '#00c853', // Vibrant green for success/action
      light: '#5efc82',
      dark: '#009624',
    },
    background: {
      default: mode === 'light' ? '#f5f7fa' : '#0a0c10',
      paper: mode === 'light' ? '#ffffff' : '#161b22',
    },
    text: {
      primary: mode === 'light' ? '#1c1e21' : '#e6edf3',
      secondary: mode === 'light' ? '#57606a' : '#8b949e',
    },
    divider: mode === 'light' ? '#d0d7de' : '#30363d',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    button: { textTransform: 'none' as const, fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export const lightTheme = createTheme(getDesignTokens('light'));
export const darkTheme = createTheme(getDesignTokens('dark'));
