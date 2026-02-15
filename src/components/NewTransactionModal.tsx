import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, GroupType, GROUP_LABELS } from '@/types/finance';
import { useAddTransaction } from '@/hooks/useTransactions';
import { useAddCategory, useDeleteCategory } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Plus, X, Trash2 } from 'lucide-react';

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
  const [addingGroup, setAddingGroup] = useState<GroupType | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const addTransaction = useAddTransaction();
  const addCategory = useAddCategory();
  const deleteCategory = useDeleteCategory();
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

  const handleAddCategory = async (group: GroupType) => {
    if (!session?.user?.id || !newCatName.trim()) return;

    try {
      await addCategory.mutateAsync({
        name: newCatName.trim(),
        group_type: group,
        user_id: session.user.id,
      });
      toast.success('Categoria criada');
      setNewCatName('');
      setAddingGroup(null);
    } catch {
      toast.error('Erro ao criar categoria');
    }
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
                <SelectContent className="max-h-48">
                  {(Object.keys(GROUP_LABELS) as GroupType[]).map((group) => (
                    <SelectGroup key={group}>
                      <SelectLabel className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground pr-2">
                        <span>{GROUP_LABELS[group]}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAddingGroup(group);
                          }}
                          className="rounded-full p-0.5 hover:bg-accent transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </SelectLabel>
                      {groupedCategories[group]?.map((cat) => (
                        <div key={cat.id} className="flex items-center group">
                          <SelectItem value={cat.id} className="flex-1">
                            {cat.name}
                          </SelectItem>
                          {cat.user_id && (
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (categoryId === cat.id) setCategoryId('');
                                try {
                                  await deleteCategory.mutateAsync(cat.id);
                                  toast.success('Categoria removida');
                                } catch {
                                  toast.error('Erro ao remover categoria');
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 mr-1 rounded hover:bg-destructive/10 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </button>
                          )}
                        </div>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>

              {/* Inline add category */}
              {addingGroup && (
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    placeholder={`Nova em ${GROUP_LABELS[addingGroup]}`}
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="h-9 text-sm flex-1"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory(addingGroup)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 px-2"
                    onClick={() => handleAddCategory(addingGroup)}
                    disabled={addCategory.isPending}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 px-2"
                    onClick={() => { setAddingGroup(null); setNewCatName(''); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
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
