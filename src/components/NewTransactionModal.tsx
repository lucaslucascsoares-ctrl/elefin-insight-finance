import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, GroupType, GROUP_LABELS } from '@/types/finance';
import { useAddTransaction } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface NewTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
}

const NewTransactionModal = ({ open, onOpenChange, categories }: NewTransactionModalProps) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const addTransaction = useAddTransaction();
  const { session } = useAuth();

  const groupedCategories = categories.reduce((acc, cat) => {
    if (!acc[cat.group_type]) acc[cat.group_type] = [];
    acc[cat.group_type].push(cat);
    return acc;
  }, {} as Record<GroupType, Category[]>);

  const handleSubmit = async () => {
    if (!session?.user?.id || !amount) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Informe um valor válido');
      return;
    }

    await addTransaction.mutateAsync({
      user_id: session.user.id,
      type,
      amount: parsedAmount,
      category_id: type === 'expense' && categoryId ? categoryId : null,
      description: description || null,
      date: new Date().toISOString().split('T')[0],
    });

    toast.success(type === 'income' ? 'Receita adicionada' : 'Despesa adicionada');
    setAmount('');
    setCategoryId('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Nova Movimentação</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Type Toggle */}
          <div className="flex rounded-lg bg-muted p-1">
            <button
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                type === 'income'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Entrada
            </button>
            <button
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                type === 'expense'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Saída
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Valor</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-14 text-2xl font-bold text-center"
              autoFocus
            />
          </div>

          {/* Category (only for expense) */}
          {type === 'expense' && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(groupedCategories) as GroupType[]).map((group) => (
                    <SelectGroup key={group}>
                      <SelectLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                        {GROUP_LABELS[group]}
                      </SelectLabel>
                      {groupedCategories[group]?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Descrição (opcional)</label>
            <Input
              placeholder="Ex: Almoço no restaurante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-12"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-12 text-base"
            disabled={addTransaction.isPending}
          >
            {addTransaction.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewTransactionModal;
