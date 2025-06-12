import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Fade,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  FilterList as FilterIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Prompt } from '../../types';
import { AddPromptDialog } from '../../components/popup/AddPromptDialog';
import { PromptCard } from '../../components/common/PromptCard';
import { EmptyState } from '../../components/common/EmptyState';
import {
  GradientBox,
  ModernSearchField,
  ModernFab,
  ResponsiveGrid,
  CenteredContainer,
  FlexContainer,
  GlassButton,
  CategoryChip,
} from '../../components/styled/ModernComponents';
import { colors } from '../../theme/modernTheme';

type ViewMode = 'grid' | 'list';
type SortMode = 'recent' | 'popular' | 'alphabetical';

const ModernPopupApp: React.FC = () => {
  const theme = useTheme();
  const { state, actions } = useApp();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 获取所有分类
  const categories = useMemo(() => {
    const categorySet = new Set(state.prompts.map(p => p.category));
    return Array.from(categorySet);
  }, [state.prompts]);

  // 过滤和排序提示词
  const filteredAndSortedPrompts = useMemo(() => {
    let filtered = state.prompts.filter(prompt => {
      const matchesSearch = !searchQuery || 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !selectedCategory || prompt.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // 排序
    switch (sortMode) {
      case 'popular':
        filtered.sort((a, b) => (b.metadata?.usageCount || 0) - (a.metadata?.usageCount || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }

    return filtered;
  }, [state.prompts, searchQuery, selectedCategory, sortMode]);

  // 复制提示词到剪贴板
  const handleCopyPrompt = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      
      // 更新使用统计
      const updatedPrompt = {
        ...prompt,
        metadata: {
          ...prompt.metadata,
          usageCount: (prompt.metadata?.usageCount || 0) + 1,
          lastUsedAt: new Date(),
        },
      };
      await actions.savePrompt(updatedPrompt);

      setSnackbar({
        open: true,
        message: t('promptCopied'),
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to copy prompt:', error);
      setSnackbar({
        open: true,
        message: 'Copy failed, please try again',
        severity: 'error',
      });
    }
  };

  // 打开选项页面
  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  // 编辑提示词
  const handleEditPrompt = (prompt: Prompt) => {
    actions.selectPrompt(prompt.id);
    handleOpenOptions();
  };

  // 查看版本历史
  const handleViewHistory = (prompt: Prompt) => {
    actions.selectPrompt(prompt.id);
    handleOpenOptions();
  };

  // 处理添加提示词成功
  const handleAddSuccess = () => {
    setSnackbar({
      open: true,
      message: t('promptSaved'),
      severity: 'success',
    });
  };

  // 关闭提示消息
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 切换分类筛选
  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
  };

  if (state.ui.loading) {
    return (
      <CenteredContainer sx={{ height: 600, width: 400 }}>
        <CircularProgress size={40} sx={{ color: colors.primary.main }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading your prompts...
        </Typography>
      </CenteredContainer>
    );
  }

  return (
    <Box sx={{ height: 600, width: 400, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 渐变头部 */}
      <GradientBox sx={{ px: 3, py: 2.5, color: 'white' }}>
        <FlexContainer sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Prompt Manager
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {state.prompts.length} prompts • {filteredAndSortedPrompts.length} showing
            </Typography>
          </Box>
          
          <FlexContainer sx={{ gap: 1 }}>
            <Tooltip title="Settings" arrow>
              <IconButton
                onClick={handleOpenOptions}
                sx={{ 
                  color: 'white',
                  '&:hover': { backgroundColor: alpha('#ffffff', 0.1) }
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </FlexContainer>
        </FlexContainer>

        {/* 搜索栏 */}
        <ModernSearchField
          fullWidth
          placeholder="Search prompts, tags, or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.gray[400] }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            },
          }}
        />
      </GradientBox>

      {/* 过滤器和视图控制 */}
      <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${colors.gray[200]}`, backgroundColor: colors.gray[50] }}>
        {/* 分类筛选 */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <CategoryChip
              key={category}
              category={category}
              label={category}
              size="small"
              onClick={() => handleCategoryFilter(category)}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
              sx={{
                cursor: 'pointer',
                opacity: selectedCategory === category ? 1 : 0.7,
                transform: selectedCategory === category ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          ))}
        </Box>

        {/* 排序和视图控制 */}
        <FlexContainer sx={{ justifyContent: 'space-between' }}>
          <FlexContainer sx={{ gap: 1 }}>
            <GlassButton
              size="small"
              onClick={() => setSortMode('recent')}
              variant={sortMode === 'recent' ? 'contained' : 'outlined'}
              sx={{ 
                minWidth: 'auto', 
                px: 1.5,
                backgroundColor: sortMode === 'recent' ? alpha(colors.primary.main, 0.1) : 'transparent',
                color: sortMode === 'recent' ? colors.primary.main : colors.gray[600],
              }}
            >
              Recent
            </GlassButton>
            <GlassButton
              size="small"
              onClick={() => setSortMode('popular')}
              variant={sortMode === 'popular' ? 'contained' : 'outlined'}
              sx={{ 
                minWidth: 'auto', 
                px: 1.5,
                backgroundColor: sortMode === 'popular' ? alpha(colors.primary.main, 0.1) : 'transparent',
                color: sortMode === 'popular' ? colors.primary.main : colors.gray[600],
              }}
            >
              Popular
            </GlassButton>
          </FlexContainer>

          <FlexContainer sx={{ gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setViewMode('grid')}
              sx={{ 
                color: viewMode === 'grid' ? colors.primary.main : colors.gray[400],
                backgroundColor: viewMode === 'grid' ? alpha(colors.primary.main, 0.1) : 'transparent',
              }}
            >
              <GridViewIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode('list')}
              sx={{ 
                color: viewMode === 'list' ? colors.primary.main : colors.gray[400],
                backgroundColor: viewMode === 'list' ? alpha(colors.primary.main, 0.1) : 'transparent',
              }}
            >
              <ListViewIcon fontSize="small" />
            </IconButton>
          </FlexContainer>
        </FlexContainer>
      </Box>

      {/* 主内容区域 */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {filteredAndSortedPrompts.length === 0 ? (
          <EmptyState
            type={
              searchQuery && selectedCategory ? 'no-filtered-results' :
              searchQuery ? 'no-search-results' :
              selectedCategory ? 'no-filtered-results' :
              'no-prompts'
            }
            onAction={() => {
              if (searchQuery) {
                setSearchQuery('');
              } else if (selectedCategory) {
                setSelectedCategory('');
              } else {
                setShowAddDialog(true);
              }
            }}
          />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' ? '1fr' : '1fr',
              gap: 1.5,
              pb: 10, // 为FAB留出空间
            }}
          >
            {filteredAndSortedPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onCopy={handleCopyPrompt}
                onEdit={handleEditPrompt}
                onViewHistory={handleViewHistory}
                isCompact={viewMode === 'list'}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* 浮动添加按钮 */}
      <ModernFab
        onClick={() => setShowAddDialog(true)}
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </ModernFab>

      {/* 添加提示词对话框 */}
      <AddPromptDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={handleAddSuccess}
      />

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            fontWeight: 500,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModernPopupApp;