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
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
}

const RecentTransactions = ({ transactions, categories }: RecentTransactionsProps) => {
  const deleteTransaction = useDeleteTransaction();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const handleDelete = () => {
    if (!deleteId) return;

    deleteTransaction.mutate(deleteId, {
      onSuccess: () => toast.success('Transação excluída'),
      onError: () => toast.error('Erro ao excluir transação'),
    });

    setDeleteId(null);
  };

  const sortedTransactions = [...transactions].sort(
    (first, second) =>
      new Date(`${second.date}T00:00:00`).getTime() - new Date(`${first.date}T00:00:00`).getTime(),
  );

  return (
    <>
      <AccordionItem value="transactions" className="border-border/50 dark:border-[#263731]">
        <AccordionTrigger className="px-4 text-sm font-semibold text-foreground hover:no-underline">
          Transações do mês
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          {sortedTransactions.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhuma transação neste mês.
            </p>
          ) : (
            <ul className="space-y-1">
              {sortedTransactions.map((transaction) => {
                const category = categoryMap.get(transaction.category_id || '');
                const isIncome = transaction.type === 'income';

                return (
                  <li
                    key={transaction.id}
                  className="group flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-muted/50 dark:hover:bg-[#1B2823]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {transaction.description || category?.name || 'Sem descrição'}
                        </span>
                        {category && (
                          <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground dark:bg-[#1B2823] dark:text-[#B8CBC3]">
                            {category.name}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(transaction.date)}</span>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          isIncome ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(Number(transaction.amount))}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDeleteId(transaction.id)}
                        className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 dark:hover:bg-[#3A2A24]"
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
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RecentTransactions;
