import { useEffect, useMemo, useState } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardCarousel from '@/components/DashboardCarousel';
import MonthPicker from '@/components/MonthPicker';
import ProjectionInlineForm from '@/components/projection/ProjectionInlineForm';
import ForecastDetailDashboard from '@/components/forecast/ForecastDetailDashboard';
import NewTransactionModal from '@/components/NewTransactionModal';
import FAB from '@/components/FAB';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { useRecurringRules } from '@/hooks/useRecurringRules';
import { useProjectionTemplates } from '@/hooks/useProjectionTemplates';
import { useMonthlyProjectionItems } from '@/hooks/useMonthlyProjectionItems';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { usePaymentReminderNotifications } from '@/hooks/usePaymentReminderNotifications';
import { buildMonthlyForecastData } from '@/lib/forecast';
import { filterTransactionsByMonth, isDateBeforeMonth } from '@/lib/monthFilters';
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
  const { session, userId, signOut } = useAuth();
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
  const [projectionModalOpen, setProjectionModalOpen] = useState(false);
  const [forecastDetailOpen, setForecastDetailOpen] = useState(false);
  const [forecastDetailDate, setForecastDetailDate] = useState<Date | null>(null);
  const { activeRules, saveRule, isLoading: recurringLoading } = useRecurringRules(userId);
  const { templates, addTemplate, deleteTemplate, isLoading: templatesLoading } = useProjectionTemplates(userId);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const [selectedDate, setSelectedDate] = useState(() => new Date(currentYear, currentMonth, 1));

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
  const maxFutureDate = useMemo(() => new Date(currentYear, currentMonth + 12, 1), [currentMonth, currentYear]);
  const canGoNext = selectedDate < maxFutureDate;

  // ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ Caixa Inicial persistido ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½

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

  // Caixa inicial = saldo acumulado de todas as transações anteriores ao mês.
  // Sempre recalculado para refletir lançamentos retroativos e meses futuros.
  const caixaInicial = useMemo(() => {
    return normalizedTransactions.reduce((sum, t) => {
      const isBefore = isDateBeforeMonth(t.date, selectedMonth, selectedYear);
      if (!isBefore) return sum;
      return sum + Number(t.amount) * (t.type === 'income' ? 1 : -1);
    }, 0);
  }, [normalizedTransactions, selectedMonth, selectedYear]);

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
  const isLoading = txLoading || catLoading || recurringLoading || templatesLoading || monthlyProjectionLoading;

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

  if (hasCriticalError) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold text-foreground">No foi possvel carregar sua p?gina</h1>
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

  const openProjectionModal = () => {
    setProjectionModalOpen(true);
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
    <div className="mx-auto flex h-dvh w-full max-w-[100vw] flex-col overflow-x-hidden overflow-y-hidden bg-background sm:max-w-lg">
      <DashboardHeader onSignOut={signOut} onNewTransaction={() => openTransactionModal('expense', false)} />
      <MonthPicker
        label={monthPickerLabel}
        canGoNext={canGoNext}
        onPrevious={handlePreviousMonth}
        onNext={handleNextMonth}
      />

      <div className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto pb-24 min-[380px]:pb-28 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isLoading ? (
          <div className="min-w-0 space-y-4 overflow-hidden px-3.5 min-[380px]:px-4">
            <Skeleton className="h-56 w-full rounded-[26px]" />
            <Skeleton className="h-16 w-full rounded-[20px]" />
            <Skeleton className="h-64 w-full rounded-[26px]" />
            <Skeleton className="h-72 w-full rounded-[26px]" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : (
          <div key={monthViewKey} className="min-w-0 overflow-hidden">
            <DashboardCarousel
              transactions={monthTransactions}
              categories={categories}
              projectedItems={monthlyProjectionItems}
              forecastData={forecastData}
              currentMonthLabel={currentMonthLabel}
              currentMonthShortLabel={currentMonthShortLabel}
              previousMonthShortLabel={previousMonthShortLabel}
              recurringRules={activeRules}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              caixaInicial={caixaInicial}
              onOpenGeneric={() => openTransactionModal('expense', false)}
              onOpenProjection={openProjectionModal}
              onOpenForecastDetail={() => {
                setForecastDetailDate(new Date());
                setForecastDetailOpen(true);
              }}
              onDeleteProjectionTemplate={async (templateId) => {
                await deleteTemplate(templateId);
              }}
            />
          </div>
        )}
      </div>

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

      <Dialog
        open={projectionModalOpen}
        onOpenChange={(open) => {
          setProjectionModalOpen(open);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border border-[#D6E1CC] bg-[linear-gradient(180deg,#FCFDF9,#F7FAF1)] text-[#314238] shadow-[0_18px_38px_rgba(92,134,109,0.12)] dark:border-[#263731] dark:bg-[linear-gradient(180deg,#111A17,#16211D)] dark:text-[#E6F2EE] dark:shadow-[0_18px_38px_rgba(3,10,8,0.45)] sm:max-w-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Projeção de Gastos</DialogTitle>
            <DialogDescription>Cadastre contas fixas para alimentar a aba de planejamento.</DialogDescription>
          </DialogHeader>

          <ProjectionInlineForm
            categories={categories}
            open={projectionModalOpen}
            onOpenChange={setProjectionModalOpen}
            onCancelEdit={() => {}}
            onSave={async (input) => {
              await addTemplate(input);
              setProjectionModalOpen(false);
            }}
            notificationPreferences={notificationPreferences}
            compactLayout
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={forecastDetailOpen}
        onOpenChange={(open) => {
          setForecastDetailOpen(open);
          if (!open) {
            setForecastDetailDate(null);
          } else if (!forecastDetailDate) {
            setForecastDetailDate(new Date());
          }
        }}
      >
        <DialogContent className="max-h-[92vh] w-[calc(100vw-0.75rem)] overflow-y-auto border border-border bg-card p-2 text-card-foreground shadow-[0_18px_38px_rgba(15,23,42,0.14)] dark:border-[#263731] dark:bg-[linear-gradient(180deg,#111A17,#16211D)] dark:text-[#E6F2EE] dark:shadow-[0_18px_38px_rgba(3,10,8,0.45)] min-[380px]:p-3 sm:max-w-3xl sm:p-6">
          <DialogHeader className="sr-only">
            <DialogTitle>Previsão detalhada do mês</DialogTitle>
            <DialogDescription>Dashboard detalhado da previsão até o fim do mês.</DialogDescription>
          </DialogHeader>

          {forecastDetailDate ? (
            <ForecastDetailDashboard
              transactions={monthTransactions}
              categories={categories}
              projectedItems={monthlyProjectionItems}
              recurringRules={activeRules}
              caixaInicial={caixaInicial}
              referenceDate={forecastDetailDate}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
