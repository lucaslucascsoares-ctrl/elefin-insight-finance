import {
  ReactNode,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext, type AuthContextValue } from '@/lib/authContext';
import {
  getAuthSnapshot,
  getAuthUserId,
  initializeAuthSession,
  subscribeAuthSession,
} from '@/lib/authSession';

const useAuthStore = () =>
  useSyncExternalStore(subscribeAuthSession, getAuthSnapshot, getAuthSnapshot);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthStore();

  useEffect(() => {
    void initializeAuthSession();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session: auth.session,
      user: auth.user,
      userId: getAuthUserId(auth.session, auth.user),
      isAuthenticated: Boolean(auth.session && auth.user),
      loading: auth.isLoading,
      authError: auth.error,
      signIn: async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
      },
      signUp: async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password });
        return { error };
      },
      updatePassword: async (password: string) => {
        const { error } = await supabase.auth.updateUser({ password });
        return { error };
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthLoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="animate-pulse text-2xl">Elefin</div>
  </div>
);
