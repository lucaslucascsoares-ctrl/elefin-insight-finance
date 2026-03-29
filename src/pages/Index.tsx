import { useEffect, useMemo, useRef, useState } from 'react';
import { Accordion } from '@/components/ui/accordion';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardCarousel from '@/components/DashboardCarousel';
import MonthPicker from '@/components/MonthPicker';
import IdealComparison from '@/components/IdealComparison';
import InsightsAccordion from '@/components/InsightsAccordion';
import RecentTransactions from '@/components/RecentTransactions';
import NewTransactionModal from '@/components/NewTransactionModal';
import FAB from '@/components/FAB';
import PreviousMonthForecastCard from '@/components/PreviousMonthForecastCard';
import ProjectionMonthlySection from '@/components/projection/ProjectionMonthlySection';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { useMonthBalance, useEnsureMonthBalance } from '@/hooks/useMonthBalance';
import { useRecurringRules } from '@/hooks/useRecurringRules';
import { useProjectionTemplates } from '@/hooks/useProjectionTemplates';
import { useMonthlyProjectionItems } from '@/hooks/useMonthlyProjectionItems';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { usePaymentReminderNotifications } from '@/hooks/usePaymentReminderNotifications';
import { buildMonthlyForecastData } from '@/lib/forecast';
import { filterTransactionsByMonth, isDateBeforeMonth } from '@/lib/monthFilters';
import AuthPage from '@/pages/Auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MonthlyProjectionItem, RecurringRuleInput, Transaction } from '@/types/finance';

const getMonthName = (year: number, month: number) =>
  new Date(year, month, 1).toLocaleDateString('pt-BR', { month: 'long' });

const getMonthShortLabel = (year: number, month: number) =>
  new Date(year, month, 1)
    .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    .replace('.', '');

const getMonthPickerLabel = (year: number, month: number) =>
  new Date(year, month, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

const Index = () => {
  const { session, loading: authLoading, signOut } = useAuth();
  const userId = session?.user.id;
  const { preferences: notificationPreferences } = useNotificationPreferences(session);
  const {
    data: transactions = [],
    isLoading: txLoading,
    isError: txError,
    refetch: refetchTransactions,
  } = useTransactions(userId);
  const {
    data: categories = [],
    isLoading: catLoading,
    isError: catError,
    refetch: refetchCategories,
  } = useCategories(userId);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [modalLockedType, setModalLockedType] = useState(false);
  const attemptedMonthBalanceRef = useRef<Set<string>>(new Set());
  const { activeRules, saveRule, isLoading: recurringLoading } = useRecurringRules(userId);
  const { templates, isLoading: templatesLoading } = useProjectionTemplates(userId);

  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

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
  const maxFutureDate = useMemo(() => new Date(now.getFullYear(), now.getMonth() + 12, 1), [now]);
  const canGoNext = selectedDate < maxFutureDate;

  // ─── Caixa Inicial persistido ────────────────────────────────────────────
  const { data: monthBalance, isLoading: balanceLoading } = useMonthBalance(userId, selectedMonth, selectedYear);
  const ensureMonthBalance = useEnsureMonthBalance();

  const hasCriticalError = txError || catError;
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
      const isBefore = isDateBeforeMonth(t.date, selectedMonth, selectedYear);
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

    const monthBalanceKey = `${session.user.id}-${selectedYear}-${selectedMonth}`;
    if (attemptedMonthBalanceRef.current.has(monthBalanceKey)) return;
    attemptedMonthBalanceRef.current.add(monthBalanceKey);

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
  const {
    items: monthlyProjectionItems,
    saveOverride,
    clearOverride,
    isLoading: monthlyProjectionLoading,
  } = useMonthlyProjectionItems(
    userId,
    templates,
    selectedMonth,
    selectedYear,
  );
  const isViewingCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear;
  const { items: currentMonthProjectionItems = [] } = useMonthlyProjectionItems(userId, templates, currentMonth, currentYear, {
    enabled: !isViewingCurrentMonth,
  });
  const isLoading =
    authLoading ||
    (Boolean(session) &&
      (txLoading ||
        catLoading ||
        recurringLoading ||
        templatesLoading ||
        monthlyProjectionLoading ||
        balanceLoading));

  usePaymentReminderNotifications({
    session,
    items: isViewingCurrentMonth ? monthlyProjectionItems : currentMonthProjectionItems,
    preferences: notificationPreferences,
  });

  const forecastData = useMemo(
    () =>
      userId
        ? buildMonthlyForecastData({
            userId,
            transactions: normalizedTransactions,
            categories,
            recurringRules: activeRules,
            month: selectedMonth,
            year: selectedYear,
          })
        : null,
    [activeRules, categories, normalizedTransactions, selectedMonth, selectedYear, userId],
  );

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

  if (hasCriticalError) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Não foi possível carregar sua página</h1>
        <p className="text-sm text-muted-foreground">
          Houve uma falha ao buscar seus dados. Tente recarregar e verificar sua conexão.
        </p>
        <Button
          type="button"
          onClick={() => {
            void refetchTransactions();
            void refetchCategories();
          }}
          className="mx-auto w-full max-w-xs"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  const openTransactionModal = (type: 'income' | 'expense', lockedType = false) => {
    setModalType(type);
    setModalLockedType(lockedType);
    setModalOpen(true);
  };

  const handleSaveRecurringRule = async (input: RecurringRuleInput) => {
    await saveRule(input);
  };

  const handlePreviousMonth = () => {
    setSelectedDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      return next > maxFutureDate ? current : next;
    });
  };

  const handleSaveMonthEdit = async (item: MonthlyProjectionItem, title: string, amount: number) => {
    const baseTemplate = templates.find((template) => template.id === item.template_id);

    await saveOverride({
      templateId: item.template_id,
      month: selectedMonth,
      year: selectedYear,
      titleOverride: baseTemplate && title === baseTemplate.title ? null : title,
      amountOverride: baseTemplate && amount === baseTemplate.default_amount ? null : amount,
      status: 'edited',
    });
  };

  const handleIgnoreMonth = async (item: MonthlyProjectionItem) => {
    await saveOverride({
      templateId: item.template_id,
      month: selectedMonth,
      year: selectedYear,
      status: 'ignored',
    });
  };

  const handleRestoreMonth = async (item: MonthlyProjectionItem) => {
    await clearOverride(item.template_id, selectedMonth, selectedYear);
  };

  const handleMarkProjectionPaid = async (item: MonthlyProjectionItem, transactionId: string) => {
    await saveOverride({
      templateId: item.template_id,
      month: selectedMonth,
      year: selectedYear,
      status: 'paid',
      paidTransactionId: transactionId,
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
          <DashboardCarousel
            transactions={monthTransactions}
            categories={categories}
            projectedItems={monthlyProjectionItems}
            caixaInicial={caixaInicial}
            onOpenIncome={() => openTransactionModal('income', true)}
            onOpenExpense={() => openTransactionModal('expense', true)}
            onOpenGeneric={() => openTransactionModal('expense', false)}
          />
          <ProjectionMonthlySection
            items={monthlyProjectionItems}
            templates={templates}
            categories={categories}
            selectedDate={selectedDate}
            onSaveMonthEdit={handleSaveMonthEdit}
            onIgnoreMonth={handleIgnoreMonth}
            onRestoreMonth={handleRestoreMonth}
            onMarkPaid={handleMarkProjectionPaid}
          />
          <PreviousMonthForecastCard
            data={forecastData}
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
        selectedDate={selectedDate}
        onSaveRecurringRule={handleSaveRecurringRule}
      />
    </div>
  );
};

export default Index;
