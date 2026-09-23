import {
  Category,
  ForecastGroupType,
  GroupType,
  MonthlyProjectionItem,
  RecurringRule,
  Transaction,
} from '@/types/finance';
import { normalizeGroupType } from '@/lib/groupType';

export type ForecastDetailGroupKey = GroupType | 'sem-categoria';

export interface ForecastDetailSlice {
  key: ForecastDetailGroupKey;
  label: string;
  value: number;
  color: string;
}

export interface ForecastDetailLinePoint {
  dateKey: string;
  label: string;
  actualBalance: number | null;
  projectedBalance: number | null;
  isCurrentDay: boolean;
}

export interface ForecastDetailDashboardData {
  windowStartLabel: string;
  windowEndLabel: string;
  currentDayLabel: string;
  pieSlices: ForecastDetailSlice[];
  linePoints: ForecastDetailLinePoint[];
  currentBalance: number;
  projectedBalance: number;
  actualIncome: number;
  actualExpense: number;
  projectedIncome: number;
  projectedExpense: number;
  insightType: 'success' | 'warning';
  insightMessage: string;
}

const GROUP_COLORS: Record<ForecastDetailGroupKey, string> = {
  essenciais: '#6FB7A1',
  desejos: '#8BB7D4',
  prioridades: '#E3A86C',
  'sem-categoria': '#6B7F79',
};

const normalize = (value: string | null | undefined) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const startOfLocalDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

const formatMonthLabel = (date: Date) =>
  date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

const getGroupKey = (category: Category | null | undefined): ForecastDetailGroupKey => {
  if (!category) return 'sem-categoria';
  return normalizeGroupType(category.group_type, 'essenciais');
};

const clampDay = (day: number, monthEnd: Date) => Math.min(Math.max(day, 1), monthEnd.getDate());

