import { useEffect, useMemo, useState } from 'react';
import { Accordion } from '@/components/ui/accordion';
import DashboardHeader from '@/components/DashboardHeader';
import MonthPicker from '@/components/MonthPicker';
import IdealComparisonCard from '@/components/IdealComparisonCard';
import IdealComparison from '@/components/IdealComparison';
import InsightsAccordion from '@/components/InsightsAccordion';
import RecentTransactions from '@/components/RecentTransactions';
import NewTransactionModal from '@/components/NewTransactionModal';
import FAB from '@/components/FAB';
import FinanceMonthCard from '@/components/FinanceMonthCard';
import PreviousMonthForecastCard from '@/components/PreviousMonthForecastCard';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { useMonthBalance, useEnsureMonthBalance } from '@/hooks/useMonthBalance';
import AuthPage from '@/pages/Auth';
import { Skeleton } from '@/components/ui/skeleton';
import { DadosMesAnterior, Transaction } from '@/types/finance';

const getMonthName = (year: number, month: number) =>
  new Date(year, month, 1).toLocaleDateString('pt-BR', { month: 'long' });

const getMonthShortLabel = (year: number, month: number) =>
  new Date(year, month, 1)
    .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    .replace('.', '');

const getMonthPickerLabel = (year: number, month: number) =>
  new Date(year, month, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

const filterTransactionsByMonth = (transactions: Transaction[], month: number, year: number) =>
  transactions.filter((transaction) => {
    const safeDateValue =
      typeof transaction.date === 'string' ? transaction.date.slice(0, 10) : '';
    const date = new Date(`${safeDateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date.getMonth() === month && date.getFullYear() === year;
  });

const Index = () => {
  const { session, loading: authLoading, signOut } = useAuth();
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  const { data: categories = [], isLoading: catLoading } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [modalLockedType, setModalLockedType] = useState(false);

  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));

  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();
  const previousMonthDate = useMemo(() => new Date(selectedYear, selectedMonth - 1, 1), [selectedMonth, selectedYear]);

  const currentMonthLabel = useMemo(() => getMonthName(selectedYear, selectedMonth), [selectedMonth, selectedYear]);
  const currentMonthShortLabel = useMemo(
    () => getMonthShortLabel(selectedYear, selectedMonth),
    [selectedMonth, selectedYear],
  );
  const previousMonthLabel = useMemo(
    () => getMonthName(previousMonthDate.getFullYear(), previousMonthDate.getMonth()),
    [previousMonthDate],
  );
  const previousMonthShortLabel = useMemo(
    () => getMonthShortLabel(previousMonthDate.getFullYear(), previousMonthDate.getMonth()),
    [previousMonthDate],
  );
  const monthPickerLabel = useMemo(
    () => getMonthPickerLabel(selectedYear, selectedMonth),
    [selectedMonth, selectedYear],
  );
  const monthViewKey = `${selectedYear}-${selectedMonth}`;
  const canGoNext =
    selectedMonth !== now.getMonth() || selectedYear !== now.getFullYear();

  // ─── Caixa Inicial persistido ────────────────────────────────────────────
  const { data: monthBalance, isLoading: balanceLoading } = useMonthBalance(selectedMonth, selectedYear);
  const ensureMonthBalance = useEnsureMonthBalance();

  const isLoading = txLoading || catLoading || balanceLoading;
  const normalizedTransactions = useMemo(
    () =>
      transactions.map((transaction) => ({
        ...transaction,
        amount: Number(transaction.amount) || 0,
        date:
          typeof transaction.date === 'string' && transaction.date.length > 0
            ? transaction.date.slice(0, 10)
            : new Date().toISOString().split('T')[0],
      }))
      .filter(
        (transaction) =>
          (transaction.type === 'income' || transaction.type === 'expense') &&
          !Number.isNaN(new Date(`${transaction.date}T00:00:00`).getTime()),
      ),
    [transactions],
  );

  const monthTransactions = filterTransactionsByMonth(normalizedTransactions, selectedMonth, selectedYear);

  // Caixa inicial calculado a partir de todas as transações anteriores ao mês
  // Usado como fallback enquanto o registro do banco ainda não foi carregado,
  // e como valor para persistir na primeira vez que o mês é acessado.
  const computedCaixaInicial = useMemo(() => {
    return normalizedTransactions.reduce((sum, t) => {
      const date = new Date(`${t.date}T00:00:00`);
      if (Number.isNaN(date.getTime())) return sum;
      const isBefore =
        date.getFullYear() < selectedYear ||
        (date.getFullYear() === selectedYear && date.getMonth() < selectedMonth);
      if (!isBefore) return sum;
      return sum + Number(t.amount) * (t.type === 'income' ? 1 : -1);
    }, 0);
  }, [normalizedTransactions, selectedMonth, selectedYear]);

  // Persiste o caixa_inicial do mês na primeira vez que ele é acessado.
  // Se já existir registro no banco (monthBalance !== null), não faz nada.
  useEffect(() => {
    if (!session || txLoading || balanceLoading) return;
    if (monthBalance !== null && monthBalance !== undefined) return;
    if (ensureMonthBalance.isPending) return;

    ensureMonthBalance.mutate({
      user_id: session.user.id,
      mes: selectedMonth,
      ano: selectedYear,
      caixa_inicial: computedCaixaInicial,
    });
  }, [
    session,
    txLoading,
    balanceLoading,
    monthBalance,
    selectedMonth,
    selectedYear,
    computedCaixaInicial,
    // ensureMonthBalance omitido intencionalmente para evitar loop
  ]);

  // Fonte de verdade: valor do banco se existir, senão o valor calculado (antes de persistir)
  const caixaInicial = monthBalance?.caixa_inicial ?? computedCaixaInicial;

  const previousMonthTransactions = filterTransactionsByMonth(
    normalizedTransactions,
    previousMonthDate.getMonth(),
    previousMonthDate.getFullYear(),
  );

  const previousMonthData = useMemo<DadosMesAnterior | null>(() => {
    const previousExpenses = previousMonthTransactions.filter((transaction) => transaction.type === 'expense');

    if (previousExpenses.length === 0) {
      return null;
    }

    const categoryMap = new Map(categories.map((category) => [category.id, category]));
    const initialGroups = {
      Essenciais: 0,
      Desejos: 0,
      Prioridades: 0,
      Outros: 0,
    };

    const accumulateGroups = (sourceTransactions: Transaction[]) =>
      sourceTransactions.reduce((accumulator, transaction) => {
        if (transaction.type !== 'expense') return accumulator;

        const category = categoryMap.get(transaction.category_id || '');
        if (!category) {
          accumulator.Outros += Number(transaction.amount);
          return accumulator;
        }

        if (category.group_type === 'essenciais') accumulator.Essenciais += Number(transaction.amount);
        if (category.group_type === 'desejos') accumulator.Desejos += Number(transaction.amount);
        if (category.group_type === 'prioridades') accumulator.Prioridades += Number(transaction.amount);

        return accumulator;
      }, { ...initialGroups });

    const previousGroups = accumulateGroups(previousMonthTransactions);
    const currentGroups = accumulateGroups(monthTransactions);

    return {
      mes: previousMonthLabel,
      ano: previousMonthDate.getFullYear(),
      categorias: Object.entries(previousGroups).map(([nome, valorReal]) => ({
        nome,
        valorReal,
        previsaoMesAtual:
          currentGroups[nome as keyof typeof currentGroups] > 0
            ? currentGroups[nome as keyof typeof currentGroups]
            : valorReal,
      })),
      totalGasto: Object.values(previousGroups).reduce((sum, value) => sum + value, 0),
    };
  }, [categories, monthTransactions, previousMonthDate, previousMonthLabel, previousMonthTransactions]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-2xl">Elefin</div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  const openTransactionModal = (type: 'income' | 'expense', lockedType = false) => {
    setModalType(type);
    setModalLockedType(lockedType);
    setModalOpen(true);
  };

  const handlePreviousMonth = () => {
    setSelectedDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);

      return next > currentMonthDate ? current : next;
    });
  };

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background pb-24">
      <DashboardHeader onSignOut={signOut} onNewTransaction={() => openTransactionModal('expense', false)} />
      <MonthPicker
        label={monthPickerLabel}
        canGoNext={canGoNext}
        onPrevious={handlePreviousMonth}
        onNext={handleNextMonth}
      />

      {isLoading ? (
        <div className="space-y-4 px-4">
          <Skeleton className="h-56 w-full rounded-[26px]" />
          <Skeleton className="h-16 w-full rounded-[20px]" />
          <Skeleton className="h-64 w-full rounded-[26px]" />
          <Skeleton className="h-72 w-full rounded-[26px]" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ) : (
        <div key={monthViewKey}>
          <FinanceMonthCard
            transactions={monthTransactions}
            caixaInicial={caixaInicial}
            onOpenIncome={() => openTransactionModal('income', true)}
            onOpenExpense={() => openTransactionModal('expense', true)}
            onOpenGeneric={() => openTransactionModal('expense', false)}
          />
          <IdealComparisonCard transactions={monthTransactions} categories={categories} />
          <PreviousMonthForecastCard
            data={previousMonthData}
            currentMonthLabel={currentMonthLabel}
            currentMonthShortLabel={currentMonthShortLabel}
            previousMonthShortLabel={previousMonthShortLabel}
          />

          <Accordion type="multiple" defaultValue={['ideal', 'transactions']} className="mt-3">
            <IdealComparison transactions={monthTransactions} categories={categories} />
            <RecentTransactions transactions={monthTransactions} categories={categories} />
            <InsightsAccordion transactions={monthTransactions} categories={categories} />
          </Accordion>
        </div>
      )}

      <FAB onClick={() => openTransactionModal('expense', false)} />
      <NewTransactionModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setModalLockedType(false);
          }
        }}
        categories={categories}
        initialType={modalType}
        lockedType={modalLockedType}
      />
    </div>
  );
};

export default Index;
