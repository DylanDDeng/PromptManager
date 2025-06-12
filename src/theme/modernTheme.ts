import { createTheme, ThemeOptions } from '@mui/material/styles';

// 现代化色彩系统
const colors = {
  primary: {
    main: '#6366f1',
    light: '#8b5cf6',
    dark: '#4f46e5',
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  secondary: {
    main: '#06b6d4',
    light: '#67e8f9',
    dark: '#0891b2',
  },
  success: {
    main: '#10b981',
    light: '#6ee7b7',
    dark: '#059669',
  },
  warning: {
    main: '#f59e0b',
    light: '#fcd34d',
    dark: '#d97706',
  },
  error: {
    main: '#ef4444',
    light: '#fca5a5',
    dark: '#dc2626',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    accent: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
    glass: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.1) 100%)',
    card: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  }
};

// 现代化阴影系统
const shadows = [
  'none',
  '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
  '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)',
  // 彩色阴影
  '0 8px 32px rgba(99, 102, 241, 0.24)',
  '0 12px 40px rgba(139, 92, 246, 0.32)',
  '0 16px 48px rgba(6, 182, 212, 0.28)',
  // 更多层级...
  '0 20px 60px rgba(0,0,0,0.15)',
  '0 24px 70px rgba(0,0,0,0.18)',
  '0 28px 80px rgba(0,0,0,0.20)',
  '0 32px 90px rgba(0,0,0,0.22)',
  '0 36px 100px rgba(0,0,0,0.24)',
  '0 40px 110px rgba(0,0,0,0.26)',
  '0 44px 120px rgba(0,0,0,0.28)',
  '0 48px 130px rgba(0,0,0,0.30)',
  '0 52px 140px rgba(0,0,0,0.32)',
  '0 56px 150px rgba(0,0,0,0.34)',
  '0 60px 160px rgba(0,0,0,0.36)',
  '0 64px 170px rgba(0,0,0,0.38)',
  '0 68px 180px rgba(0,0,0,0.40)',
  '0 72px 190px rgba(0,0,0,0.42)',
  '0 76px 200px rgba(0,0,0,0.44)',
  '0 80px 210px rgba(0,0,0,0.46)',
];

// 现代化字体系统
const typography = {
  fontFamily: [
    'Inter',
    'SF Pro Display',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Roboto',
    'sans-serif'
  ].join(','),
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 600,
  h1: {
    fontSize: '3rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontSize: '2.25rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontSize: '1.875rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.015em',
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.005em',
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
    letterSpacing: '0.01em',
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    letterSpacing: '0.02em',
    textTransform: 'none' as const,
  },
};

// 现代化主题配置
const baseThemeOptions: ThemeOptions = {
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    background: {
      default: colors.gray[50],
      paper: '#ffffff',
    },
    text: {
      primary: colors.gray[900],
      secondary: colors.gray[600],
    },
    divider: colors.gray[200],
  },
  typography,
  shadows: shadows as any,
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    // Button组件优化
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.24)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: colors.gradients.primary,
          color: '#ffffff',
          '&:hover': {
            background: colors.gradients.primary,
            filter: 'brightness(1.1)',
          },
        },
        outlined: {
          borderColor: colors.gray[300],
          color: colors.gray[700],
          '&:hover': {
            borderColor: colors.primary.main,
            backgroundColor: colors.primary[50],
          },
        },
      },
    },
    // Card组件优化
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${colors.gray[200]}`,
          background: colors.gradients.card,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
            borderColor: colors.primary.main,
          },
        },
      },
    },
    // TextField组件优化
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary[300],
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary.main,
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    // Chip组件优化
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
          fontSize: '0.75rem',
          height: 28,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
        colorPrimary: {
          background: colors.gradients.primary,
          color: '#ffffff',
        },
      },
    },
    // AppBar组件优化
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: colors.gradients.primary,
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    // Paper组件优化
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${colors.gray[200]}`,
        },
        elevation1: {
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        },
      },
    },
    // Fab组件优化
    MuiFab: {
      styleOverrides: {
        root: {
          background: colors.gradients.primary,
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.32)',
          '&:hover': {
            background: colors.gradients.primary,
            transform: 'translateY(-2px) scale(1.05)',
            boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
          },
        },
      },
    },
  },
};

// 浅色主题
export const lightTheme = createTheme(baseThemeOptions);

// 深色主题
export const darkTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    mode: 'dark',
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    background: {
      default: colors.gray[900],
      paper: colors.gray[800],
    },
    text: {
      primary: colors.gray[100],
      secondary: colors.gray[400],
    },
    divider: colors.gray[700],
  },
  components: {
    ...baseThemeOptions.components,
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #1f2937 0%, #111827 100%)',
          borderColor: colors.gray[700],
          '&:hover': {
            borderColor: colors.primary.light,
            boxShadow: '0 20px 40px rgba(139, 92, 246, 0.2)',
          },
        },
      },
    },
  },
});

// 导出颜色常量供其他组件使用
export { colors };

// 自定义钩子用于访问主题
export const useModernTheme = () => ({
  colors,
  gradients: colors.gradients,
  shadows,
});