const parseLocalDate = (value: string | null | undefined) => {
  if (!value) return null;
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getProjectionDueDate = (baseDay: number | null, referenceDate: Date) => {
  if (!baseDay) return startOfLocalDay(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const clamped = clampDay(baseDay, monthEnd);
  return new Date(referenceDate.getFullYear(), referenceDate.getMonth(), clamped);
};

/**
 * Data de referência da previsão detalhada para o mês selecionado no dashboard:
 * - mês atual: hoje (a leitura parte do dia em que o painel é aberto);
 * - mês passado: último dia do mês (tudo já realizado);
 * - mês futuro: primeiro dia do mês (tudo ainda previsto).
 */
export function getForecastDetailReferenceDate(month: number, year: number, today = new Date()) {
  const selected = year * 12 + month;
  const current = today.getFullYear() * 12 + today.getMonth();

  if (selected === current) return startOfLocalDay(today);
  if (selected < current) return new Date(year, month + 1, 0);
  return new Date(year, month, 1);
}

export function getForecastAnalysisWindow(referenceDate: Date) {
  const localDate = startOfLocalDay(referenceDate);
  const monthStart = startOfMonth(localDate);
  const monthEnd = endOfMonth(localDate);

  return {
    analysisDate: localDate,
    monthStart,
    monthEnd,
    windowStartLabel: formatMonthLabel(localDate),
    windowEndLabel: monthEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
    currentDayLabel: localDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', ''),
  };
}

const buildEventMap = () => new Map<string, number>();

const addEventValue = (map: Map<string, number>, dayKey: string, amount: number) => {
  map.set(dayKey, (map.get(dayKey) ?? 0) + amount);
};

export function buildForecastDetailDashboardData({
  transactions,
  categories,
  recurringRules,
  projectedItems,
  caixaInicial,
  referenceDate,
}: {
  transactions: Transaction[];
  categories: Category[];
  recurringRules: RecurringRule[];
  projectedItems: MonthlyProjectionItem[];
  caixaInicial: number;
  referenceDate: Date;
}): ForecastDetailDashboardData {
  const { analysisDate, monthStart, monthEnd, windowStartLabel, windowEndLabel, currentDayLabel } =
    getForecastAnalysisWindow(referenceDate);
  const safeCategories = categories.filter(Boolean);
  const safeTransactions = transactions.filter(Boolean);
  const safeRecurringRules = recurringRules.filter(Boolean);
  const safeProjectedItems = projectedItems.filter(Boolean);
  const categoryMap = new Map(safeCategories.map((category) => [category.id, category]));
  const monthKey = `${analysisDate.getFullYear()}-${analysisDate.getMonth()}`;

  const monthTransactions = safeTransactions.filter((transaction) => {
    const parsed = parseLocalDate(transaction.date);
    if (!parsed) return false;
    return parsed.getMonth() === analysisDate.getMonth() && parsed.getFullYear() === analysisDate.getFullYear();
  });

  const actualTransactions = monthTransactions.filter((transaction) => {
    const parsed = parseLocalDate(transaction.date);
    return parsed ? parsed <= analysisDate : false;
  });

  const actualIncome = actualTransactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const actualExpense = actualTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const projectedIncomeItems = safeProjectedItems.filter((item) => (item?.group_type ?? 'sem-categoria') !== 'sem-categoria' && Number(item?.amount ?? 0) > 0);
  const projectedExpenseItems = safeProjectedItems.filter((item) => (item?.group_type ?? 'sem-categoria') !== 'sem-categoria' && Number(item?.amount ?? 0) > 0);
  void projectedIncomeItems;
  void projectedExpenseItems;

  const futureExpenseEvents = buildEventMap();
  const futureIncomeEvents = buildEventMap();

  safeProjectedItems
    .filter((item) => item.status !== 'ignored')
    .forEach((item) => {
      const targetDay = getProjectionDueDate(item.due_day, referenceDate);
      const dayKey = targetDay.toISOString().slice(0, 10);
      const amount = Number(item.amount);
      if (item.title || amount >= 0) {
        if (targetDay <= analysisDate) {
          if (item?.group_type) {
            // already counted through actuals if paid, otherwise treat as current-day estimate
            addEventValue(futureExpenseEvents, analysisDate.toISOString().slice(0, 10), amount);
          }
        } else if (item.title) {
          if ((item as MonthlyProjectionItem)?.group_type && (item as MonthlyProjectionItem).status !== 'paid') {
            addEventValue((item as MonthlyProjectionItem & { type?: 'income' | 'expense' }).type === 'income' ? futureIncomeEvents : futureExpenseEvents, dayKey, amount);
          }
        }
      }
    });

  safeRecurringRules
    .filter((rule) => rule.active)
    .forEach((rule) => {
      const category = categoryMap.get(rule.category_id || '');
      const amount = Number(rule.amount);
      const ruleDate = parseLocalDate(rule.starts_at) ?? analysisDate;
      const dueDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), clampDay(ruleDate.getDate(), monthEnd));
      const dayKey = (dueDate <= analysisDate ? analysisDate : dueDate).toISOString().slice(0, 10);

      if (rule.type === 'income') {
        addEventValue(futureIncomeEvents, dayKey, amount);
      } else {
        addEventValue(futureExpenseEvents, dayKey, amount);
      }

      void category;
    });

  const actualByDay = new Map<string, number>();
  actualTransactions.forEach((transaction) => {
    const parsed = parseLocalDate(transaction.date);
    if (!parsed) return;
    const key = parsed.toISOString().slice(0, 10);
    const signed = transaction.type === 'income' ? Number(transaction.amount) : -Number(transaction.amount);
    addEventValue(actualByDay, key, signed);
  });

  const linePoints: ForecastDetailLinePoint[] = [];
  let actualRunning = caixaInicial;
  let projectedRunning = caixaInicial + actualIncome - actualExpense;
  let actualBalanceAtCurrentDay = projectedRunning;
  let projectedStarted = false;

  for (let cursor = new Date(monthStart); cursor <= monthEnd; cursor.setDate(cursor.getDate() + 1)) {
    const cursorKey = cursor.toISOString().slice(0, 10);
    actualRunning += actualByDay.get(cursorKey) ?? 0;

    if (cursor <= analysisDate) {
      actualBalanceAtCurrentDay = actualRunning;
    }

    if (cursor.getTime() === analysisDate.getTime()) {
      projectedRunning = actualRunning;
      projectedStarted = true;
    } else if (cursor > analysisDate) {
      projectedRunning += (futureIncomeEvents.get(cursorKey) ?? 0) - (futureExpenseEvents.get(cursorKey) ?? 0);
      projectedStarted = true;
    }

    linePoints.push({
      dateKey: cursorKey,
      label: formatDateLabel(cursor),
      actualBalance: cursor <= analysisDate ? actualRunning : null,
      projectedBalance: projectedStarted ? projectedRunning : null,
      isCurrentDay: cursor.getTime() === analysisDate.getTime(),
    });
  }

  const currentBalance = actualBalanceAtCurrentDay;
  const projectedIncome = actualIncome + Array.from(futureIncomeEvents.values()).reduce((sum, value) => sum + value, 0);
  const projectedExpense = actualExpense + Array.from(futureExpenseEvents.values()).reduce((sum, value) => sum + value, 0);
  const projectedBalance = currentBalance + (projectedIncome - actualIncome) - (projectedExpense - actualExpense);

  const pieExpenseTotals = new Map<ForecastDetailGroupKey, number>([
    ['essenciais', 0],
    ['desejos', 0],
    ['prioridades', 0],
    ['sem-categoria', 0],
  ]);

  const accountExpenseEntries = [
    ...actualTransactions.filter((transaction) => transaction.type === 'expense'),
    ...safeProjectedItems.filter((item) => item.status !== 'ignored' && item.type === 'expense'),
    ...safeRecurringRules.filter((rule) => rule.active && rule.type === 'expense'),
  ];

  accountExpenseEntries.forEach((entry) => {
    const category = categoryMap.get(entry.category_id || '');
    const groupKey = getGroupKey(category);
    const amount = Number(entry.amount);
    pieExpenseTotals.set(groupKey, (pieExpenseTotals.get(groupKey) ?? 0) + amount);
  });

  const pieSlices = Array.from(pieExpenseTotals.entries()).map(([key, value]) => ({
    key,
    label:
      key === 'essenciais'
        ? 'Essenciais'
        : key === 'desejos'
          ? 'Estilo de Vida'
          : key === 'prioridades'
            ? 'Prioridades Financeiras'
            : 'Sem categoria',
    value,
    color: GROUP_COLORS[key],
  }));

  const expenseRatio = projectedIncome > 0 ? projectedExpense / projectedIncome : 0;
  const projectedNet = projectedBalance;

  let insightType: ForecastDetailDashboardData['insightType'] = 'success';
  let insightMessage = 'A leitura continua estável até o fim do mês.';

  if (projectedNet < 0) {
    insightType = 'warning';
    insightMessage = 'A previsão indica saldo negativo até o fim do mês. Vale revisar as saídas mais pesadas.';
  } else if (expenseRatio >= 0.9) {
    insightType = 'warning';
    insightMessage = 'As saídas previstas já encostam na receita estimada. Há pouco espaço para novas despesas.';
  }

  return {
    windowStartLabel,
    windowEndLabel,
    currentDayLabel,
    pieSlices,
    linePoints,
    currentBalance,
    projectedBalance: projectedNet,
    actualIncome,
    actualExpense,
    projectedIncome,
    projectedExpense,
    insightType,
    insightMessage,
  };
}
