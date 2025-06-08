import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip,
  TextField,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Restore as RestoreIcon,
  Compare as CompareIcon,
  Label as LabelIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Prompt, PromptVersion } from '../../../types';
import { versionService } from '../../../services/versionService';
import VersionDiff from './VersionDiff';

interface VersionHistoryProps {
  open: boolean;
  onClose: () => void;
  prompt: Prompt;
  onRestore: (version: string) => void;
  onUpdatePrompt: (updatedPrompt: Prompt) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({
  open,
  onClose,
  prompt,
  onRestore,
  onUpdatePrompt,
}) => {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showDiff, setShowDiff] = useState(false);
  const [labelingVersion, setLabelingVersion] = useState<string | null>(null);
  const [labelText, setLabelText] = useState('');

  // 获取排序后的版本历史
  const sortedVersions = versionService.getVersionHistory(prompt);

  // 选择版本进行对比
  const handleVersionSelect = (version: string) => {
    if (selectedVersions.includes(version)) {
      setSelectedVersions(selectedVersions.filter(v => v !== version));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, version]);
    } else {
      // 替换最后一个选择的版本
      setSelectedVersions([selectedVersions[0], version]);
    }
  };

  // 恢复到指定版本
  const handleRestore = async (version: string) => {
    if (window.confirm(`确定要恢复到版本 ${version} 吗？这将创建一个新版本。`)) {
      try {
        const targetVersion = prompt.versions.find(v => v.version === version);
        if (!targetVersion) return;

        // 创建新版本（基于目标版本）
        const newVersion = versionService.createVersion({
          ...prompt,
          title: targetVersion.title,
          content: targetVersion.content,
          description: targetVersion.description,
        }, `恢复到版本 ${version}`);

        const updatedPrompt: Prompt = {
          ...prompt,
          title: targetVersion.title,
          content: targetVersion.content,
          description: targetVersion.description,
          version: newVersion.version,
          versions: [...prompt.versions, newVersion],
          updatedAt: new Date(),
        };

        onUpdatePrompt(updatedPrompt);
        onRestore(version);
      } catch (error) {
        console.error('Failed to restore version:', error);
      }
    }
  };

  // 显示版本对比
  const handleShowDiff = () => {
    if (selectedVersions.length === 2) {
      setShowDiff(true);
    }
  };

  // 添加版本标签
  const handleAddLabel = async (version: string) => {
    if (!labelText.trim()) return;

    const updatedVersions = prompt.versions.map(v => {
      if (v.version === version) {
        return {
          ...v,
          label: labelText.trim(),
        };
      }
      return v;
    });

    const updatedPrompt = {
      ...prompt,
      versions: updatedVersions,
    };

    onUpdatePrompt(updatedPrompt);
    setLabelingVersion(null);
    setLabelText('');
  };

  // 格式化时间
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN');
  };

  // 获取版本对应的颜色
  const getVersionColor = (version: string) => {
    if (version === prompt.version) return 'primary';
    if (version.includes('.0.0')) return 'error'; // major
    if (version.includes('.0')) return 'warning'; // minor
    return 'default'; // patch
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">版本历史 - {prompt.title}</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedVersions.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              已选择 {selectedVersions.length} 个版本
              {selectedVersions.length === 2 && (
                <Button
                  size="small"
                  startIcon={<CompareIcon />}
                  onClick={handleShowDiff}
                  sx={{ ml: 2 }}
                >
                  对比版本
                </Button>
              )}
            </Alert>
          )}

          <List>
            {sortedVersions.map((version, index) => (
              <React.Fragment key={version.version}>
                <ListItem
                  button
                  selected={selectedVersions.includes(version.version)}
                  onClick={() => handleVersionSelect(version.version)}
                  sx={{
                    border: selectedVersions.includes(version.version) 
                      ? '2px solid #1976d2' 
                      : '1px solid #e0e0e0',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={version.version}
                          color={getVersionColor(version.version)}
                          size="small"
                        />
                        {version.version === prompt.version && (
                          <Chip label="当前" color="success" size="small" />
                        )}
                        {(version as any).label && (
                          <Chip 
                            label={(version as any).label} 
                            variant="outlined" 
                            size="small" 
                            icon={<LabelIcon />}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {version.changes || '无变更说明'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(version.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLabelingVersion(version.version);
                          setLabelText((version as any).label || '');
                        }}
                        title="添加标签"
                      >
                        <LabelIcon />
                      </IconButton>
                      
                      {version.version !== prompt.version && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(version.version);
                          }}
                          title="恢复到此版本"
                        >
                          <RestoreIcon />
                        </IconButton>
                      )}
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>

                {/* 版本详情展开 */}
                <Accordion sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2">查看版本内容</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        标题: {version.title}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        whiteSpace: 'pre-wrap',
                        backgroundColor: '#f5f5f5',
                        p: 2,
                        borderRadius: 1,
                        maxHeight: 200,
                        overflow: 'auto'
                      }}>
                        {version.content}
                      </Typography>
                      {version.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          描述: {version.description}
                        </Typography>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {index < sortedVersions.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setSelectedVersions([])}>
            清除选择
          </Button>
          <Button onClick={onClose}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* 版本对比对话框 */}
      {showDiff && selectedVersions.length === 2 && (
        <VersionDiff
          open={showDiff}
          onClose={() => setShowDiff(false)}
          prompt={prompt}
          version1={selectedVersions[0]}
          version2={selectedVersions[1]}
        />
      )}

      {/* 添加标签对话框 */}
      <Dialog
        open={labelingVersion !== null}
        onClose={() => {
          setLabelingVersion(null);
          setLabelText('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>为版本添加标签</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="标签名称"
            value={labelText}
            onChange={(e) => setLabelText(e.target.value)}
            placeholder="例如：重要版本、稳定版本、测试版本"
            margin="normal"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setLabelingVersion(null);
            setLabelText('');
          }}>
            取消
          </Button>
          <Button 
            onClick={() => labelingVersion && handleAddLabel(labelingVersion)}
            variant="contained"
            disabled={!labelText.trim()}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VersionHistory;
