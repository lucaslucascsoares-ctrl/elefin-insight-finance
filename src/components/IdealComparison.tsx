import { Transaction, Category, GroupType, GROUP_LABELS, GROUP_LIMITS } from '@/types/finance';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface IdealComparisonProps {
  transactions: Transaction[];
  categories: Category[];
}

const IdealComparison = ({ transactions, categories }: IdealComparisonProps) => {
  const now = new Date();
  const monthTx = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalIncome = monthTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const expenses = monthTx.filter((t) => t.type === 'expense');

  const groups: Record<GroupType, number> = { essenciais: 0, desejos: 0, prioridades: 0 };
  expenses.forEach((t) => {
    const cat = categoryMap.get(t.category_id || '');
    if (cat) groups[cat.group_type] += Number(t.amount);
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getStatus = (group: GroupType, spent: number, income: number) => {
    if (income === 0) return 'ok';
    const percent = spent / income;
    const limit = GROUP_LIMITS[group];

    if (group === 'prioridades') {
      return percent < limit ? 'alert' : 'ok';
    }
    return percent > limit ? 'alert' : 'ok';
  };

  return (
    <AccordionItem value="ideal" className="border-border/50">
      <AccordionTrigger className="px-4 text-sm font-semibold text-foreground hover:no-underline">
        Comparado ao ideal?
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-5">
          {(Object.keys(groups) as GroupType[]).map((group) => {
            const limit = GROUP_LIMITS[group];
            const idealAmount = totalIncome * limit;
            const spent = groups[group];
            const percent = totalIncome > 0 ? Math.min((spent / idealAmount) * 100, 100) : 0;
            const status = getStatus(group, spent, totalIncome);

            return (
              <div key={group} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {status === 'alert' ? (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    )}
                    <span className="text-sm font-medium text-foreground">{GROUP_LABELS[group]}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(spent)} / {formatCurrency(idealAmount)} ({(limit * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress value={percent} className="h-2" />
              </div>
            );
          })}
        </div>
        {totalIncome === 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Adicione receitas para ver a comparação com o ideal.
          </p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default IdealComparison;
