import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AuthPage = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Verifique seu e-mail para confirmar o cadastro.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef2ff_35%,#f8fafc_70%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top,#0f172a_0%,#111827_42%,#020617_78%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(148,163,184,0.08),transparent_28%,rgba(226,232,240,0.35))] dark:bg-[linear-gradient(135deg,rgba(59,130,246,0.08),transparent_28%,rgba(15,23,42,0.3))]" />
      <div className="pointer-events-none absolute -left-16 top-20 h-40 w-40 rounded-full bg-slate-200/40 blur-3xl dark:bg-slate-700/30" />
      <div className="pointer-events-none absolute -right-12 bottom-16 h-44 w-44 rounded-full bg-slate-300/30 blur-3xl dark:bg-slate-600/20" />

      <Card className="relative w-full max-w-sm rounded-[30px] border-slate-200/70 bg-[rgba(255,255,255,0.92)] shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(15,23,42,0.82)] dark:shadow-[0_26px_60px_rgba(2,6,23,0.42)]">
        <CardHeader className="space-y-3 pb-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffffff,#f1f5f9)] shadow-[0_18px_32px_rgba(15,23,42,0.08)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] dark:shadow-[0_14px_26px_rgba(2,6,23,0.35)]">
            <span className="text-[1.7rem] font-bold leading-none tracking-[-0.06em] text-slate-800 dark:text-slate-100">e</span>
          </div>
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Elefin</p>
            <CardTitle className="mt-2 text-[1.15rem] font-semibold tracking-[-0.03em] text-foreground">
              {isLogin ? 'Entrar na sua conta' : 'Criar sua conta'}
            </CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isLogin
                ? 'Acompanhe seu mês, suas projeções e seus lembretes em um só lugar.'
                : 'Comece a organizar suas contas, projeções e lembretes com clareza.'}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-12 rounded-2xl border-slate-200/80 bg-white/85 dark:border-white/10 dark:bg-white/5"
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="h-12 rounded-2xl border-slate-200/80 bg-white/85 dark:border-white/10 dark:bg-white/5"
            />
            <Button type="submit" className="h-12 w-full rounded-2xl text-base font-semibold" disabled={loading}>
              {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mt-5 w-full text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
