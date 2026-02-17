import { useState } from 'react';
import { Transaction, Category } from '@/types/finance';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
}

const RecentTransactions = ({ transactions, categories }: RecentTransactionsProps) => {
  const deleteTransaction = useDeleteTransaction();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteTransaction.mutate(deleteId, {
      onSuccess: () => toast.success('Transação excluída'),
      onError: () => toast.error('Erro ao excluir transação'),
    });
    setDeleteId(null);
  };

  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <AccordionItem value="transactions" className="border-border/50">
        <AccordionTrigger className="px-4 text-sm font-semibold text-foreground hover:no-underline">
          Transações do mês ({transactions.length})
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma transação neste mês.
            </p>
          ) : (
            <ul className="space-y-1">
              {sorted.map((t) => {
                const cat = categoryMap.get(t.category_id || '');
                const isIncome = t.type === 'income';
                return (
                  <li
                    key={t.id}
                    className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 group transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {t.description || cat?.name || 'Sem descrição'}
                        </span>
                        {cat && (
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
                            {cat.name}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-sm font-semibold ${isIncome ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(Number(t.amount))}
                      </span>
                      <button
                        onClick={() => setDeleteId(t.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        aria-label="Excluir transação"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </AccordionContent>
      </AccordionItem>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RecentTransactions;
