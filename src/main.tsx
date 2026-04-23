import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AppErrorBoundary from '@/components/AppErrorBoundary';
import { AuthProvider } from '@/components/AuthProvider';
import { ThemeProvider } from './hooks/useTheme.tsx';
import './index.css';

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </AppErrorBoundary>,
);
