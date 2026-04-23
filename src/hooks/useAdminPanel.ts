import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminUserRecord, summarizeAdminUsers } from '@/lib/adminAccess';

type AdminStatusResponse = {
  isAdmin: boolean;
  email?: string;
};

type AdminListResponse = {
  users: AdminUserRecord[];
  stats?: {
    totalUsers: number;
    activeUsers: number;
    disabledUsers: number;
    newUsersLast30Days: number;
  };
};

const invokeAdmin = async <T>(payload: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke('admin-users', {
    body: payload,
  });

  if (error) {
    throw new Error(error.message || 'Não foi possível acessar o painel admin.');
  }

  return data as T;
};

export const useAdminStatus = (enabled = true) =>
  useQuery({
    queryKey: ['admin-status'],
    queryFn: () => invokeAdmin<AdminStatusResponse>({ action: 'status' }),
    enabled,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

export const useAdminUsers = (enabled: boolean) =>
  useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await invokeAdmin<AdminListResponse>({ action: 'list' });
      const users = response.users ?? [];
      return {
        users,
        stats: response.stats ?? summarizeAdminUsers(users),
      };
    },
    enabled,
    retry: false,
    staleTime: 1000 * 30,
  });

export const useAdminDisableUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, disabled }: { userId: string; disabled: boolean }) =>
      invokeAdmin<{ success: boolean }>({ action: 'disable', userId, disabled }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

export const useAdminDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      invokeAdmin<{ success: boolean }>({ action: 'delete', userId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};
