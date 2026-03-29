import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Projection from './pages/Projection';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30,
    },
  },
});

const MissingSupabaseConfig = () => (
  <div className="flex min-h-screen items-center justify-center bg-background px-4">
    <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
      <h1 className="text-2xl font-semibold text-foreground">Configuração incompleta</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        O projeto abriu sem as variáveis do Supabase. Para carregar a aplicação, adicione
        <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">VITE_SUPABASE_URL</code>
        e
        <code className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs">VITE_SUPABASE_PUBLISHABLE_KEY</code>
        em um arquivo <code className="rounded bg-muted px-1.5 py-0.5 text-xs">.env</code> na raiz do projeto.
      </p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {isSupabaseConfigured ? (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/projection" element={<Projection />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      ) : (
        <MissingSupabaseConfig />
      )}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
