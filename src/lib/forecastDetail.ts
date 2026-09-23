import {
  Category,
  ForecastItem,
  GroupType,
  MonthlyForecastData,
  RecurringRule,
  Transaction,
} from '@/types/finance';
import { normalizeGroupType } from '@/lib/groupType';

export type ForecastDetailGroupKey = GroupType | 'sem-categoria';
export type ForecastDetailMode = 'past' | 'current' | 'future';

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
  mode: ForecastDetailMode;
  windowStartLabel: string;
  windowEndLabel: string;
  windowDescription: string;
  currentBalanceLabel: string;
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

const GROUP_LABELS: Record<ForecastDetailGroupKey, string> = {
  essenciais: 'Essenciais',
  desejos: 'Estilo de Vida',
  prioridades: 'Prioridades Financeiras',
  'sem-categoria': 'Sem categoria',
};

const startOfLocalDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const toDayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

const formatLongDate = (date: Date) =>
  date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

const parseLocalDate = (value: string | null | undefined) => {
  if (!value) return null;
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Janela analisada pela previsão detalhada para o mês selecionado no dashboard:
 * - mês atual: de hoje até o fim do mês, com o realizado até hoje;
 * - mês passado: o mês inteiro, tudo já realizado;
 * - mês futuro: o mês inteiro, tudo ainda previsto.
 */
export function getForecastDetailWindow(month: number, year: number, today = new Date()) {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const selected = year * 12 + month;
  const current = today.getFullYear() * 12 + today.getMonth();
  const mode: ForecastDetailMode = selected === current ? 'current' : selected < current ? 'past' : 'future';
  const realizedUntil = mode === 'current' ? startOfLocalDay(today) : mode === 'past' ? monthEnd : null;
  const windowStart = mode === 'current' ? startOfLocalDay(today) : monthStart;

  return {
    mode,
    monthStart,
    monthEnd,
    realizedUntil,
    windowStartLabel: formatLongDate(windowStart),
    windowEndLabel: formatLongDate(monthEnd),
  };
}

const WINDOW_DESCRIPTIONS: Record<ForecastDetailMode, string> = {
  current: 'Combina o que já foi lançado até hoje com o que ainda está previsto até o fim do mês.',
  past: 'Mês encerrado: os valores mostram o que foi lançado no período.',
  future: 'Mês futuro: tudo ainda é previsão, com base no mês anterior e nas recorrências.',
};

const CURRENT_BALANCE_LABELS: Record<ForecastDetailMode, string> = {
  current: 'Saldo atual',
  past: 'Saldo final',
  future: 'Caixa inicial',
};

const getItemDueDay = (
  item: ForecastItem,
  transactionsById: Map<string, Transaction>,
  rulesById: Map<string, RecurringRule>,
) => {
  const reference = item.recurring_rule_id
    ? parseLocalDate(rulesById.get(item.recurring_rule_id)?.starts_at)
    : item.reference_transaction_id
      ? parseLocalDate(transactionsById.get(item.reference_transaction_id)?.date)
      : null;

  return reference?.getDate() ?? 1;
};

const toDetailGroup = (groupType: ForecastItem['group_type'] | null | undefined): ForecastDetailGroupKey =>
  !groupType || groupType === 'outros' ? 'sem-categoria' : groupType;

export function buildForecastDetailDashboardData({
  forecastData,
  transactions,
  categories,
  recurringRules,
  caixaInicial,
  month,
  year,
  today = new Date(),
}: {
  forecastData: MonthlyForecastData | null;
  transactions: Transaction[];
  categories: Category[];
  recurringRules: RecurringRule[];
  caixaInicial: number;
  month: number;
  year: number;
  today?: Date;
}): ForecastDetailDashboardData {
  const { mode, monthStart, monthEnd, realizedUntil, windowStartLabel, windowEndLabel } = getForecastDetailWindow(
    month,
    year,
    today,
  );
  const categoryMap = new Map(categories.filter(Boolean).map((category) => [category.id, category]));
  const transactionsById = new Map(transactions.filter(Boolean).map((transaction) => [transaction.id, transaction]));
  const rulesById = new Map(recurringRules.filter(Boolean).map((rule) => [rule.id, rule]));

  // Realizado: transações do mês lançadas até o fim da parte já vivida do período.
  const actualTransactions = transactions.filter((transaction) => {
    const date = parseLocalDate(transaction?.date);
    if (!date || !realizedUntil) return false;
    return date >= monthStart && date <= realizedUntil;
  });

  const actualByDay = new Map<string, number>();
  let actualIncome = 0;
  let actualExpense = 0;

  actualTransactions.forEach((transaction) => {
    const amount = Number(transaction.amount) || 0;
    const key = toDayKey(parseLocalDate(transaction.date)!);
    if (transaction.type === 'income') {
      actualIncome += amount;
      actualByDay.set(key, (actualByDay.get(key) ?? 0) + amount);
    } else {
      actualExpense += amount;
      actualByDay.set(key, (actualByDay.get(key) ?? 0) - amount);
    }
  });

  // Previsto: os mesmos itens do card "Previsão" (recorrências + histórico do mês anterior),
  // posicionados no dia em que costumam acontecer. Itens com vencimento já passado no mês
  // atual são considerados cobertos pelo realizado.
  const forecastItems = [...(forecastData?.incomeItems ?? []), ...(forecastData?.expenseItems ?? [])];
  const futureByDay = new Map<string, number>();
  let futureIncome = 0;
  let futureExpense = 0;
  const futureExpenseItems: ForecastItem[] = [];

  forecastItems.forEach((item) => {
    const day = Math.min(getItemDueDay(item, transactionsById, rulesById), monthEnd.getDate());
    const dueDate = new Date(year, month, day);
    if (realizedUntil && dueDate <= realizedUntil) return;

    const amount = Number(item.amount) || 0;
    const key = toDayKey(dueDate);
    if (item.type === 'income') {
      futureIncome += amount;
      futureByDay.set(key, (futureByDay.get(key) ?? 0) + amount);
    } else {
      futureExpense += amount;
      futureExpenseItems.push(item);
      futureByDay.set(key, (futureByDay.get(key) ?? 0) - amount);
    }
  });

  const linePoints: ForecastDetailLinePoint[] = [];
  let actualRunning = caixaInicial;
  let projectedRunning = caixaInicial;

  for (let cursor = new Date(monthStart); cursor <= monthEnd; cursor.setDate(cursor.getDate() + 1)) {
    const key = toDayKey(cursor);
    const isRealized = Boolean(realizedUntil && cursor <= realizedUntil);
    const isCurrentDay = Boolean(realizedUntil && mode === 'current' && cursor.getTime() === realizedUntil.getTime());

    if (isRealized) {
      actualRunning += actualByDay.get(key) ?? 0;
      projectedRunning = actualRunning;
    } else {
      projectedRunning += futureByDay.get(key) ?? 0;
    }

    const projectionStarted = !realizedUntil || cursor >= realizedUntil;

    linePoints.push({
      dateKey: key,
      label: formatDateLabel(cursor),
      actualBalance: isRealized ? actualRunning : null,
      projectedBalance: projectionStarted ? projectedRunning : null,
      isCurrentDay,
    });
  }

  const currentBalance = caixaInicial + actualIncome - actualExpense;
  const projectedIncome = actualIncome + futureIncome;
  const projectedExpense = actualExpense + futureExpense;
  const projectedBalance = currentBalance + futureIncome - futureExpense;

  const pieTotals = new Map<ForecastDetailGroupKey, number>([
    ['essenciais', 0],
    ['desejos', 0],
    ['prioridades', 0],
    ['sem-categoria', 0],
  ]);
  const addToPie = (key: ForecastDetailGroupKey, amount: number) => pieTotals.set(key, (pieTotals.get(key) ?? 0) + amount);

  actualTransactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      const category = categoryMap.get(transaction.category_id || '');
      addToPie(category ? normalizeGroupType(category.group_type, 'essenciais') : 'sem-categoria', Number(transaction.amount) || 0);
    });
  futureExpenseItems.forEach((item) => addToPie(toDetailGroup(item.group_type), Number(item.amount) || 0));

  const pieSlices = Array.from(pieTotals.entries()).map(([key, value]) => ({
    key,
    label: GROUP_LABELS[key],
    value,
    color: GROUP_COLORS[key],
  }));

  let insightType: ForecastDetailDashboardData['insightType'] = 'success';
  let insightMessage = 'A leitura continua estável até o fim do mês.';

  if (projectedIncome === 0 && projectedExpense === 0) {
    insightMessage =
      'Ainda não há lançamentos nem previsões para este mês. Cadastre recorrências ou registre movimentações para montar a leitura.';
  } else if (projectedBalance < 0) {
    insightType = 'warning';
    insightMessage = 'A previsão indica saldo negativo até o fim do mês. Vale revisar as saídas mais pesadas.';
  } else if (projectedIncome > 0 && projectedExpense / projectedIncome >= 0.9) {
    insightType = 'warning';
    insightMessage = 'As saídas previstas já encostam na receita estimada. Há pouco espaço para novas despesas.';
  }

  return {
    mode,
    windowStartLabel,
    windowEndLabel,
    windowDescription: WINDOW_DESCRIPTIONS[mode],
    currentBalanceLabel: CURRENT_BALANCE_LABELS[mode],
    pieSlices,
    linePoints,
    currentBalance,
    projectedBalance,
    actualIncome,
    actualExpense,
    projectedIncome,
    projectedExpense,
    insightType,
    insightMessage,
  };
}
