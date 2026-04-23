import { useState } from 'react';
import { Transaction } from '@/types/finance';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAddTransaction } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface HeroSummaryProps {
  transactions: Transaction[];
}

const HeroSummary = ({ transactions }: HeroSummaryProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [adjustValue, setAdjustValue] = useState('');
  const addTransaction = useAddTransaction();
  const { userId } = useAuth();

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  const handleAdjust = async () => {
    if (!userId || !adjustValue) return;

    const targetBalance = parseFloat(adjustValue);
    const diff = targetBalance - balance;

    if (diff === 0) {
      setEditOpen(false);
      return;
    }

    await addTransaction.mutateAsync({
      user_id: userId,
      type: diff > 0 ? 'income' : 'expense',
      amount: Math.abs(diff),
      category_id: null,
      description: 'Ajuste de saldo',
      date: new Date().toISOString().split('T')[0],
    });

    toast.success('Saldo ajustado');
    setEditOpen(false);
    setAdjustValue('');
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <>
      <div className="px-4 py-6 animate-fade-in">
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border/50">
          <div className="flex justify-between text-sm text-muted-foreground mb-4">
            <span>Entrou: {formatCurrency(totalIncome)}</span>
            <span>Saiu: {formatCurrency(totalExpense)}</span>
          </div>
          <button
            onClick={() => {
              setAdjustValue(balance.toFixed(2));
              setEditOpen(true);
            }}
            className="w-full text-center group"
          >
            <p className="text-xs text-muted-foreground mb-1">Saldo</p>
            <p className={`balance-highlight transition-colors ${balance >= 0 ? 'text-foreground' : 'text-destructive'}`}>
              {formatCurrency(balance)}
            </p>
            <p className="text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Toque para ajustar
            </p>
          </button>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Ajustar Saldo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Saldo atual: {formatCurrency(balance)}
            </p>
            <Input
              type="number"
              step="0.01"
              placeholder="Novo saldo"
              value={adjustValue}
              onChange={(e) => setAdjustValue(e.target.value)}
              className="h-12 text-lg"
            />
            <Button onClick={handleAdjust} className="w-full h-12" disabled={addTransaction.isPending}>
              {addTransaction.isPending ? 'Salvando...' : 'Salvar Ajuste'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeroSummary;
