import {
  Category,
  ForecastCategorySummary,
  ForecastGroupType,
  ForecastItem,
  GroupType,
  MonthlyForecastData,
  RecurringRule,
  Transaction,
} from '@/types/finance';

const normalize = (value: string | null | undefined) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const createId = (prefix: string, seed: string) => `${prefix}-${normalize(seed).replace(/\s+/g, '-')}`;

const getForecastGroup = (category?: Category | null): ForecastGroupType =>
  category?.group_type || 'outros';

const getForecastTitle = (description: string | null | undefined, category?: Category | null) =>
  description?.trim() || category?.name || 'Outros';

const getItemKey = (title: string, categoryId: string | null, groupType: ForecastGroupType) =>
  `${groupType}:${categoryId || 'sem-categoria'}:${normalize(title)}`;

const isApplicableForMonth = (startsAt: string, month: number, year: number) => {
  const start = new Date(`${startsAt.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(start.getTime())) return false;

  const target = new Date(year, month, 1);
  return start.getFullYear() < target.getFullYear() ||
    (start.getFullYear() === target.getFullYear() && start.getMonth() < target.getMonth());
};

export function buildMonthlyForecastData({
  userId,
  transactions,
  categories,
  recurringRules,
  month,
  year,
}: {
  userId: string;
  transactions: Transaction[];
  categories: Category[];
  recurringRules: RecurringRule[];
  month: number;
  year: number;
}): MonthlyForecastData | null {
  const previousMonthDate = new Date(year, month - 1, 1);
  const previousMonth = previousMonthDate.getMonth();
  const previousYear = previousMonthDate.getFullYear();
  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  const previousMonthExpenses = transactions.filter((transaction) => {
    if (transaction.type !== 'expense') return false;
    const date = new Date(`${transaction.date.slice(0, 10)}T00:00:00`);
    if (Number.isNaN(date.getTime())) return false;
    return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
  });

  const previousGroups: Record<ForecastGroupType, number> = {
    essenciais: 0,
    desejos: 0,
    prioridades: 0,
    outros: 0,
  };

  previousMonthExpenses.forEach((transaction) => {
    const category = categoryMap.get(transaction.category_id || '');
    previousGroups[getForecastGroup(category)] += Number(transaction.amount);
  });

  const recurringForecasts = recurringRules
    .filter((rule) => rule.active && rule.type === 'expense' && isApplicableForMonth(rule.starts_at, month, year))
    .map<ForecastItem>((rule) => {
      const category = categoryMap.get(rule.category_id || '');
      const title = getForecastTitle(rule.description, category);

      return {
        id: createId('recurring', `${rule.id}-${month}-${year}`),
        user_id: userId,
        month,
        year,
        type: 'expense',
        title,
        amount: Number(rule.amount),
        category_id: rule.category_id,
        group_type: getForecastGroup(category),
        source: 'recurring',
        status: 'predicted',
        reference_month: new Date(`${rule.starts_at.slice(0, 10)}T00:00:00`).getMonth(),
        reference_year: new Date(`${rule.starts_at.slice(0, 10)}T00:00:00`).getFullYear(),
        recurring_rule_id: rule.id,
        reference_transaction_id: null,
      };
    });

  const recurringKeys = new Set(
    recurringForecasts.map((item) => getItemKey(item.title, item.category_id, item.group_type)),
  );

  const historyForecasts = previousMonthExpenses
    .map<ForecastItem>((transaction) => {
      const category = categoryMap.get(transaction.category_id || '');
      const title = getForecastTitle(transaction.description, category);

      return {
        id: createId('history', `${transaction.id}-${month}-${year}`),
        user_id: userId,
        month,
        year,
        type: 'expense',
        title,
        amount: Number(transaction.amount),
        category_id: transaction.category_id,
        group_type: getForecastGroup(category),
        source: 'history',
        status: 'predicted',
        reference_month: previousMonth,
        reference_year: previousYear,
        recurring_rule_id: null,
        reference_transaction_id: transaction.id,
      };
    })
    .filter((item) => !recurringKeys.has(getItemKey(item.title, item.category_id, item.group_type)));

  const forecastItems = [...recurringForecasts, ...historyForecasts];

  if (forecastItems.length === 0 && previousMonthExpenses.length === 0) {
    return null;
  }

  const currentForecastTotals: Record<ForecastGroupType, number> = {
    essenciais: 0,
    desejos: 0,
    prioridades: 0,
    outros: 0,
  };

  forecastItems.forEach((item) => {
    currentForecastTotals[item.group_type] += Number(item.amount);
  });

  const categoryOrder: ForecastGroupType[] = ['essenciais', 'desejos', 'prioridades', 'outros'];
  const labels: Record<ForecastGroupType, string> = {
    essenciais: 'Essenciais',
    desejos: 'Desejos',
    prioridades: 'Prioridades',
    outros: 'Outros',
  };

  const categorias: ForecastCategorySummary[] = categoryOrder.map((groupType) => ({
    nome: labels[groupType],
    valorReal: previousGroups[groupType],
    previsaoMesAtual: currentForecastTotals[groupType],
    itens: forecastItems.filter((item) => item.group_type === groupType),
  }));

  return {
    mesReferencia: previousMonthDate.toLocaleDateString('pt-BR', { month: 'long' }),
    anoReferencia: previousYear,
    categorias,
    totalGastoAnterior: Object.values(previousGroups).reduce((sum, value) => sum + value, 0),
    totalPrevisto: forecastItems.reduce((sum, item) => sum + Number(item.amount), 0),
  };
}

export const FORECAST_SOURCE_LABELS: Record<ForecastItem['source'], string> = {
  recurring: 'Recorrente',
  history: 'Histórico',
  manual: 'Manual',
};
