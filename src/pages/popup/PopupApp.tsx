import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Fab,
  Chip,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Prompt } from '../../types';
import { AddPromptDialog } from '../../components/popup/AddPromptDialog';

const PopupApp: React.FC = () => {
  const { state, actions } = useApp();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 过滤提示词
  const filteredPrompts = state.prompts.filter(prompt => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      prompt.title.toLowerCase().includes(query) ||
      prompt.content.toLowerCase().includes(query) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // 复制提示词到剪贴板
  const handleCopyPrompt = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      // 更新使用统计
      const updatedPrompt = {
        ...prompt,
        metadata: {
          ...prompt.metadata,
          usageCount: prompt.metadata.usageCount + 1,
          lastUsedAt: new Date(),
        },
      };
      await actions.savePrompt(updatedPrompt);

      // 显示成功消息
      setSnackbar({
        open: true,
        message: t('promptCopied'),
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to copy prompt:', error);
      setSnackbar({
        open: true,
        message: '复制失败，请重试',
        severity: 'error',
      });
    }
  };

  // 打开选项页面
  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
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

  if (state.ui.loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部工具栏 */}
      <AppBar position="static" elevation={1}>
        <Toolbar variant="dense">
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Prompt Manager
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleOpenOptions}
            size="small"
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* 搜索栏 */}
      <Box sx={{ p: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* 提示词列表 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filteredPrompts.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            p={3}
          >
            <Typography variant="body2" color="text.secondary" align="center">
              {searchQuery ? t('noPromptsFound') : t('noPromptsYet')}
            </Typography>
          </Box>
        ) : (
          <List dense>
            {filteredPrompts.map((prompt) => (
              <ListItem
                key={prompt.id}
                divider
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  py: 1.5,
                }}
              >
                <Box sx={{ width: '100%', mb: 1 }}>
                  <Typography variant="subtitle2" noWrap>
                    {prompt.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mt: 0.5,
                    }}
                  >
                    {prompt.content}
                  </Typography>
                </Box>

                {/* 标签 */}
                {prompt.tags.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    {prompt.tags.slice(0, 3).map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                    {prompt.tags.length > 3 && (
                      <Chip
                        label={`+${prompt.tags.length - 3}`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    )}
                  </Box>
                )}

                {/* 操作按钮 */}
                <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleCopyPrompt(prompt)}
                    title="复制到剪贴板"
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      actions.selectPrompt(prompt.id);
                      handleOpenOptions();
                    }}
                    title="编辑"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <Box sx={{ flexGrow: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    {prompt.version} • {t('usageCount', { count: prompt.metadata.usageCount })}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* 添加按钮 */}
      <Fab
        color="primary"
        size="medium"
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setShowAddDialog(true)}
        title={t('addPrompt')}
      >
        <AddIcon />
      </Fab>

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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PopupApp;
