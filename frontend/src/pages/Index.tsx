
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';
import Spreadsheet from '../components/Spreadsheet';
import { customTheme } from '../theme/theme';

const Index = () => {
  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: 'background.default',
        py: 3 
      }}>
        <Container maxWidth="xl">
          <Spreadsheet />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Index;
