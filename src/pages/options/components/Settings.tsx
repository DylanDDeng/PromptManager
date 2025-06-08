import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  Divider,
  Alert,
  Paper,
} from '@mui/material';
import { useApp } from '../../../contexts/AppContext';
import { UserSettings } from '../../../types';

const Settings: React.FC = () => {
  const { state, actions } = useApp();
  const [settings, setSettings] = useState<UserSettings>(state.settings);
  const [saveMessage, setSaveMessage] = useState<string>('');

  // 更新设置
  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // 更新UI设置
  const updateUISetting = <K extends keyof UserSettings['ui']>(
    key: K,
    value: UserSettings['ui'][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      ui: { ...prev.ui, [key]: value }
    }));
  };

  // 保存设置
  const handleSave = async () => {
    try {
      await actions.saveSettings(settings);
      setSaveMessage('设置保存成功！');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('保存失败，请重试');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // 重置设置
  const handleReset = () => {
    if (window.confirm('确定要重置所有设置吗？')) {
      setSettings(state.settings);
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      const data = await actions.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        设置
      </Typography>

      {saveMessage && (
        <Alert 
          severity={saveMessage.includes('成功') ? 'success' : 'error'} 
          sx={{ mb: 2 }}
        >
          {saveMessage}
        </Alert>
      )}

      {/* 外观设置 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          外观设置
        </Typography>
        
        <FormControl fullWidth margin="normal">
          <InputLabel>主题</InputLabel>
          <Select
            value={settings.theme}
            onChange={(e) => updateSetting('theme', e.target.value as any)}
            label="主题"
          >
            <MenuItem value="light">浅色</MenuItem>
            <MenuItem value="dark">深色</MenuItem>
            <MenuItem value="auto">跟随系统</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>语言</InputLabel>
          <Select
            value={settings.language}
            onChange={(e) => updateSetting('language', e.target.value as any)}
            label="语言"
          >
            <MenuItem value="zh">中文</MenuItem>
            <MenuItem value="en">English</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* 编辑器设置 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          编辑器设置
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={settings.ui.showLineNumbers}
              onChange={(e) => updateUISetting('showLineNumbers', e.target.checked)}
            />
          }
          label="显示行号"
        />

        <FormControlLabel
          control={
            <Switch
              checked={settings.ui.wordWrap}
              onChange={(e) => updateUISetting('wordWrap', e.target.checked)}
            />
          }
          label="自动换行"
        />

        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>
            字体大小: {settings.ui.fontSize}px
          </Typography>
          <Slider
            value={settings.ui.fontSize}
            onChange={(e, value) => updateUISetting('fontSize', value as number)}
            min={12}
            max={20}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>
      </Paper>

      {/* 功能设置 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          功能设置
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>默认分类</InputLabel>
          <Select
            value={settings.defaultCategory}
            onChange={(e) => updateSetting('defaultCategory', e.target.value)}
            label="默认分类"
          >
            {state.categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={settings.autoBackup}
              onChange={(e) => updateSetting('autoBackup', e.target.checked)}
            />
          }
          label="自动备份"
        />
      </Paper>

      {/* 数据管理 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          数据管理
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant="outlined" onClick={handleExport}>
            导出数据
          </Button>
          <Button variant="outlined" component="label">
            导入数据
            <input
              type="file"
              hidden
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = async (event) => {
                    try {
                      const data = JSON.parse(event.target?.result as string);
                      await actions.importData(data);
                      setSaveMessage('数据导入成功！');
                      setTimeout(() => setSaveMessage(''), 3000);
                    } catch (error) {
                      setSaveMessage('导入失败，请检查文件格式');
                      setTimeout(() => setSaveMessage(''), 3000);
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary">
          当前数据统计：{state.prompts.length} 个提示词，{state.categories.length} 个分类
        </Typography>
      </Paper>

      <Divider sx={{ my: 2 }} />

      {/* 操作按钮 */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={handleReset}>
          重置
        </Button>
        <Button variant="contained" onClick={handleSave}>
          保存设置
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;
