import { Transaction, Category, GroupType, GROUP_LIMITS } from '@/types/finance';

export interface InsightResult {
  message: string;
  type: 'warning' | 'success';
}

export function generateInsight(
  transactions: Transaction[],
  categories: Category[]
): InsightResult {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  if (totalIncome === 0) {
    return {
      message: 'Adicione suas receitas do mês para começar a receber insights personalizados.',
      type: 'success',
    };
  }

  const expenses = transactions.filter((t) => t.type === 'expense');
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const desejosExpenses = expenses.filter((t) => {
    const cat = categoryMap.get(t.category_id || '');
    return cat?.group_type === 'desejos';
  });

  const totalDesejos = desejosExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
  const desejosPercent = totalDesejos / totalIncome;

  if (desejosPercent > GROUP_LIMITS.desejos) {
    const categoryTotals = new Map<string, { total: number; count: number; name: string }>();

    desejosExpenses.forEach((t) => {
      const cat = categoryMap.get(t.category_id || '');
      if (!cat) return;
      const existing = categoryTotals.get(cat.id) || { total: 0, count: 0, name: cat.name };
      existing.total += Number(t.amount);
      existing.count += 1;
      categoryTotals.set(cat.id, existing);
    });

    let topCategory = { total: 0, count: 0, name: '' };
    categoryTotals.forEach((val) => {
      if (val.total > topCategory.total) {
        topCategory = val;
      }
    });

    if (topCategory.count > 0) {
      const avgPerTransaction = topCategory.total / topCategory.count;
      const monthlySavings = avgPerTransaction * 4;

      return {
        message: `Cortar 1 ${topCategory.name} por semana pode liberar R$ ${monthlySavings.toFixed(0)} por mês.`,
        type: 'warning',
      };
    }
  }

  const suggestedInvestment = (totalIncome * 0.1).toFixed(0);
  return {
    message: `Você está no caminho certo! Que tal investir R$ ${suggestedInvestment} em Prioridades?`,
    type: 'success',
  };
}
