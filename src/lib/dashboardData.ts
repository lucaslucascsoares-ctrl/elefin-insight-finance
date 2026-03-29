import { Category, GroupType, MonthlyProjectionItem, Transaction } from '@/types/finance';

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
  const activeItems = items.filter((item) => item.status !== 'ignored' && item.status !== 'paid');
  const groups = createEmptyGroups();

  activeItems.forEach((item) => {
    groups[item.group_type] += Number(item.amount);
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

export const getRealMonthData = (
  transactions: Transaction[],
  categories: Category[],
  caixaInicial: number,
): RealMonthData => {
  const groups = createEmptyGroups();
  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const expenseTransactions = transactions.filter((transaction) => transaction.type === 'expense');

  expenseTransactions.forEach((transaction) => {
    const category = categoryMap.get(transaction.category_id || '');
    if (category) {
      groups[category.group_type] += Number(transaction.amount);
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
