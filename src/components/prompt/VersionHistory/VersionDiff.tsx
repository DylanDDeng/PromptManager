import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import { Prompt } from '../../../types';
import { versionService } from '../../../services/versionService';

interface VersionDiffProps {
  open: boolean;
  onClose: () => void;
  prompt: Prompt;
  version1: string;
  version2: string;
}

const VersionDiff: React.FC<VersionDiffProps> = ({
  open,
  onClose,
  prompt,
  version1,
  version2,
}) => {
  const v1 = prompt.versions.find(v => v.version === version1);
  const v2 = prompt.versions.find(v => v.version === version2);

  if (!v1 || !v2) {
    return null;
  }

  // 计算内容差异
  const contentDiff = versionService.calculateDiff(v1.content, v2.content);

  // 渲染差异行
  const renderDiffLine = (line: { type: 'added' | 'removed' | 'unchanged'; content: string }, index: number) => {
    let backgroundColor = 'transparent';
    let color = 'inherit';
    let prefix = '';

    switch (line.type) {
      case 'added':
        backgroundColor = '#e8f5e8';
        color = '#2e7d32';
        prefix = '+ ';
        break;
      case 'removed':
        backgroundColor = '#ffebee';
        color = '#d32f2f';
        prefix = '- ';
        break;
      case 'unchanged':
        backgroundColor = 'transparent';
        color = '#666';
        prefix = '  ';
        break;
    }

    return (
      <Box
        key={index}
        sx={{
          backgroundColor,
          color,
          padding: '2px 8px',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          borderLeft: line.type !== 'unchanged' ? `3px solid ${color}` : 'none',
        }}
      >
        {prefix}{line.content}
      </Box>
    );
  };

  // 格式化时间
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN');
  };

  // 获取版本颜色
  const getVersionColor = (version: string) => {
    if (version.includes('.0.0')) return 'error'; // major
    if (version.includes('.0')) return 'warning'; // minor
    return 'default'; // patch
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">版本对比</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* 版本信息对比 */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, backgroundColor: '#ffebee' }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Chip
                  label={v1.version}
                  color={getVersionColor(v1.version)}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  (旧版本)
                </Typography>
              </Box>
              <Typography variant="subtitle2" gutterBottom>
                {v1.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(v1.createdAt)}
              </Typography>
              {v1.changes && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  变更: {v1.changes}
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={6}>
            <Paper sx={{ p: 2, backgroundColor: '#e8f5e8' }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Chip
                  label={v2.version}
                  color={getVersionColor(v2.version)}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  (新版本)
                </Typography>
              </Box>
              <Typography variant="subtitle2" gutterBottom>
                {v2.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(v2.createdAt)}
              </Typography>
              {v2.changes && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  变更: {v2.changes}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* 标题对比 */}
        {v1.title !== v2.title && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              标题变更
            </Typography>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ 
                backgroundColor: '#ffebee', 
                color: '#d32f2f',
                p: 1,
                mb: 1,
                borderLeft: '3px solid #d32f2f'
              }}>
                - {v1.title}
              </Box>
              <Box sx={{ 
                backgroundColor: '#e8f5e8', 
                color: '#2e7d32',
                p: 1,
                borderLeft: '3px solid #2e7d32'
              }}>
                + {v2.title}
              </Box>
            </Paper>
          </Box>
        )}

        {/* 内容对比 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            内容变更
          </Typography>
          <Paper sx={{ 
            p: 0,
            maxHeight: 400,
            overflow: 'auto',
            border: '1px solid #e0e0e0'
          }}>
            {contentDiff.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                内容无变更
              </Box>
            ) : (
              contentDiff.map((line, index) => renderDiffLine(line, index))
            )}
          </Paper>
        </Box>

        {/* 描述对比 */}
        {(v1.description || v2.description) && v1.description !== v2.description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              描述变更
            </Typography>
            <Paper sx={{ p: 2 }}>
              {v1.description && (
                <Box sx={{ 
                  backgroundColor: '#ffebee', 
                  color: '#d32f2f',
                  p: 1,
                  mb: 1,
                  borderLeft: '3px solid #d32f2f'
                }}>
                  - {v1.description}
                </Box>
              )}
              {v2.description && (
                <Box sx={{ 
                  backgroundColor: '#e8f5e8', 
                  color: '#2e7d32',
                  p: 1,
                  borderLeft: '3px solid #2e7d32'
                }}>
                  + {v2.description}
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {/* 统计信息 */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            变更统计
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {contentDiff.filter(d => d.type === 'added').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    新增行
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="error.main">
                    {contentDiff.filter(d => d.type === 'removed').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    删除行
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="text.secondary">
                    {contentDiff.filter(d => d.type === 'unchanged').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    未变更行
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </Dialog>
  );
};

export default VersionDiff;
