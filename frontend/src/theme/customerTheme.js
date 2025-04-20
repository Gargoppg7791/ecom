import { createTheme } from '@mui/material/styles';

const customerTheme = createTheme({
  palette: {
    primary: {
      main: '#8B4513',
      light: '#A0522D',
      dark: '#654321',
    },
    secondary: {
      main: '#DAA520',
      light: '#FFD700',
      dark: '#B8860B',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFF8DC',
    },
    text: {
      primary: '#2D2D2D',
      secondary: '#5C5C5C',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#8B4513',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#8B4513',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      color: '#8B4513',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#8B4513',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
        contained: {
          backgroundColor: '#8B4513',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#654321',
          },
        },
        outlined: {
          borderColor: '#8B4513',
          color: '#8B4513',
          '&:hover': {
            borderColor: '#654321',
            backgroundColor: 'rgba(139, 69, 19, 0.04)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#8B4513',
        },
      },
    },
  },
});

export default customerTheme; 