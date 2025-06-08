import React, { useState } from 'react';
import {
  Box,
  Grid,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useApp } from '../../../contexts/AppContext';
import { Prompt } from '../../../types';
import { v4 as uuidv4 } from 'uuid';
import { versionService } from '../../../services/versionService';
import { VersionHistory } from '../../../components/prompt/VersionHistory';

const PromptManager: React.FC = () => {
  const { state, actions } = useApp();
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [selectedPromptForHistory, setSelectedPromptForHistory] = useState<Prompt | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    category: '',
    tags: [] as string[],
  });

  // 打开编辑对话框
  const handleEdit = (prompt?: Prompt) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setFormData({
        title: prompt.title,
        content: prompt.content,
        description: prompt.description || '',
        category: prompt.category,
        tags: prompt.tags,
      });
    } else {
      setEditingPrompt(null);
      setFormData({
        title: '',
        content: '',
        description: '',
        category: state.categories[0]?.id || '',
        tags: [],
      });
    }
    setIsDialogOpen(true);
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPrompt(null);
    setFormData({
      title: '',
      content: '',
      description: '',
      category: '',
      tags: [],
    });
  };

  // 保存提示词
  const handleSave = async () => {
    try {
      const now = new Date();
      let prompt: Prompt;

      if (editingPrompt) {
        // 编辑现有提示词
        const newVersion = versionService.createVersion(editingPrompt);
        prompt = {
          ...editingPrompt,
          title: formData.title,
          content: formData.content,
          description: formData.description,
          category: formData.category,
          tags: formData.tags,
          version: newVersion.version,
          versions: [...editingPrompt.versions, newVersion],
          updatedAt: now,
        };
      } else {
        // 创建新提示词
        const initialVersion = {
          version: 'v1.0.0',
          content: formData.content,
          title: formData.title,
          description: formData.description,
          createdAt: now,
          changes: '初始版本',
        };

        prompt = {
          id: uuidv4(),
          title: formData.title,
          content: formData.content,
          description: formData.description,
          category: formData.category,
          tags: formData.tags,
          variables: [], // TODO: 解析模板变量
          version: 'v1.0.0',
          versions: [initialVersion],
          metadata: {
            usageCount: 0,
            isFavorite: false,
            isTemplate: false,
          },
          createdAt: now,
          updatedAt: now,
        };
      }

      await actions.savePrompt(prompt);
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save prompt:', error);
    }
  };

  // 删除提示词
  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个提示词吗？')) {
      try {
        await actions.deletePrompt(id);
      } catch (error) {
        console.error('Failed to delete prompt:', error);
      }
    }
  };

  // 复制提示词
  const handleCopy = async (prompt: Prompt) => {
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

  // 打开版本历史
  const handleOpenVersionHistory = (prompt: Prompt) => {
    setSelectedPromptForHistory(prompt);
    setVersionHistoryOpen(true);
  };

  // 关闭版本历史
  const handleCloseVersionHistory = () => {
    setVersionHistoryOpen(false);
    setSelectedPromptForHistory(null);
  };

  // 恢复版本
  const handleRestoreVersion = async (version: string) => {
    console.log(`Restored to version ${version}`);
    // 版本恢复逻辑已在VersionHistory组件中处理
  };

  // 更新提示词（用于版本历史回调）
  const handleUpdatePrompt = async (updatedPrompt: Prompt) => {
    try {
      await actions.savePrompt(updatedPrompt);
    } catch (error) {
      console.error('Failed to update prompt:', error);
    }
  };

  return (
    <Box>
      {/* 头部操作栏 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">提示词管理</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleEdit()}
        >
          添加提示词
        </Button>
      </Box>

      {/* 提示词网格 */}
      <Grid container spacing={2}>
        {state.prompts.map((prompt) => (
          <Grid item xs={12} sm={6} md={4} key={prompt.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" noWrap gutterBottom>
                  {prompt.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 2,
                  }}
                >
                  {prompt.content}
                </Typography>
                
                {/* 标签 */}
                <Box sx={{ mb: 1 }}>
                  {prompt.tags.slice(0, 2).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                  {prompt.tags.length > 2 && (
                    <Chip
                      label={`+${prompt.tags.length - 2}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* 元信息 */}
                <Typography variant="caption" color="text.secondary">
                  版本: {prompt.version} • 使用: {prompt.metadata.usageCount} 次
                </Typography>
              </CardContent>
              
              <CardActions>
                <IconButton size="small" onClick={() => handleCopy(prompt)} title="复制">
                  <CopyIcon />
                </IconButton>
                <IconButton size="small" onClick={() => handleEdit(prompt)} title="编辑">
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleOpenVersionHistory(prompt)}
                  title="版本历史"
                >
                  <HistoryIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(prompt.id)}
                  title="删除"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 编辑对话框 */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPrompt ? '编辑提示词' : '添加提示词'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="标题"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="内容"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              margin="normal"
              multiline
              rows={6}
              required
            />
            
            <TextField
              fullWidth
              label="描述"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>分类</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="分类"
              >
                {state.categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Autocomplete
              multiple
              freeSolo
              options={state.tags.map(tag => tag.name)}
              value={formData.tags}
              onChange={(event, newValue) => {
                setFormData({ ...formData, tags: newValue });
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    key={index}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="标签"
                  placeholder="输入标签并按回车"
                  margin="normal"
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!formData.title || !formData.content}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 版本历史对话框 */}
      {selectedPromptForHistory && (
        <VersionHistory
          open={versionHistoryOpen}
          onClose={handleCloseVersionHistory}
          prompt={selectedPromptForHistory}
          onRestore={handleRestoreVersion}
          onUpdatePrompt={handleUpdatePrompt}
        />
      )}
    </Box>
  );
};

export default PromptManager;
