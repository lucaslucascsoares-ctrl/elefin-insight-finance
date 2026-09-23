import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AppErrorBoundary from '@/components/AppErrorBoundary';
import { AuthProvider } from '@/components/AuthProvider';
import { ThemeProvider } from './hooks/useTheme.tsx';
import './index.css';

// Versões anteriores do service worker guardavam respostas do Supabase neste
// cache. Ele não é mais usado; removemos para limpar dados já salvos no aparelho.
if (typeof window !== 'undefined' && 'caches' in window) {
  window.caches.delete('supabase-api').catch(() => undefined);
}

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </AppErrorBoundary>,
);
