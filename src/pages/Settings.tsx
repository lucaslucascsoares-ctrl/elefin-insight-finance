import { useState } from 'react';
import { Bell, LockKeyhole, ShieldCheck, Smartphone, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import DashboardHeader from '@/components/DashboardHeader';
import AuthPage from '@/pages/Auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { NotificationPreferences } from '@/types/finance';

const Settings = () => {
  const { session, loading, signOut, updatePassword } = useAuth();
  const { preferences, requestPushPermission, savePreferences } = useNotificationPreferences(session);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-2xl">Elefin</div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  const handlePasswordUpdate = async () => {
    if (password.length < 6) {
      toast.error('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('A confirmação da senha não confere.');
      return;
    }

    try {
      setSavingPassword(true);
      const { error } = await updatePassword(password);

      if (error) {
        toast.error(error.message);
        return;
      }

      setPassword('');
      setConfirmPassword('');
      toast.success('Senha redefinida com sucesso.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePreferencesChange = async (
    nextPreferences: NotificationPreferences,
    options?: { requestPermission?: boolean; successMessage?: string },
  ) => {
    try {
      setSavingNotifications(true);

      if (options?.requestPermission && nextPreferences.channels.push && nextPreferences.paymentRemindersEnabled) {
        const permission = await requestPushPermission();

        if (permission === 'denied') {
          toast.error('Permita notificações no navegador para receber os lembretes por push.');
        }

        if (permission === 'unsupported') {
          toast.error('Este navegador não oferece suporte a notificações push.');
        }
      }

      const { error } = await savePreferences(nextPreferences);

      if (error) {
        toast.error('Não foi possível salvar as preferências de notificações.');
        return;
      }

      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
    } finally {
      setSavingNotifications(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background pb-24">
      <DashboardHeader onSignOut={signOut} title="Configurações" />

      <div className="space-y-4 px-4 pb-6 pt-2">
        <Card className="rounded-[28px] border-border/70 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserRound className="h-5 w-5" />
              Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{session.user.email}</p>
            <p>Este é o e-mail usado para entrar na sua conta Elefin.</p>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/60 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
          <CardHeader className="space-y-3 pb-3">
            <CardTitle className="flex items-center gap-3 text-[1.05rem] font-semibold tracking-[-0.01em]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <Bell className="h-4 w-4" />
              </span>
              <span className="notranslate" translate="no">
                Preferências de notificações
              </span>
            </CardTitle>
            <p className="text-[0.95rem] leading-7 text-muted-foreground">
              Defina como o Elefin deve lembrar suas contas projetadas, sem alterar o status de pagamento.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            <div className="rounded-3xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(241,245,249,0.78))] px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[0.95rem] font-semibold tracking-[-0.01em] text-foreground notranslate" translate="no">
                    Ativar lembretes de pagamento
                  </p>
                  <p className="mt-1.5 text-[0.92rem] leading-7 text-muted-foreground">
                    As contas continuam pendentes até você marcar como pagas. O lembrete apenas avisa.
                  </p>
                </div>
                <Switch
                  checked={preferences.paymentRemindersEnabled}
                  disabled={savingNotifications}
                  onCheckedChange={(checked) =>
                    void handlePreferencesChange(
                      {
                        ...preferences,
                        paymentRemindersEnabled: Boolean(checked),
                      },
                      {
                        successMessage: checked
                          ? 'Lembretes de pagamento ativados.'
                          : 'Lembretes de pagamento desativados.',
                      },
                    )
                  }
                  aria-label="Ativar lembretes de pagamento"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] px-5 py-5">
              <p className="text-[0.92rem] font-semibold uppercase tracking-[0.14em] text-slate-500 notranslate" translate="no">
                Quando avisar
              </p>
              <div className="mt-4 space-y-2">
                <label className="flex items-center justify-between gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="text-[0.95rem] font-medium tracking-[-0.01em] text-foreground notranslate" translate="no">
                      Lembrar 2 dias antes
                    </p>
                    <p className="mt-1 text-[0.82rem] leading-6 text-muted-foreground">Ideal para contas que precisam de preparo.</p>
                  </div>
                  <Checkbox
                    checked={preferences.defaultDaysBefore.includes(2)}
                    disabled={savingNotifications || !preferences.paymentRemindersEnabled}
                    onCheckedChange={(checked) => {
                      const nextDays = checked ? [2] : [];
                      void handlePreferencesChange(
                        {
                          ...preferences,
                          defaultDaysBefore: nextDays,
                        },
                        {
                          successMessage: 'Preferência de aviso atualizada.',
                        },
                      );
                    }}
                  />
                </label>

                <label className="flex items-center justify-between gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="text-[0.95rem] font-medium tracking-[-0.01em] text-foreground notranslate" translate="no">
                      Lembrar no dia
                    </p>
                    <p className="mt-1 text-[0.82rem] leading-6 text-muted-foreground">Mostra o lembrete no próprio vencimento.</p>
                  </div>
                  <Checkbox
                    checked={preferences.defaultOnDueDate}
                    disabled={savingNotifications || !preferences.paymentRemindersEnabled}
                    onCheckedChange={(checked) =>
                      void handlePreferencesChange(
                        {
                          ...preferences,
                          defaultOnDueDate: Boolean(checked),
                        },
                        {
                          successMessage: 'Preferência de aviso atualizada.',
                        },
                      )
                    }
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] px-5 py-5">
              <p className="text-[0.92rem] font-semibold uppercase tracking-[0.14em] text-slate-500 notranslate" translate="no">
                Canal
              </p>
              <div className="mt-4 space-y-2">
                <label className="flex items-center justify-between gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-slate-50">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-2 text-[0.95rem] font-medium tracking-[-0.01em] text-foreground">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <Smartphone className="h-3.5 w-3.5" />
                      </span>
                      <span className="notranslate" translate="no">
                        Push
                      </span>
                    </span>
                    <p className="mt-2 text-[0.82rem] leading-6 text-muted-foreground">
                      Usa a permissão do navegador para mostrar lembretes do mês atual.
                    </p>
                  </div>
                  <Checkbox
                    checked={preferences.channels.push}
                    disabled={savingNotifications || !preferences.paymentRemindersEnabled}
                    onCheckedChange={(checked) =>
                      void handlePreferencesChange(
                        {
                          ...preferences,
                          channels: {
                            ...preferences.channels,
                            push: Boolean(checked),
                          },
                        },
                        {
                          requestPermission: Boolean(checked),
                          successMessage: 'Canal de push atualizado.',
                        },
                      )
                    }
                  />
                </label>

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-200 px-4 py-3 opacity-60">
                  <div className="min-w-0">
                    <p className="text-[0.95rem] font-medium text-muted-foreground notranslate" translate="no">
                      E-mail
                    </p>
                    <p className="mt-1 text-[0.82rem] text-muted-foreground">Preparado para uma próxima etapa.</p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                    Em breve
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/70 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LockKeyhole className="h-5 w-5" />
              Redefinir senha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nova senha"
              className="h-12"
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirmar nova senha"
              className="h-12"
            />
            <Button
              type="button"
              onClick={() => void handlePasswordUpdate()}
              disabled={savingPassword}
              className="h-12 w-full"
            >
              {savingPassword ? 'Salvando...' : 'Atualizar senha'}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/70 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5" />
              Como funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>O padrão global vale para as contas novas e para as contas sem configuração própria.</p>
            <p>Se uma conta tiver lembrete definido nela, essa configuração tem prioridade sobre o padrão global.</p>
            <p>O aviso não marca como pago, não altera o valor e não cria movimentação sozinho.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
