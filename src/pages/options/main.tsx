import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from '../../contexts/AppContext';
import OptionsApp from './OptionsApp';

// 创建主题
const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

const container = document.getElementById('options-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppProvider>
          <OptionsApp />
        </AppProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
