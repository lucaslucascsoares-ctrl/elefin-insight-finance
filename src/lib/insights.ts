import { Category, GROUP_LABELS, GROUP_LIMITS, GroupType, Transaction } from '@/types/finance';
import { normalizeGroupType } from '@/lib/groupType';

export interface InsightResult {
  message: string;
  type: 'warning' | 'success';
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function generateInsight(transactions: Transaction[], categories: Category[]): InsightResult {
  const totalIncome = transactions
    .filter(Boolean)
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  if (totalIncome === 0) {
    return {
      message: 'Adicione entradas no m?s para receber uma leitura das suas metas de gasto.',
      type: 'success',
    };
  }

  const categoryMap = new Map(categories.filter(Boolean).map((category) => [category.id, category]));
  const groups: Record<GroupType, number> = { essenciais: 0, desejos: 0, prioridades: 0 };

  transactions
    .filter(Boolean)
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      const category = categoryMap.get(transaction.category_id || '');
      if (category) {
        groups[normalizeGroupType(category?.group_type)] += Number(transaction.amount);
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
      message: `${essentials.label} esto acima da meta em ${formatCurrency(essentials.delta)}. O pr�ximo passo � reduzir esse grupo para voltar ao limite ideal e proteger seu caixa.`,
      type: 'warning',
    };
  }

  if (desires.delta > 0) {
    return {
      message: `${desires.label} passaram da meta em ${formatCurrency(desires.delta)}. Vale cortar gastos variveis agora para no pressionar as prioridades do m?s.`,
      type: 'warning',
    };
  }

  if (priorities.delta < 0) {
    return {
      message: `${priorities.label} esto abaixo da meta de 20%. Falta direcionar ${formatCurrency(
        Math.abs(priorities.delta),
      )} para esse objetivo.`,
      type: 'warning',
    };
  }

  const reserve = totalIncome - metrics.reduce((sum, item) => sum + item.spent, 0);

  return {
    message: `Seu m?s est equilibrado. Essenciais, Desejos e Prioridades esto dentro da meta, e voc ainda preserva ${formatCurrency(
      Math.max(reserve, 0),
    )} de folga no caixa.`,
    type: 'success',
  };
}
