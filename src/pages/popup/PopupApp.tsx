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
import { Prompt } from '../../types';

const PopupApp: React.FC = () => {
  const { state, actions } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

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
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  };

  // 打开选项页面
  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
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
          placeholder="搜索提示词..."
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
              {searchQuery ? '没有找到匹配的提示词' : '还没有提示词，点击下方按钮添加'}
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
                    {prompt.version} • 使用 {prompt.metadata.usageCount} 次
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
        onClick={handleOpenOptions}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default PopupApp;
