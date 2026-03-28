import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0033A0', // ZRA Blue - keep this
      light: '#1a4cbd',
      dark: '#002b7f',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFD700', // ZRA Gold - keep this
      light: '#ffde33',
      dark: '#e6c200',
      contrastText: '#0033A0',
    },
    success: {
      main: '#10B981',
    },
    background: {
      default: '#F9FAFB', // Slightly off-white, easier on eyes
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827', // Darker for better contrast
      secondary: '#4B5563', // Darker gray
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 40,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
      },
    },
  },
});