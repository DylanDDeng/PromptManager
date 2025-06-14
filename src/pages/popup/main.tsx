import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from '../../contexts/AppContext';
import { DynamicThemeProvider } from '../../components/common/ThemeProvider';
import ModernPopupApp from './ModernPopupApp';

// Popup页面的自定义样式
const popupStyles = {
  width: '400px',
  height: '600px',
  overflow: 'hidden',
};

const container = document.getElementById('popup-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AppProvider>
        <DynamicThemeProvider customStyles={popupStyles}>
          <ModernPopupApp />
        </DynamicThemeProvider>
      </AppProvider>
    </React.StrictMode>
  );
}
