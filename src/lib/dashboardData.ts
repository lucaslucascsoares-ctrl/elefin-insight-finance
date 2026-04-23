import {
  Category,
  GROUP_LABELS,
  GROUP_LIMITS,
  GroupType,
  MonthlyProjectionItem,
  Transaction,
} from '@/types/finance';
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

const formatReserve = (value: number) => formatCurrency(Math.max(value, 0));

export interface ProjectedInsightResult {
  message: string;
  type: 'warning' | 'success';
}

const buildReserveLead = (reserve: number) => {
  if (reserve <= 0) {
    return 'o espaço ficou curto';
  }

  return `com ${formatReserve(reserve)} de folga, o espaço tá apertado`;
};

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
      message: 'Seu planejamento ainda está em branco. Quando você adicionar projeções, eu organizo a leitura do mês por aqui. ✨',
      type: 'success',
    };
  }

  const baseAmount = totalIncome > 0 ? totalIncome : totalExpense;
  if (baseAmount <= 0) {
    return {
      message: 'Ainda faltam alguns valores por aqui. Quando você ajustar isso, eu monto uma leitura mais clara das suas prioridades.',
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
  const reserve = totalIncome - totalExpense;

  if (essentials.delta > 0) {
    return {
      message: `Suas essenciais pesaram esse mês. ${buildReserveLead(reserve)} — vale segurar o estilo de vida por agora.`,
      type: 'warning',
    };
  }

  if (desires.delta > 0) {
    return {
      message:
        reserve > 0
          ? `O estilo de vida subiu além do ideal. Ainda tem ${formatReserve(reserve)} de respiro, mas vale aparar os extras antes que isso aperte o restante do mês.`
          : 'O estilo de vida passou do ponto e encostou no seu caixa. Segurar os extras agora pode devolver fôlego ao mês.',
      type: 'warning',
    };
  }

  if (priorities.delta < 0) {
    const missingAmount = formatCurrency(Math.abs(priorities.delta));

    return {
      message:
        reserve > 0
          ? `Suas prioridades ficaram leves por enquanto. Ainda faltam ${missingAmount} para esse bloco ganhar mais força — se der, vale puxar um pouco da folga para cá.`
          : `Suas prioridades ficaram abaixo do ideal. Ainda faltam ${missingAmount} nesse bloco, então vale reorganizar o mês antes de abrir espaço para outras frentes.`,
      type: 'warning',
    };
  }

  return {
    message:
      reserve > 0
        ? `Seu planejamento está redondo. Depois de cobrir o mês, ainda sobram ${formatReserve(reserve)} de folga — ótimo sinal. ✨`
        : 'Seu planejamento está bem encaixado. Agora é mais acompanhar o mês de perto e manter esse ritmo.',
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
