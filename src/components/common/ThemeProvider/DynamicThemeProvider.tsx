import React, { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useApp } from '../../../contexts/AppContext';
import { lightTheme, darkTheme } from '../../../theme/modernTheme';

interface DynamicThemeProviderProps {
  children: React.ReactNode;
  customStyles?: Record<string, unknown>;
}

const DynamicThemeProvider: React.FC<DynamicThemeProviderProps> = ({ 
  children, 
  customStyles 
}) => {
  const { state } = useApp();
  
  // 根据状态选择现代化主题
  const theme = useMemo(() => {
    const baseTheme = state.ui.theme === 'dark' ? darkTheme : lightTheme;
    
    // 如果有自定义样式，合并到主题中
    if (customStyles) {
      return {
        ...baseTheme,
        components: {
          ...baseTheme.components,
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                margin: 0,
                padding: 0,
                fontFamily: baseTheme.typography.fontFamily,
                ...customStyles,
              },
            },
          },
        },
      };
    }
    
    return baseTheme;
  }, [state.ui.theme, customStyles]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
};

export default DynamicThemeProvider;
