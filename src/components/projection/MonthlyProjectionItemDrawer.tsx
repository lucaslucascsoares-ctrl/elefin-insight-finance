import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Category, MonthlyProjectionItem, ProjectionTemplate } from '@/types/finance';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddTransaction } from '@/hooks/useTransactions';
import { getTransactionDateForMonth } from '@/lib/transactionDates';

interface MonthlyProjectionItemDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MonthlyProjectionItem | null;
  template?: ProjectionTemplate | null;
  categories: Category[];
  selectedDate: Date;
  onSaveMonthEdit: (item: MonthlyProjectionItem, title: string, amount: number) => void;
  onIgnoreMonth: (item: MonthlyProjectionItem) => void;
  onRestoreMonth: (item: MonthlyProjectionItem) => void;
  onMarkPaid: (item: MonthlyProjectionItem, transactionId: string) => void;
}

const statusLabels = {
  predicted: 'Prevista',
  edited: 'Editada no mês',
  ignored: 'Ignorada no mês',
  paid: 'Paga',
} as const;

const MonthlyProjectionItemDrawer = ({
  open,
  onOpenChange,
  item,
  template,
  categories,
  selectedDate,
  onSaveMonthEdit,
  onIgnoreMonth,
  onRestoreMonth,
  onMarkPaid,
}: MonthlyProjectionItemDrawerProps) => {
  const addTransaction = useAddTransaction();
  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setAmount(`${item.amount}`);
  }, [item]);

  const categoryLabel = useMemo(() => {
    if (!item) return '--';
    return item.category_name ?? categories.find((category) => category.id === item.category_id)?.name ?? '--';
  }, [categories, item]);

  const handleSaveEdit = () => {
    if (!item) return;
    const numericAmount = Number(amount.replace(',', '.'));
    if (!title.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error('Informe um valor válido para o mês');
      return;
    }

    onSaveMonthEdit(item, title.trim(), numericAmount);
    setEditOpen(false);
    toast.success('Projeção ajustada só para este mês');
  };

  const handleMarkPaid = () => {
    if (!item) return;
    if (item.status === 'paid' && item.paid_transaction_id) {
      toast.message('Essa conta já foi marcada como paga');
      return;
    }

    addTransaction.mutate(
      {
        user_id: item.user_id,
        type: 'expense',
        amount: item.amount,
        category_id: item.category_id,
        description: item.title,
        date: getTransactionDateForMonth(selectedDate),
      },
      {
        onSuccess: (transaction) => {
          onMarkPaid(item, transaction.id);
          toast.success('Conta marcada como paga');
          onOpenChange(false);
        },
        onError: () => toast.error('Não foi possível marcar essa conta como paga'),
      },
    );
  };

  const canRestore = item?.status === 'ignored' || item?.status === 'edited';
  const originalAmount = template?.default_amount ?? item?.amount ?? 0;

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="rounded-t-[28px] border-border/60 bg-white">
          {item && (
            <>
              <DrawerHeader className="px-5 pt-5 text-left">
                <DrawerTitle className="break-words text-xl font-semibold text-foreground">{item.title}</DrawerTitle>
                <DrawerDescription className="break-words text-sm text-muted-foreground">
                  {categoryLabel} • {statusLabels[item.status]}
                </DrawerDescription>
              </DrawerHeader>

              <div className="space-y-4 px-5 pb-2">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Valor previsto</span>
                    <span>Base global</span>
                  </div>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="break-words text-2xl font-semibold text-foreground">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
                    </span>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(originalAmount)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Button type="button" className="h-12 rounded-2xl text-base font-semibold" onClick={handleMarkPaid}>
                    Marcar como pago
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 rounded-2xl text-base font-semibold"
                    onClick={() => setEditOpen(true)}
                  >
                    Editar só este mês
                  </Button>
                  {item.status !== 'ignored' ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 rounded-2xl border-amber-200 text-amber-700 hover:bg-amber-50"
                      onClick={() => {
                        onIgnoreMonth(item);
                        toast.success('Conta ignorada neste mês');
                        onOpenChange(false);
                      }}
                    >
                      Ignorar neste mês
                    </Button>
                  ) : null}
                  {canRestore ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-12 rounded-2xl text-base font-semibold text-muted-foreground"
                      onClick={() => {
                        onRestoreMonth(item);
                        toast.success('Conta restaurada para o padrão');
                        onOpenChange(false);
                      }}
                    >
                      Restaurar padrão
                    </Button>
                  ) : null}
                </div>
              </div>

              <DrawerFooter className="pb-5 pt-4">
                <Button type="button" variant="ghost" className="h-11 rounded-2xl" onClick={() => onOpenChange(false)}>
                  Fechar
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm rounded-[28px] border-border/60 bg-white p-0">
          <div className="px-6 py-6">
            <DialogHeader className="mb-5">
              <DialogTitle className="text-xl font-semibold text-foreground">Editar só este mês</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="month-item-title">Conta</Label>
                <Input
                  id="month-item-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="h-12 rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="month-item-amount">Valor</Label>
                <Input
                  id="month-item-amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="h-12 rounded-2xl"
                />
              </div>
            </div>

            <DialogFooter className="mt-6 flex-col gap-3 sm:flex-col">
              <Button type="button" className="h-12 rounded-2xl" onClick={handleSaveEdit}>
                Salvar ajuste
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MonthlyProjectionItemDrawer;
