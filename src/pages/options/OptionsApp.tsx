import React, { useState } from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { useApp } from '../../contexts/AppContext';
import PromptManager from './components/PromptManager';
import Settings from './components/Settings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const OptionsApp: React.FC = () => {
  const { state } = useApp();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* 顶部工具栏 */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Prompt Manager - 设置
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Paper elevation={1}>
          {/* 标签页 */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="options tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="提示词管理" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="设置" id="tab-1" aria-controls="tabpanel-1" />
          </Tabs>

          {/* 提示词管理面板 */}
          <TabPanel value={tabValue} index={0}>
            <PromptManager />
          </TabPanel>

          {/* 设置面板 */}
          <TabPanel value={tabValue} index={1}>
            <Settings />
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default OptionsApp;
