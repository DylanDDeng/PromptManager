import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Fade,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  MoreVert as MoreIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { Prompt } from '../../../types';
import { ModernCard, CategoryChip, StatusIndicator, FlexContainer } from '../../styled/ModernComponents';
import { colors } from '../../../theme/modernTheme';

interface PromptCardProps {
  prompt: Prompt;
  onCopy?: (prompt: Prompt) => void;
  onEdit?: (prompt: Prompt) => void;
  onViewHistory?: (prompt: Prompt) => void;
  onToggleFavorite?: (prompt: Prompt) => void;
  isCompact?: boolean;
  showUsageStats?: boolean;
}

const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onCopy,
  onEdit,
  onViewHistory,
  onToggleFavorite,
  isCompact = false,
  showUsageStats = true,
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // 处理复制操作
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopy) {
      await onCopy(prompt);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  // 处理编辑操作
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(prompt);
    }
  };

  // 处理历史记录
  const handleViewHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewHistory) {
      onViewHistory(prompt);
    }
  };

  // 处理收藏切换
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(prompt);
    }
  };

  // 获取使用频率颜色
  const getUsageColor = (count: number) => {
    if (count >= 20) return colors.success.main;
    if (count >= 10) return colors.warning.main;
    if (count >= 5) return colors.primary.main;
    return colors.gray[400];
  };

  // 计算内容预览
  const contentPreview = prompt.content.length > 120 
    ? prompt.content.substring(0, 120) + '...'
    : prompt.content;

  return (
    <ModernCard
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onEdit?.(prompt)}
      sx={{
        height: isCompact ? 200 : 280,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* 背景装饰 */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: alpha(colors.primary.main, 0.1),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
        }}
      />

      {/* 头部区域 */}
      <Box sx={{ p: 2, pb: 1, position: 'relative', zIndex: 1 }}>
        <FlexContainer sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ flex: 1, mr: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: isCompact ? '1rem' : '1.1rem',
                lineHeight: 1.3,
                color: colors.gray[900],
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 0.5,
              }}
            >
              {prompt.title}
            </Typography>
            
            {/* 状态指示器和版本信息 */}
            <FlexContainer sx={{ gap: 1 }}>
              <StatusIndicator status="active" />
              <Typography
                variant="caption"
                sx={{
                  color: colors.gray[600],
                  fontWeight: 500,
                  backgroundColor: alpha(colors.primary.main, 0.1),
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                }}
              >
                v{prompt.version}
              </Typography>
            </FlexContainer>
          </Box>

          {/* 收藏按钮 */}
          <Fade in={isHovered} timeout={200}>
            <IconButton
              size="small"
              onClick={handleToggleFavorite}
              sx={{
                color: prompt.metadata?.isFavorite ? colors.warning.main : colors.gray[400],
                '&:hover': {
                  backgroundColor: alpha(colors.warning.main, 0.1),
                  color: colors.warning.main,
                },
              }}
            >
              {prompt.metadata?.isFavorite ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Fade>
        </FlexContainer>

        {/* 分类标签 */}
        <Box sx={{ mb: 1.5 }}>
          <CategoryChip
            category={prompt.category}
            label={prompt.category}
            size="small"
          />
        </Box>
      </Box>

      {/* 内容区域 */}
      <Box sx={{ px: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 描述 */}
        {prompt.description && !isCompact && (
          <Typography
            variant="body2"
            sx={{
              color: colors.gray[600],
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {prompt.description}
          </Typography>
        )}

        {/* 内容预览 */}
        <Typography
          variant="body2"
          sx={{
            color: colors.gray[700],
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: isCompact ? 3 : 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            backgroundColor: alpha(colors.gray[100], 0.5),
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${alpha(colors.gray[300], 0.5)}`,
          }}
        >
          {contentPreview}
        </Typography>
      </Box>

      {/* 标签区域 */}
      {prompt.tags && prompt.tags.length > 0 && (
        <Box sx={{ px: 2, py: 1 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {prompt.tags.slice(0, isCompact ? 2 : 3).map((tag) => (
              <Typography
                key={tag}
                variant="caption"
                sx={{
                  backgroundColor: alpha(colors.primary.main, 0.1),
                  color: colors.primary.main,
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                }}
              >
                #{tag}
              </Typography>
            ))}
            {prompt.tags.length > (isCompact ? 2 : 3) && (
              <Typography
                variant="caption"
                sx={{
                  color: colors.gray[500],
                  px: 1,
                  py: 0.25,
                  fontSize: '0.7rem',
                }}
              >
                +{prompt.tags.length - (isCompact ? 2 : 3)}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* 底部操作栏 */}
      <Box
        sx={{
          p: 2,
          pt: 1,
          borderTop: `1px solid ${alpha(colors.gray[200], 0.5)}`,
          background: alpha(colors.gray[50], 0.5),
          backdropFilter: 'blur(10px)',
        }}
      >
        <FlexContainer sx={{ justifyContent: 'space-between' }}>
          {/* 使用统计 */}
          {showUsageStats && (
            <FlexContainer sx={{ gap: 1 }}>
              <TrendingUpIcon 
                sx={{ 
                  fontSize: 16, 
                  color: getUsageColor(prompt.metadata?.usageCount || 0) 
                }} 
              />
              <Typography
                variant="caption"
                sx={{
                  color: colors.gray[600],
                  fontWeight: 500,
                }}
              >
                Used {prompt.metadata?.usageCount || 0} times
              </Typography>
            </FlexContainer>
          )}

          {/* 操作按钮 */}
          <FlexContainer sx={{ gap: 0.5 }}>
            <Tooltip title={copyFeedback ? "Copied!" : "Copy to clipboard"} arrow>
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{
                  color: copyFeedback ? colors.success.main : colors.gray[600],
                  '&:hover': {
                    backgroundColor: alpha(colors.primary.main, 0.1),
                    color: colors.primary.main,
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="View history" arrow>
              <IconButton
                size="small"
                onClick={handleViewHistory}
                sx={{
                  color: colors.gray[600],
                  '&:hover': {
                    backgroundColor: alpha(colors.warning.main, 0.1),
                    color: colors.warning.main,
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <HistoryIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit prompt" arrow>
              <IconButton
                size="small"
                onClick={handleEdit}
                sx={{
                  color: colors.gray[600],
                  '&:hover': {
                    backgroundColor: alpha(colors.secondary.main, 0.1),
                    color: colors.secondary.main,
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </FlexContainer>
        </FlexContainer>
      </Box>

      {/* 悬停时的光效 */}
      <Fade in={isHovered} timeout={300}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      </Fade>
    </ModernCard>
  );
};

export default PromptCard;