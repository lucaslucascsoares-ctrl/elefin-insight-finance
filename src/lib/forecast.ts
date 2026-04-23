import {
  Category,
  GROUP_LABELS,
  GROUP_LIMITS,
  ForecastCategorySummary,
  ForecastGroupType,
  ForecastItem,
  GroupType,
  MonthlyForecastData,
  RecurringRule,
  Transaction,
} from '@/types/finance';
import { normalizeGroupType } from '@/lib/groupType';

const normalize = (value: string | null | undefined) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const createId = (prefix: string, seed: string) => `${prefix}-${normalize(seed).replace(/\s+/g, '-')}`;

const getForecastGroup = (category: Category | null | undefined): ForecastGroupType =>
  category ? normalizeGroupType(category.group_type, 'essenciais') : 'outros';

const getForecastTitle = (description: string | null | undefined, category: Category | null | undefined) =>
  description?.trim() || category?.name || 'Outros';

const getItemKey = (
  title: string,
  categoryId: string | null,
  groupType: ForecastGroupType,
  type: ForecastItem['type'],
) => `${type}:${groupType}:${categoryId || 'sem-categoria'}:${normalize(title)}`;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const buildReserveLead = (reserve: number) => {
  if (reserve <= 0) {
    return 'o espaço ficou curto';
  }

  return `com ${formatCurrency(Math.max(reserve, 0))} de folga, ainda existe uma margem boa`;
};

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
  const safeCategories = categories.filter(Boolean);
  const safeTransactions = transactions.filter(Boolean);
  const safeRecurringRules = recurringRules.filter(Boolean);
  const categoryMap = new Map(safeCategories.map((category) => [category.id, category]));

  const previousMonthExpenses = safeTransactions.filter((transaction) => {
    if (transaction.type !== 'expense') return false;
    const date = new Date(`${transaction.date.slice(0, 10)}T00:00:00`);
    if (Number.isNaN(date.getTime())) return false;
    return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
  });

  const previousMonthIncome = safeTransactions.filter((transaction) => {
    if (transaction.type !== 'income') return false;
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

  const recurringIncomeForecasts = safeRecurringRules
    .filter((rule) => rule.active && rule.type === 'income' && isApplicableForMonth(rule.starts_at, month, year))
    .map<ForecastItem>((rule) => {
      const category = categoryMap.get(rule.category_id || '');
      const title = getForecastTitle(rule.description, category);

      return {
        id: createId('recurring-income', `${rule.id}-${month}-${year}`),
        user_id: userId,
        month,
        year,
        type: 'income',
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

  const recurringIncomeKeys = new Set(
    recurringIncomeForecasts.map((item) => getItemKey(item.title, item.category_id, item.group_type, item.type)),
  );

  const historyIncomeForecasts = previousMonthIncome
    .map<ForecastItem>((transaction) => {
      const category = categoryMap.get(transaction.category_id || '');
      const title = getForecastTitle(transaction.description, category);

      return {
        id: createId('history-income', `${transaction.id}-${month}-${year}`),
        user_id: userId,
        month,
        year,
        type: 'income',
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
    .filter((item) => !recurringIncomeKeys.has(getItemKey(item.title, item.category_id, item.group_type, item.type)));

  const recurringForecasts = safeRecurringRules
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
    recurringForecasts.map((item) => getItemKey(item.title, item.category_id, item.group_type, item.type)),
  );

  const historyExpenseForecasts = previousMonthExpenses
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
    .filter((item) => !recurringKeys.has(getItemKey(item.title, item.category_id, item.group_type, item.type)));

  const incomeForecastItems = [...recurringIncomeForecasts, ...historyIncomeForecasts];
  const expenseForecastItems = [...recurringForecasts, ...historyExpenseForecasts];
  const forecastItems = [...incomeForecastItems, ...expenseForecastItems];

  if (forecastItems.length === 0 && previousMonthExpenses.length === 0 && previousMonthIncome.length === 0) {
    return null;
  }

  const currentForecastTotals: Record<ForecastGroupType, number> = {
    essenciais: 0,
    desejos: 0,
    prioridades: 0,
    outros: 0,
  };

  const forecastGroups: Record<GroupType, number> = {
    essenciais: 0,
    desejos: 0,
    prioridades: 0,
  };

  forecastItems.forEach((item) => {
    const groupType = item?.group_type ?? 'outros';
    currentForecastTotals[groupType] += Number(item?.amount ?? 0);
    if (groupType !== 'outros') {
      forecastGroups[groupType] += Number(item?.amount ?? 0);
    }
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
    itens: forecastItems.filter((item) => (item?.group_type ?? 'outros') === groupType),
  }));

  return {
    mesReferencia: previousMonthDate.toLocaleDateString('pt-BR', { month: 'long' }),
    anoReferencia: previousYear,
    categorias,
    totalGastoAnterior: Object.values(previousGroups).reduce((sum, value) => sum + value, 0),
    totalPrevisto: forecastItems.reduce((sum, item) => sum + Number(item.amount), 0),
    totalEntradaPrevisto: incomeForecastItems.reduce((sum, item) => sum + Number(item.amount), 0),
    totalSaidaPrevisto: expenseForecastItems.reduce((sum, item) => sum + Number(item.amount), 0),
    incomeItems: incomeForecastItems,
    expenseItems: expenseForecastItems,
    groups: forecastGroups,
  };
}

export interface ForecastInsightResult {
  message: string;
  type: 'warning' | 'success';
}

export function generateForecastInsight(data: MonthlyForecastData | null): ForecastInsightResult {
  if (!data) {
    return {
      message: 'Ainda faltam sinais para eu montar a previsão com segurança. Assim que aparecerem mais dados, eu fecho essa leitura por aqui. ✨',
      type: 'success',
    };
  }

  const totalForecastIncome = Number(data.totalEntradaPrevisto ?? 0);
  const totalForecastExpenses = Number(data.totalSaidaPrevisto ?? 0);
  const baseAmount = totalForecastIncome > 0 ? totalForecastIncome : Number(data.totalPrevisto ?? 0);

  if (baseAmount <= 0 || (totalForecastIncome <= 0 && totalForecastExpenses <= 0)) {
    return {
      message: 'Ainda faltam sinais para eu montar a previsão com segurança. Assim que aparecerem mais dados, eu fecho essa leitura por aqui. ✨',
      type: 'success',
    };
  }

  if (totalForecastExpenses <= 0 && totalForecastIncome > 0) {
    return {
      message: `Por enquanto a previsão está leve: entram ${formatCurrency(totalForecastIncome)} e ainda não apareceu nenhuma saída fixa no radar. Bom espaço para organizar o resto do mês.`,
      type: 'success',
    };
  }

  const forecastGroups: Record<GroupType, number> = {
    essenciais: Number(data.groups.essenciais ?? 0),
    desejos: Number(data.groups.desejos ?? 0),
    prioridades: Number(data.groups.prioridades ?? 0),
  };

  const metrics = (Object.keys(forecastGroups) as GroupType[]).map((group) => {
    const spent = forecastGroups[group];
    const ideal = baseAmount * GROUP_LIMITS[group];

    return {
      group,
      label: GROUP_LABELS[group],
      spent,
      ideal,
      delta: spent - ideal,
    };
  });

  const essentials = metrics.find((item) => item.group === 'essenciais')!;
  const desires = metrics.find((item) => item.group === 'desejos')!;
  const priorities = metrics.find((item) => item.group === 'prioridades')!;
  const reserve = totalForecastIncome - totalForecastExpenses;

  if (essentials.delta > 0) {
    return {
      message: `As essenciais já vêm pesadas na previsão. ${buildReserveLead(reserve)}, vale aliviar esse bloco antes que ele aperte todo o mês.`,
      type: 'warning',
    };
  }

  if (desires.delta > 0) {
    return {
      message:
        reserve > 0
          ? `O estilo de vida subiu além do ideal na previsão. ${buildReserveLead(reserve)}, então ajustar os extras agora pode te devolver margem.`
          : 'O estilo de vida subiu além do ideal e encostou na sua folga prevista. Segurar os extras agora pode evitar aperto mais à frente.',
      type: 'warning',
    };
  }

  if (priorities.delta < 0) {
    const missingAmount = formatCurrency(Math.abs(priorities.delta));

    return {
      message:
        reserve > 0
          ? `Suas prioridades ainda estão tímidas na previsão. Faltam ${missingAmount} nesse bloco. Se der, vale puxar um pouco da sobra para cá.`
          : `Suas prioridades ainda estão abaixo do ideal. Faltam ${missingAmount} nesse bloco, então talvez valha reorganizar o mês antes de abrir outras frentes.`,
      type: 'warning',
    };
  }

  return {
    message:
      reserve > 0
        ? `Sua previsão está bem encaixada. Depois de cobrir o mês, ainda sobram ${formatCurrency(Math.max(reserve, 0))} de folga. Ótimo sinal. ✨`
        : 'Sua previsão está redonda. Agora é acompanhar o mês de perto e manter esse ritmo.',
    type: 'success',
  };
}

export const FORECAST_SOURCE_LABELS: Record<ForecastItem['source'], string> = {
  recurring: 'Recorrente',
  history: 'Histórico',
  manual: 'Manual',
};
