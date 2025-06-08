import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from '../../contexts/AppContext';
import { DynamicThemeProvider } from '../../components/common/ThemeProvider';
import OptionsApp from './OptionsApp';

const container = document.getElementById('options-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AppProvider>
        <DynamicThemeProvider>
          <OptionsApp />
        </DynamicThemeProvider>
      </AppProvider>
    </React.StrictMode>
  );
}
