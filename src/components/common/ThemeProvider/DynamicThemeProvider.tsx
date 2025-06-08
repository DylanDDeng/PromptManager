import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useApp } from '../../../contexts/AppContext';

interface DynamicThemeProviderProps {
  children: React.ReactNode;
  customStyles?: any;
}

const DynamicThemeProvider: React.FC<DynamicThemeProviderProps> = ({ 
  children, 
  customStyles 
}) => {
  const { state } = useApp();
  
  // 根据状态创建动态主题
  const theme = createTheme({
    palette: {
      mode: state.ui.theme, // 使用动态主题
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            margin: 0,
            padding: 0,
            ...customStyles,
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default DynamicThemeProvider;
