import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const AuthPage = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Verifique seu email para confirmar o cadastro.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm border-border/50 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">🐘</span>
            <span className="text-2xl font-bold tracking-tight text-foreground">elefin</span>
          </div>
          <CardTitle className="text-lg font-medium text-muted-foreground">
            {isLogin ? 'Entrar na sua conta' : 'Criar sua conta'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-12"
            />
            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? '...' : isLogin ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
