
import { createTheme } from '@mui/material/styles';

export const customTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00bcd4', // Cyan
      light: '#33c9dc',
      dark: '#00838f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff5722', // Deep Orange
      light: '#ff8a50',
      dark: '#c41c00',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    surface: {
      main: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '12px',
          padding: '10px 24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          borderRadius: '16px',
          backgroundColor: '#1a1a1a',
          '& .MuiDataGrid-cell': {
            borderColor: 'rgba(255, 255, 255, 0.08)',
            color: '#ffffff',
            fontSize: '14px',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#252525',
            borderBottom: '2px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px 16px 0 0',
            '& .MuiDataGrid-columnHeader': {
              color: '#ffffff',
              fontWeight: 600,
            },
          },
          '& .MuiDataGrid-row': {
            backgroundColor: '#1a1a1a',
            '&:nth-of-type(even)': {
              backgroundColor: '#1e1e1e',
            },
            '&:hover': {
              backgroundColor: 'rgba(0, 188, 212, 0.08)',
            },
          },
          '& .MuiDataGrid-cell:focus': {
            outline: '2px solid #00bcd4',
            outlineOffset: '-2px',
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: '#252525',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '0 0 16px 16px',
          },
        },
      },
    },
  },
});
