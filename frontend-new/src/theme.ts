import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2b4bff',
      light: '#7a9aff',
      dark: '#1428ab',
    },
    secondary: {
      main: '#ff6b6b',
    },
    background: {
      default: '#f4f5f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        containedPrimary: {
          backgroundColor: '#2b4bff',
          '&:hover': {
            backgroundColor: '#1428ab',
          },
        },
      },
    },
  },
});

export default theme;
