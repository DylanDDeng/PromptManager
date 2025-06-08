import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from '../../contexts/AppContext';
import PopupApp from './PopupApp';

// 创建主题
const theme = createTheme({
  palette: {
    mode: 'light',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          width: '400px',
          height: '600px',
          overflow: 'hidden',
        },
      },
    },
  },
});

const container = document.getElementById('popup-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppProvider>
          <PopupApp />
        </AppProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
