import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  IconButton,
  Typography,
  Autocomplete,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useApp } from '../../../contexts/AppContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { v4 as uuidv4 } from 'uuid';

interface AddPromptDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

const AddPromptDialog: React.FC<AddPromptDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { state, actions } = useApp();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    category: '',
    tags: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (open) {
      setFormData({
        title: '',
        content: '',
        category: state.categories[0]?.id || '',
        tags: [],
      });
    }
  }, [open, state.categories]);

  // 处理表单提交
  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const initialVersion = {
        version: 'v1.0.0',
        content: formData.content,
        title: formData.title,
        description: '',
        createdAt: now,
        changes: t('initialVersion'),
      };

      const newPrompt = {
        id: uuidv4(),
        title: formData.title,
        content: formData.content,
        description: '',
        category: formData.category,
        tags: formData.tags,
        variables: [],
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

      await actions.savePrompt(newPrompt);
      
      // 成功后重置表单并关闭对话框
      setFormData({
        title: '',
        content: '',
        category: state.categories[0]?.id || '',
        tags: [],
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to save prompt:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理关闭
  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        content: '',
        category: state.categories[0]?.id || '',
        tags: [],
      });
      onClose();
    }
  };

  // 检查表单是否有效
  const isFormValid = formData.title.trim() && formData.content.trim();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          m: 1,
          maxHeight: 'calc(100vh - 16px)',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{t('addPrompt')}</Typography>
          <IconButton
            onClick={handleClose}
            size="small"
            disabled={isSubmitting}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {/* 标题输入 */}
          <TextField
            fullWidth
            label={t('promptTitle')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
            disabled={isSubmitting}
            placeholder="例如：写作助手、代码审查..."
          />

          {/* 内容输入 */}
          <TextField
            fullWidth
            label={t('promptContent')}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            margin="normal"
            multiline
            rows={4}
            required
            disabled={isSubmitting}
            placeholder="请输入提示词内容..."
          />

          {/* 分类选择 */}
          <FormControl fullWidth margin="normal" disabled={isSubmitting}>
            <InputLabel>{t('promptCategory')}</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              label={t('promptCategory')}
            >
              {state.categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 标签输入 */}
          <Autocomplete
            multiple
            freeSolo
            options={state.tags.map(tag => tag.name)}
            value={formData.tags}
            onChange={(event, newValue) => {
              setFormData({ ...formData, tags: newValue });
            }}
            disabled={isSubmitting}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  size="small"
                  {...getTagProps({ index })}
                  key={index}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('promptTags')}
                placeholder={t('tagsPlaceholder')}
                margin="normal"
              />
            )}
            sx={{ mt: 2 }}
          />

          {/* 提示信息 */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            💡 提示：创建后可以在设置页面进行更详细的编辑
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose}
          disabled={isSubmitting}
        >
          {t('cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid || isSubmitting}
          startIcon={isSubmitting ? undefined : <AddIcon />}
        >
          {isSubmitting ? '保存中...' : t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPromptDialog;
