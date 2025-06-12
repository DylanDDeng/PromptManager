import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import {
  AutoAwesome as SparklesIcon,
  Search as SearchIcon,
  Add as AddIcon,
  TrendingUp as TrendingIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { CenteredContainer, AnimatedButton } from '../../styled/ModernComponents';
import { colors } from '../../../theme/modernTheme';

interface EmptyStateProps {
  type: 'no-prompts' | 'no-search-results' | 'no-filtered-results';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  showAnimation?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  showAnimation = true,
}) => {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'no-prompts':
        return {
          icon: <SparklesIcon sx={{ fontSize: 48, color: 'white' }} />,
          defaultTitle: 'Ready to create your first prompt?',
          defaultDescription: 'Start building your AI prompt library with smart organization and version control.',
          defaultActionLabel: 'Create First Prompt',
          gradient: colors.gradients.primary,
        };
      case 'no-search-results':
        return {
          icon: <SearchIcon sx={{ fontSize: 48, color: 'white' }} />,
          defaultTitle: 'No search results found',
          defaultDescription: 'Try adjusting your search terms or check the spelling. You can also browse all prompts by clearing the search.',
          defaultActionLabel: 'Clear Search',
          gradient: colors.gradients.accent,
        };
      case 'no-filtered-results':
        return {
          icon: <FilterIcon sx={{ fontSize: 48, color: 'white' }} />,
          defaultTitle: 'No prompts match your filters',
          defaultDescription: 'Try adjusting your category or tag filters to see more results.',
          defaultActionLabel: 'Clear Filters',
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        };
      default:
        return {
          icon: <TrendingIcon sx={{ fontSize: 48, color: 'white' }} />,
          defaultTitle: 'Nothing here yet',
          defaultDescription: 'Get started by creating your first item.',
          defaultActionLabel: 'Get Started',
          gradient: colors.gradients.primary,
        };
    }
  };

  const config = getEmptyStateConfig();
  
  return (
    <CenteredContainer sx={{ height: '100%', px: 3, py: 4 }}>
      {/* 动画图标 */}
      {showAnimation && (
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: config.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            position: 'relative',
            animation: 'float 3s ease-in-out infinite',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -10,
              left: -10,
              right: -10,
              bottom: -10,
              borderRadius: '50%',
              background: config.gradient,
              opacity: 0.3,
              animation: 'pulse 2s ease-in-out infinite',
            },
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' },
            },
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)', opacity: 0.3 },
              '50%': { transform: 'scale(1.1)', opacity: 0.1 },
            },
          }}
        >
          {config.icon}
        </Box>
      )}
      
      {/* 标题 */}
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          fontWeight: 600, 
          textAlign: 'center',
          color: colors.gray[900],
          mb: 1,
        }}
      >
        {title || config.defaultTitle}
      </Typography>
      
      {/* 描述 */}
      <Typography 
        variant="body1" 
        color="text.secondary" 
        paragraph 
        sx={{ 
          textAlign: 'center', 
          lineHeight: 1.6,
          maxWidth: 320,
          mb: 3,
        }}
      >
        {description || config.defaultDescription}
      </Typography>
      
      {/* 操作按钮 */}
      {onAction && (
        <AnimatedButton
          variant="contained"
          onClick={onAction}
          startIcon={type === 'no-prompts' ? <AddIcon /> : undefined}
          sx={{ 
            mt: 1,
            px: 3,
            py: 1.5,
            fontSize: '0.95rem',
            fontWeight: 600,
          }}
        >
          {actionLabel || config.defaultActionLabel}
        </AnimatedButton>
      )}

      {/* 提示信息 */}
      {type === 'no-prompts' && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            💡 Tip: Use keyboard shortcut <strong>Ctrl+Shift+P</strong> for quick access
          </Typography>
        </Box>
      )}
    </CenteredContainer>
  );
};

export default EmptyState;