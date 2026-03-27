import { Category, GROUP_LABELS, GROUP_LIMITS, GroupType, Transaction } from '@/types/finance';

export interface InsightResult {
  message: string;
  type: 'warning' | 'success';
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function generateInsight(transactions: Transaction[], categories: Category[]): InsightResult {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  if (totalIncome === 0) {
    return {
      message: 'Adicione entradas no mes para receber uma leitura das metas 50/30/20.',
      type: 'success',
    };
  }

  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const groups: Record<GroupType, number> = { essenciais: 0, desejos: 0, prioridades: 0 };

  transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      const category = categoryMap.get(transaction.category_id || '');
      if (category) {
        groups[category.group_type] += Number(transaction.amount);
      }
    });

  const metrics = (Object.keys(groups) as GroupType[]).map((group) => {
    const spent = groups[group];
    const ideal = totalIncome * GROUP_LIMITS[group];
    const percentage = totalIncome > 0 ? spent / totalIncome : 0;
    const delta = spent - ideal;

    return {
      group,
      label: GROUP_LABELS[group],
      spent,
      ideal,
      percentage,
      delta,
    };
  });

  const essentials = metrics.find((item) => item.group === 'essenciais')!;
  const desires = metrics.find((item) => item.group === 'desejos')!;
  const priorities = metrics.find((item) => item.group === 'prioridades')!;

  if (essentials.delta > 0) {
    return {
      message: `${essentials.label} estao acima da meta em ${formatCurrency(essentials.delta)}. O proximo passo e reduzir esse grupo para voltar ao limite de 50% e proteger seu caixa.`,
      type: 'warning',
    };
  }

  if (desires.delta > 0) {
    return {
      message: `${desires.label} passaram da meta de 30% em ${formatCurrency(desires.delta)}. Vale cortar gastos variaveis agora para nao pressionar as prioridades do mes.`,
      type: 'warning',
    };
  }

  if (priorities.delta < 0) {
    return {
      message: `${priorities.label} estao abaixo da meta de 20%. Falta direcionar ${formatCurrency(Math.abs(priorities.delta))} para esse objetivo e equilibrar sua estrategia 50/30/20.`,
      type: 'warning',
    };
  }

  const reserve = totalIncome - metrics.reduce((sum, item) => sum + item.spent, 0);

  return {
    message: `Seu mes esta alinhado com a leitura 50/30/20. Essenciais, Desejos e Prioridades estao dentro da meta, e voce ainda preserva ${formatCurrency(Math.max(reserve, 0))} de folga no caixa.`,
    type: 'success',
  };
}
