import { Category, GROUP_LABELS, GROUP_LIMITS, GroupType, Transaction } from '@/types/finance';
import { normalizeGroupType } from '@/lib/groupType';

export interface InsightResult {
  message: string;
  type: 'warning' | 'success';
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const buildReserveLead = (reserve: number) => {
  if (reserve <= 0) {
    return 'o espaÃ§o ficou curto';
  }

  return `com ${formatCurrency(Math.max(reserve, 0))} de folga, o mÃªs ainda respira`;
};

export function generateInsight(transactions: Transaction[], categories: Category[]): InsightResult {
  const totalIncome = transactions
    .filter(Boolean)
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  if (totalIncome === 0) {
    return {
      message: 'Ainda faltam entradas neste mÃªs. Quando elas aparecerem, eu consigo te mostrar melhor para onde o dinheiro estÃ¡ indo. âœ¨',
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
    const delta = spent - ideal;

    return {
      group,
      label: GROUP_LABELS[group],
      spent,
      ideal,
      delta,
    };
  });

  const essentials = metrics.find((item) => item.group === 'essenciais')!;
  const desires = metrics.find((item) => item.group === 'desejos')!;
  const priorities = metrics.find((item) => item.group === 'prioridades')!;
  const reserve = totalIncome - metrics.reduce((sum, item) => sum + item.spent, 0);

  if (essentials.delta > 0) {
    return {
      message: `Suas essenciais pesaram neste mÃªs. ${buildReserveLead(reserve)} â€” vale aliviar esse bloco antes que ele aperte todo o resto.`,
      type: 'warning',
    };
  }

  if (desires.delta > 0) {
    return {
      message:
        reserve > 0
          ? `O estilo de vida passou do ideal. ${buildReserveLead(reserve)} â€” entÃ£o cortar um pouco dos extras agora pode te devolver margem.`
          : 'O estilo de vida passou do ideal e encostou no caixa. Segurar os extras agora pode devolver fÃ´lego ao mÃªs.',
      type: 'warning',
    };
  }

  if (priorities.delta < 0) {
    const missingAmount = formatCurrency(Math.abs(priorities.delta));

    return {
      message:
        reserve > 0
          ? `Suas prioridades ficaram abaixo do ideal. Ainda faltam ${missingAmount} nesse bloco â€” se der, vale puxar um pouco da folga para cÃ¡.`
          : `Suas prioridades ficaram abaixo do ideal. Ainda faltam ${missingAmount} nesse bloco, entÃ£o vale reorganizar o mÃªs antes de abrir espaÃ§o para outras coisas.`,
      type: 'warning',
    };
  }

  return {
    message:
      reserve > 0
        ? `Seu mÃªs estÃ¡ bem encaixado. Depois de cobrir tudo, ainda sobram ${formatCurrency(Math.max(reserve, 0))} de folga â€” Ã³timo sinal. âœ¨`
        : 'Seu mÃªs estÃ¡ redondo. Agora Ã© mais manter esse ritmo e acompanhar de perto para nÃ£o sair da linha.',
    type: 'success',
  };
}

