import { styled, Box, Card, Button, TextField, Chip, Fab } from '@mui/material';
import { colors } from '../../theme/modernTheme';

// 渐变容器
export const GradientBox = styled(Box)(({ theme }) => ({
  background: colors.gradients.primary,
  borderRadius: 16,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
    pointerEvents: 'none',
  },
}));

// 现代化卡片组件
export const ModernCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  background: colors.gradients.card,
  border: `1px solid ${colors.gray[200]}`,
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  overflow: 'hidden',
  
  // 顶部彩色边框
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: colors.gradients.primary,
    borderRadius: '16px 16px 0 0',
  },

  // 悬停效果
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
    borderColor: colors.primary.main,
    
    '&::after': {
      opacity: 1,
    },
  },

  // 光泽效果
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    transition: 'all 0.6s',
    opacity: 0,
    pointerEvents: 'none',
  },

  '&:hover::after': {
    left: '100%',
    opacity: 1,
  },
}));

// 动画按钮
export const AnimatedButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: 12,
  padding: '12px 24px',
  background: colors.gradients.primary,
  color: '#ffffff',
  border: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    transition: 'left 0.5s',
  },

  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.32)',
    filter: 'brightness(1.1)',
    
    '&::before': {
      left: '100%',
    },
  },

  '&:active': {
    transform: 'translateY(0)',
    transition: 'transform 0.1s',
  },
}));

// 玻璃态按钮
export const GlassButton = styled(Button)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 12,
  color: '#ffffff',
  fontWeight: 500,
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(255, 255, 255, 0.2)',
  },
}));

// 现代化搜索框
export const ModernSearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: `1px solid ${colors.primary[300]}`,
      
      '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
      },
    },
    
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      border: `2px solid ${colors.primary.main}`,
      boxShadow: `0 0 0 4px ${colors.primary[100]}`,
      
      '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
      },
    },
    
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
}));

// 渐变标签
export const GradientChip = styled(Chip)(({ theme }) => ({
  background: colors.gradients.primary,
  color: '#ffffff',
  borderRadius: 20,
  fontWeight: 500,
  fontSize: '0.75rem',
  height: 28,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  border: 'none',
  
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.32)',
  },
  
  '& .MuiChip-deleteIcon': {
    color: 'rgba(255, 255, 255, 0.8)',
    
    '&:hover': {
      color: '#ffffff',
    },
  },
}));

// 类别标签（不同颜色）
export const CategoryChip = styled(Chip)<{ category: string }>(({ theme, category }) => {
  const categoryColors: { [key: string]: string } = {
    writing: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    coding: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    analysis: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    creative: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    business: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    academic: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  };

  return {
    background: categoryColors[category] || colors.gradients.primary,
    color: '#ffffff',
    borderRadius: 16,
    fontWeight: 500,
    fontSize: '0.75rem',
    height: 24,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    
    '&:hover': {
      transform: 'scale(1.05)',
      filter: 'brightness(1.1)',
    },
  };
});

// 浮动操作按钮升级
export const ModernFab = styled(Fab)(({ theme }) => ({
  background: colors.gradients.primary,
  boxShadow: '0 8px 32px rgba(99, 102, 241, 0.32)',
  width: 56,
  height: 56,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    background: colors.gradients.primary,
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
  },
  
  '&:active': {
    transform: 'translateY(0) scale(1)',
    transition: 'transform 0.1s',
  },
  
  '& .MuiSvgIcon-root': {
    fontSize: '1.5rem',
  },
}));

// 状态指示器
export const StatusIndicator = styled(Box)<{ status: 'active' | 'inactive' | 'warning' }>(({ theme, status }) => {
  const statusColors = {
    active: colors.success.main,
    inactive: colors.gray[400],
    warning: colors.warning.main,
  };

  return {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: statusColors[status],
    position: 'relative',
    
    '&::after': {
      content: '""',
      position: 'absolute',
      top: -2,
      left: -2,
      right: -2,
      bottom: -2,
      borderRadius: '50%',
      backgroundColor: statusColors[status],
      opacity: 0.3,
      animation: status === 'active' ? 'pulse 2s infinite' : 'none',
    },
    
    '@keyframes pulse': {
      '0%': {
        transform: 'scale(1)',
        opacity: 0.3,
      },
      '50%': {
        transform: 'scale(1.2)',
        opacity: 0.1,
      },
      '100%': {
        transform: 'scale(1)',
        opacity: 0.3,
      },
    },
  };
});

// 容器组件
export const FlexContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

export const CenteredContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  height: '100%',
  gap: 16,
});

// 响应式网格
export const ResponsiveGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: 16,
  padding: 16,
  
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: 12,
    padding: 12,
  },
}));

// 加载骨架屏
export const SkeletonCard = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '200% 100%',
  animation: 'loading 1.5s infinite',
  borderRadius: 16,
  height: 200,
  
  '@keyframes loading': {
    '0%': {
      backgroundPosition: '200% 0',
    },
    '100%': {
      backgroundPosition: '-200% 0',
    },
  },
}));