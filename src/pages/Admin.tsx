import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardHeader from '@/components/DashboardHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import {
  useAdminDeleteUser,
  useAdminDisableUser,
  useAdminStatus,
  useAdminUsers,
} from '@/hooks/useAdminPanel';
import { canAccessAdminShell } from '@/lib/adminAccess';

const formatDateTime = (value: string | null) => {
  if (!value) return 'Nunca';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Nunca';

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statCards = [
  {
    key: 'totalUsers',
    label: 'Total',
    helper: 'contas cadastradas',
    icon: Users,
    accent: 'text-[#314238] dark:text-[#E8EEE9]',
  },
  {
    key: 'activeUsers',
    label: 'Ativos',
    helper: 'com login registrado',
    icon: UserCheck,
    accent: 'text-[hsl(var(--success))] dark:text-[#4CD38A]',
  },
  {
    key: 'newUsersLast30Days',
    label: 'Novos 30d',
    helper: 'cadastros recentes',
    icon: UserPlus,
    accent: 'text-[#8A9A68] dark:text-[#ABBC82]',
  },
  {
    key: 'disabledUsers',
    label: 'Bloqueados',
    helper: 'contas desativadas',
    icon: UserX,
    accent: 'text-[#9B7A4B] dark:text-[#DDBB8A]',
  },
] as const;

const AdminPage = () => {
  const { signOut, user } = useAuth();
  const isMasterEmail = canAccessAdminShell(user?.email);
  const adminStatus = useAdminStatus(!isMasterEmail);
  const isAdmin = isMasterEmail || (adminStatus.data?.isAdmin ?? false);
  const adminUsers = useAdminUsers(isAdmin);
  const disableUser = useAdminDisableUser();
  const deleteUser = useAdminDeleteUser();
  const [pendingDeleteUserId, setPendingDeleteUserId] = useState<string | null>(null);

  const users = adminUsers.data?.users ?? [];
  const stats = adminUsers.data?.stats;

  const pendingDeleteUser = useMemo(
    () => users.find((item) => item.id === pendingDeleteUserId) ?? null,
    [pendingDeleteUserId, users],
  );

  const handleDisableToggle = async (userId: string, nextDisabled: boolean) => {
    try {
      await disableUser.mutateAsync({ userId, disabled: nextDisabled });
      toast.success(nextDisabled ? 'Conta desativada.' : 'Conta reativada.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível atualizar a conta.');
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteUserId) return;

    try {
      await deleteUser.mutateAsync({ userId: pendingDeleteUserId });
      toast.success('Conta excluída.');
      setPendingDeleteUserId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível excluir a conta.');
    }
  };

  if (!isMasterEmail && adminStatus.isLoading) {
    return (
      <div className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden bg-background">
        <DashboardHeader onSignOut={signOut} onNewTransaction={() => undefined} />
        <div className="flex flex-1 items-center justify-center px-4 text-sm text-muted-foreground">
          Carregando painel admin...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden bg-background">
      <DashboardHeader onSignOut={signOut} onNewTransaction={() => undefined} />

      <main className="flex-1 space-y-4 overflow-y-auto px-4 pb-24 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <section className="rounded-[30px] border border-[#D6E1CC] bg-[linear-gradient(180deg,#FCFDF9,#F2F6EA)] p-5 shadow-[0_18px_40px_rgba(92,134,109,0.12)] dark:border-[#233027] dark:bg-[linear-gradient(180deg,#152018,#111A14)] dark:shadow-[0_22px_48px_rgba(0,0,0,0.48)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C8D9BE] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8A9A68] shadow-sm dark:border-[#2A3D2E] dark:bg-[#0F1612] dark:text-[#ABBC82]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Master
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-[-0.04em] text-[#314238] dark:text-[#E8EEE9]">
                Painel admin
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#66766D] dark:text-[#94A39B]">
                Visualize os usuários cadastrados, acompanhe novos acessos e gerencie contas com segurança.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[22px] border border-[#E0E9D8] bg-white/70 px-4 py-3 text-sm text-[#314238] shadow-inner dark:border-[#233027] dark:bg-[#0F1612] dark:text-[#E8EEE9]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9B7A4B] dark:text-[#DDBB8A]">
              Conta conectada
            </p>
            <p className="mt-1 break-all font-semibold">{user?.email ?? 'admin'}</p>
          </div>
        </section>

        {adminStatus.isError ? (
          <Card className="rounded-[26px] border-destructive/20 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] dark:border-[#FF6B6B]/30 dark:bg-[linear-gradient(180deg,#1A1717,#141010)]">
            <CardContent className="flex items-start gap-3 px-5 py-5 text-sm text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <p>
                {adminStatus.error instanceof Error
                  ? adminStatus.error.message
                  : 'Não foi possível validar o acesso admin.'}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {isAdmin ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              {statCards.map((card) => {
                const Icon = card.icon;
                const value = stats?.[card.key] ?? 0;

                return (
                  <Card
                    key={card.key}
                    className="rounded-[24px] border border-[#D6E1CC] bg-white shadow-[0_12px_28px_rgba(92,134,109,0.10)] dark:border-[#233027] dark:bg-[linear-gradient(180deg,#152018,#111A14)] dark:shadow-[0_14px_30px_rgba(0,0,0,0.34)]"
                  >
                    <CardContent className="px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9B7A4B] dark:text-[#ABBC82]">
                          {card.label}
                        </p>
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF3E6] text-[#8A9A68] dark:bg-[#ABBC82]/15 dark:text-[#ABBC82]">
                          <Icon className="h-4 w-4" />
                        </span>
                      </div>
                      <p className={`mt-3 text-3xl font-bold tracking-tight ${card.accent}`}>{value}</p>
                      <p className="mt-1 text-xs text-[#66766D] dark:text-[#94A39B]">{card.helper}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="rounded-[30px] border border-[#D6E1CC] bg-[linear-gradient(180deg,#FCFDF9,#F2F6EA)] shadow-[0_18px_40px_rgba(92,134,109,0.12)] dark:border-[#233027] dark:bg-[linear-gradient(180deg,#152018,#111A14)] dark:shadow-[0_22px_48px_rgba(0,0,0,0.48)]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-[#314238] dark:text-[#E8EEE9]">
                  <Users className="h-5 w-5 text-[#8A9A68] dark:text-[#ABBC82]" />
                  Usuários cadastrados
                </CardTitle>
                <p className="text-sm text-[#66766D] dark:text-[#94A39B]">
                  Lista sincronizada com o Auth do Supabase no projeto mwus.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {adminUsers.isLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando usuários...</p>
                ) : null}

                {adminUsers.isError ? (
                  <p className="text-sm text-destructive">
                    {adminUsers.error instanceof Error
                      ? adminUsers.error.message
                      : 'Não foi possível listar os usuários.'}
                  </p>
                ) : null}

                {!adminUsers.isLoading && !adminUsers.isError && users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
                ) : null}

                {users.map((item) => {
                  const isCurrentUser = item.id === user?.id;

                  return (
                    <div
                      key={item.id}
                      className="rounded-[24px] border border-[#D6E1CC] bg-white px-4 py-4 shadow-[0_12px_24px_rgba(92,134,109,0.08)] dark:border-[#233027] dark:bg-[linear-gradient(180deg,#1A2820,#111A14)] dark:shadow-[0_12px_24px_rgba(0,0,0,0.28)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="break-all text-sm font-bold text-[#314238] dark:text-[#E8EEE9]">
                              {item.email}
                            </p>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                item.isDisabled
                                  ? 'bg-[#FDF0F0] text-[#E07070] dark:bg-[#FF6B6B]/15 dark:text-[#FF6B6B]'
                                  : 'bg-[#EEF3E6] text-[#8A9A68] dark:bg-[#4CD38A]/15 dark:text-[#4CD38A]'
                              }`}
                            >
                              {item.isDisabled ? 'Desativado' : 'Ativo'}
                            </span>
                            {isCurrentUser ? (
                              <span className="rounded-full bg-[#EDE1C5] px-2.5 py-1 text-[11px] font-semibold text-[#9B7A4B] dark:bg-[#DDBB8A]/15 dark:text-[#DDBB8A]">
                                Você
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-3 space-y-2 text-xs text-[#66766D] dark:text-[#94A39B]">
                            <p className="flex items-center gap-2">
                              <CalendarClock className="h-3.5 w-3.5" />
                              Cadastrado em {formatDateTime(item.createdAt)}
                            </p>
                            <p>Último login: {formatDateTime(item.lastSignInAt)}</p>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => void handleDisableToggle(item.id, !item.isDisabled)}
                            disabled={disableUser.isPending || isCurrentUser}
                            className="h-9 rounded-full border-[#C8D9BE] bg-white px-4 text-xs text-[#314238] hover:bg-[#EEF3E6] disabled:opacity-40 dark:border-[#233027] dark:bg-transparent dark:text-[#94A39B] dark:hover:border-[#ABBC82] dark:hover:text-[#ABBC82]"
                          >
                            {item.isDisabled ? 'Reativar' : 'Desativar'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPendingDeleteUserId(item.id)}
                            disabled={isCurrentUser}
                            className="h-9 rounded-full border-[#F4C4C4] bg-white px-4 text-xs text-[#E07070] hover:bg-[#FDF0F0] disabled:opacity-40 dark:border-[#FF6B6B]/30 dark:bg-transparent dark:text-[#FF6B6B] dark:hover:bg-[#FF6B6B]/10"
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </>
        ) : null}
      </main>

      <AlertDialog open={Boolean(pendingDeleteUser)} onOpenChange={(open) => !open && setPendingDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteUser
                ? `A conta ${pendingDeleteUser.email} será removida da plataforma. Esta ação não pode ser desfeita.`
                : 'Esta ação não pode ser desfeita.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPage;
