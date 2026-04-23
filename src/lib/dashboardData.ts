import { Category, GROUP_LABELS, GROUP_LIMITS, GroupType, MonthlyProjectionItem, Transaction } from '@/types/finance';
import { normalizeGroupType } from '@/lib/groupType';

export interface GroupAmountSummary {
  groups: Record<GroupType, number>;
  total: number;
}

export interface ProjectedMonthData extends GroupAmountSummary {
  activeItems: MonthlyProjectionItem[];
  pendingItemsCount: number;
  reminderItemsCount: number;
}

export interface RealMonthData extends GroupAmountSummary {
  totalIncome: number;
  totalExpense: number;
  saldo: number;
  transactionCount: number;
}

export const createEmptyGroups = (): Record<GroupType, number> => ({
  essenciais: 0,
  desejos: 0,
  prioridades: 0,
});

export const getProjectedMonthData = (items: MonthlyProjectionItem[]): ProjectedMonthData => {
  const activeItems = items.filter(Boolean).filter((item) => item.status !== 'ignored' && item.status !== 'paid');
  const groups = createEmptyGroups();

  activeItems.forEach((item) => {
    groups[normalizeGroupType(item?.group_type)] += Number(item.amount);
  });

  const total = Object.values(groups).reduce((sum, value) => sum + value, 0);

  return {
    groups,
    total,
    activeItems,
    pendingItemsCount: activeItems.length,
    reminderItemsCount: activeItems.filter((item) => item.reminder_enabled).length,
  };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export interface ProjectedInsightResult {
  message: string;
  type: 'warning' | 'success';
}

export const generateProjectedInsight = (items: MonthlyProjectionItem[]): ProjectedInsightResult => {
  const activeItems = items.filter(Boolean).filter((item) => item.status !== 'ignored' && item.status !== 'paid');
  const totalIncome = activeItems
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpense = activeItems
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const groups = createEmptyGroups();
  activeItems.forEach((item) => {
    if (item.type === 'expense') {
      groups[normalizeGroupType(item?.group_type)] += Number(item.amount);
    }
  });

  if (activeItems.length === 0) {
    return {
      message: 'Nenhuma conta projetada ativa neste mês. Quando houver itens, esta caixa vai comparar o que está previsto com as metas do planejamento.',
      type: 'success',
    };
  }

  const baseAmount = totalIncome > 0 ? totalIncome : totalExpense;
  if (baseAmount <= 0) {
    return {
      message: 'As contas projetadas estão sem valor definido ainda. Ajuste os itens para que esta caixa mostre a leitura de prioridades do planejamento.',
      type: 'success',
    };
  }

  const metrics = (Object.keys(groups) as GroupType[]).map((group) => {
    const spent = groups[group];
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

  if (essentials.delta > 0) {
    return {
      message: `${essentials.label} previstas estão acima da meta em ${formatCurrency(essentials.delta)}. Vale reduzir esse grupo antes que ele pressione o restante do planejamento.`,
      type: 'warning',
    };
  }

  if (desires.delta > 0) {
    return {
      message: `${desires.label} previstas passaram da meta em ${formatCurrency(desires.delta)}. Ajuste esse bloco para preservar as prioridades do mês.`,
      type: 'warning',
    };
  }

  if (priorities.delta < 0) {
    return {
      message: `${priorities.label} previstas estão abaixo da meta de 20%. Falta direcionar ${formatCurrency(Math.abs(priorities.delta))} para esse objetivo.`,
      type: 'warning',
    };
  }

  const reserve = Math.max(totalIncome - totalExpense, 0);

  return {
    message: `Seu planejamento está equilibrado. Entradas e saídas permanecem dentro da meta, e você ainda preserva ${formatCurrency(reserve)} de folga estimada.`,
    type: 'success',
  };
};

export const getRealMonthData = (
  transactions: Transaction[],
  categories: Category[],
  caixaInicial: number,
): RealMonthData => {
  const groups = createEmptyGroups();
  const categoryMap = new Map(categories.filter(Boolean).map((category) => [category.id, category]));

  const totalIncome = transactions
    .filter(Boolean)
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const expenseTransactions = transactions.filter(Boolean).filter((transaction) => transaction.type === 'expense');

  expenseTransactions.forEach((transaction) => {
    const category = categoryMap.get(transaction.category_id || '');
    if (category) {
      groups[normalizeGroupType(category?.group_type)] += Number(transaction.amount);
    }
  });

  const totalExpense = expenseTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  return {
    groups,
    total: totalExpense,
    totalIncome,
    totalExpense,
    saldo: caixaInicial + totalIncome - totalExpense,
    transactionCount: transactions.length,
  };
};
