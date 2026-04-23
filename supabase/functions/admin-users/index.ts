import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const MASTER_ADMIN_EMAIL = 'lucas.lucascsoares@gmail.com';

type AdminAction = 'status' | 'list' | 'disable' | 'delete';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const isDisabledUser = (user: { banned_until?: string | null }) => {
  if (!user.banned_until) return false;
  const bannedUntil = new Date(user.banned_until);
  return !Number.isNaN(bannedUntil.getTime()) && bannedUntil.getTime() > Date.now();
};

const summarizeUsers = (
  users: Array<{ createdAt: string; lastSignInAt: string | null; isDisabled: boolean }>,
  now = new Date(),
) => {
  const threshold = new Date(now);
  threshold.setDate(threshold.getDate() - 30);

  return {
    totalUsers: users.length,
    activeUsers: users.filter((user) => Boolean(user.lastSignInAt) && !user.isDisabled).length,
    disabledUsers: users.filter((user) => user.isDisabled).length,
    newUsersLast30Days: users.filter((user) => new Date(user.createdAt) >= threshold).length,
  };
};

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authorization = request.headers.get('Authorization');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'Supabase environment is incomplete.' }, 500);
  }

  if (!authorization?.startsWith('Bearer ')) {
    return json({ error: 'Missing authorization token.' }, 401);
  }

  const token = authorization.replace('Bearer ', '').trim();

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user: currentUser },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !currentUser?.email) {
    return json({ error: 'Unauthorized.' }, 401);
  }

  const normalizedCurrentEmail = normalizeEmail(currentUser.email);

  if (normalizedCurrentEmail !== MASTER_ADMIN_EMAIL) {
    return json({ error: 'Forbidden.' }, 403);
  }

  const body = await request.json().catch(() => ({}));
  const action = body?.action as AdminAction | undefined;

  if (!action) {
    return json({ error: 'Missing action.' }, 400);
  }

  if (action === 'status') {
    return json({ isAdmin: true, email: normalizedCurrentEmail });
  }

  if (action === 'list') {
    const users: Array<{
      id: string;
      email: string;
      createdAt: string;
      lastSignInAt: string | null;
      isDisabled: boolean;
    }> = [];

    let page = 1;
    const perPage = 1000;

    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

      if (error) {
        return json({ error: error.message }, 500);
      }

      const pageUsers = (data?.users ?? [])
        .filter((user) => Boolean(user.email))
        .map((user) => ({
          id: user.id,
          email: user.email ?? '',
          createdAt: user.created_at,
          lastSignInAt: user.last_sign_in_at ?? null,
          isDisabled: isDisabledUser(user),
        }));

      users.push(...pageUsers);

      if (pageUsers.length < perPage) break;
      page += 1;
    }

    users.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

    return json({
      users,
      stats: summarizeUsers(users),
    });
  }

  const targetUserId = typeof body?.userId === 'string' ? body.userId : '';

  if (!targetUserId) {
    return json({ error: 'Missing target user id.' }, 400);
  }

  if (targetUserId === currentUser.id) {
    return json({ error: 'Você não pode alterar a própria conta admin por aqui.' }, 400);
  }

  if (action === 'disable') {
    const disabled = Boolean(body?.disabled);
    const { error } = await supabase.auth.admin.updateUserById(targetUserId, {
      ban_duration: disabled ? '876000h' : 'none',
    });

    if (error) {
      return json({ error: error.message }, 500);
    }

    return json({ success: true });
  }

  if (action === 'delete') {
    const { error } = await supabase.auth.admin.deleteUser(targetUserId, false);

    if (error) {
      return json({ error: error.message }, 500);
    }

    return json({ success: true });
  }

  return json({ error: 'Unsupported action.' }, 400);
});
