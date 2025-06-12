import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  FileDownload as DownloadIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { Prompt, Category, Tag } from '../../../types';
import { useTranslation } from '../../../hooks/useTranslation';

export type ExportFormat = 'json' | 'markdown' | 'csv' | 'obsidian';

interface ExportItem {
  prompt: Prompt;
  version?: string; // 如果指定版本，则导出特定版本
  includeHistory: boolean; // 是否包含版本历史
}

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  prompts: Prompt[];
  categories: Category[];
  tags: Tag[];
  onExport: (items: ExportItem[], format: ExportFormat) => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  prompts,
  categories,
  tags,
  onExport,
}) => {
  const { t } = useTranslation();
  const [selectedItems, setSelectedItems] = useState<ExportItem[]>([]);
  const [format, setFormat] = useState<ExportFormat>('json');

  // 处理提示词选择
  const handlePromptSelect = (prompt: Prompt, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [
        ...prev,
        { prompt, includeHistory: true }
      ]);
    } else {
      setSelectedItems(prev => 
        prev.filter(item => item.prompt.id !== prompt.id)
      );
    }
  };

  // 处理版本选择
  const handleVersionSelect = (promptId: string, version: string) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.prompt.id === promptId 
          ? { ...item, version, includeHistory: false }
          : item
      )
    );
  };

  // 处理历史包含选项
  const handleHistoryToggle = (promptId: string, includeHistory: boolean) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.prompt.id === promptId 
          ? { ...item, includeHistory, version: includeHistory ? undefined : item.version }
          : item
      )
    );
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedItems.length === prompts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(prompts.map(prompt => ({
        prompt,
        includeHistory: true
      })));
    }
  };

  // 执行导出
  const handleExport = () => {
    if (selectedItems.length === 0) return;
    onExport(selectedItems, format);
    onClose();
  };

  // 检查提示词是否被选中
  const isPromptSelected = (promptId: string) => {
    return selectedItems.some(item => item.prompt.id === promptId);
  };

  // 获取选中的提示词项
  const getSelectedItem = (promptId: string) => {
    return selectedItems.find(item => item.prompt.id === promptId);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{t('exportData')}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* 导出格式选择 */}
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>导出格式</InputLabel>
            <Select
              value={format}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
              label="导出格式"
            >
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="markdown">Markdown</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="obsidian">Obsidian</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* 选择操作 */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            选择要导出的提示词 ({selectedItems.length}/{prompts.length})
          </Typography>
          <Button onClick={handleSelectAll} size="small">
            {selectedItems.length === prompts.length ? '取消全选' : '全选'}
          </Button>
        </Box>

        {/* 提示词列表 */}
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {prompts.map((prompt) => {
            const isSelected = isPromptSelected(prompt.id);
            const selectedItem = getSelectedItem(prompt.id);

            return (
              <Accordion key={prompt.id} expanded={isSelected}>
                <AccordionSummary>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handlePromptSelect(prompt, e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle1">{prompt.title}</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip label={prompt.version} size="small" sx={{ mr: 1 }} />
                          {prompt.tags.slice(0, 2).map(tag => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ mr: 0.5 }} />
                          ))}
                        </Box>
                      </Box>
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                </AccordionSummary>

                {isSelected && (
                  <AccordionDetails>
                    <Box sx={{ pl: 4 }}>
                      {/* 版本历史选项 */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedItem?.includeHistory || false}
                            onChange={(e) => handleHistoryToggle(prompt.id, e.target.checked)}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center" gap={1}>
                            <HistoryIcon fontSize="small" />
                            <Typography>包含完整版本历史</Typography>
                          </Box>
                        }
                      />

                      {/* 特定版本选择 */}
                      {!selectedItem?.includeHistory && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            选择特定版本：
                          </Typography>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={selectedItem?.version || prompt.version}
                              onChange={(e) => handleVersionSelect(prompt.id, e.target.value)}
                            >
                              {prompt.versions.map((version) => (
                                <MenuItem key={version.version} value={version.version}>
                                  {version.version}
                                  {version.version === prompt.version && ' (当前)'}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      )}

                      {/* 内容预览 */}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          内容预览：
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            backgroundColor: '#f5f5f5',
                            p: 1,
                            borderRadius: 1,
                            maxHeight: 100,
                            overflow: 'auto',
                            fontSize: '0.8rem'
                          }}
                        >
                          {prompt.content.substring(0, 200)}
                          {prompt.content.length > 200 && '...'}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionDetails>
                )}
              </Accordion>
            );
          })}
        </List>

        {prompts.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            没有可导出的提示词
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button 
          onClick={handleExport}
          variant="contained"
          disabled={selectedItems.length === 0}
          startIcon={<DownloadIcon />}
        >
          导出 ({selectedItems.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
