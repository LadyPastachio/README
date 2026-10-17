import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/instrument-sans';
import '@fontsource-variable/jetbrains-mono';
import './design/tokens.css';
import './design/base.css';
import './features/pages.css';
import { createAppRouter } from './app/router';
import { SettingsProvider } from './core/settings/SettingsContext';
import { createLocalStorageAdapter } from './core/persistence/storage';
import { ToastProvider } from './app/Toast';

const storage = createLocalStorageAdapter();
const router = createAppRouter();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider storage={storage}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </SettingsProvider>
  </StrictMode>,
);
