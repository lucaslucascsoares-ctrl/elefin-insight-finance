import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';

type AuthSnapshot = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  initialized: boolean;
  error: string | null;
};

type AuthListener = () => void;

const listeners = new Set<AuthListener>();

let snapshot: AuthSnapshot = {
  session: null,
  user: null,
  isLoading: isSupabaseConfigured,
  initialized: false,
  error: null,
};

let initializePromise: Promise<void> | null = null;
let unsubscribeAuthListener: (() => void) | null = null;

const debugAuth = (stage: string, details?: Record<string, unknown>) => {
  if (!import.meta.env.DEV) return;
  console.info('[auth]', stage, details ?? {});
};

const emitSnapshot = () => {
  listeners.forEach((listener) => listener());
};

const setSnapshot = (next: Partial<AuthSnapshot>) => {
  snapshot = { ...snapshot, ...next };
  emitSnapshot();
};

const resolveUser = async (session: Session | null) => {
  if (!session?.access_token) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser(session.access_token);

  if (error) {
    debugAuth('getUser:error', { message: error.message });
    return null;
  }

  return data.user ?? null;
};

const syncSnapshot = async (session: Session | null, source: string) => {
  setSnapshot({
    session,
    isLoading: true,
    error: null,
  });

  try {
    const user = await resolveUser(session);

    setSnapshot({
      session,
      user,
      isLoading: false,
      initialized: true,
      error: null,
    });

    debugAuth('sync:ready', {
      source,
      hasSession: Boolean(session),
      hasUser: Boolean(user),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown auth error';

    setSnapshot({
      session,
      user: null,
      isLoading: false,
      initialized: true,
      error: message,
    });

    debugAuth('sync:failed', { source, message });
  }
};

export const initializeAuthSession = () => {
  if (!isSupabaseConfigured) {
    setSnapshot({
      session: null,
      user: null,
      isLoading: false,
      initialized: true,
      error: null,
    });
    return Promise.resolve();
  }

  if (!unsubscribeAuthListener) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      debugAuth('state-change', { event, hasSession: Boolean(session) });
      void syncSnapshot(session, `auth:${event}`);
    });

    unsubscribeAuthListener = () => subscription.unsubscribe();
  }

  if (initializePromise) {
    return initializePromise;
  }

  debugAuth('bootstrap:start');

  initializePromise = supabase.auth
    .getSession()
    .then(({ data: { session } }) => syncSnapshot(session, 'bootstrap'))
    .catch((error) => {
      const message = error instanceof Error ? error.message : 'Unable to read session';

      setSnapshot({
        session: null,
        user: null,
        isLoading: false,
        initialized: true,
        error: message,
      });

      debugAuth('bootstrap:failed', { message });
    })
    .finally(() => {
      initializePromise = null;
    });

  return initializePromise;
};

export const subscribeAuthSession = (listener: AuthListener) => {
  listeners.add(listener);
  void initializeAuthSession();

  return () => {
    listeners.delete(listener);
  };
};

export const getAuthSnapshot = () => snapshot;

export const waitForAuthSession = async () => {
  await initializeAuthSession();
  return getAuthSnapshot();
};

export const getUser = async () => {
  const current = await waitForAuthSession();
  return current.user;
};

export const getAuthUser = (session: Session | null | undefined, fallbackUser?: User | null) => {
  if (fallbackUser) {
    return fallbackUser;
  }

  const user = session?.user as (User & { __isUserNotAvailableProxy?: boolean }) | undefined;

  if (!user || user.__isUserNotAvailableProxy) {
    return null;
  }

  return user;
};

export const getAuthUserId = (session: Session | null | undefined, fallbackUser?: User | null) =>
  getAuthUser(session, fallbackUser)?.id ?? '';

if (typeof window !== 'undefined') {
  void initializeAuthSession();
}

export { supabase };
