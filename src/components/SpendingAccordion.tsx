import { Transaction, Category, GroupType, GROUP_LABELS, GROUP_LIMITS } from '@/types/finance';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SpendingAccordionProps {
  transactions: Transaction[];
  categories: Category[];
}

const SpendingAccordion = ({ transactions, categories }: SpendingAccordionProps) => {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const expenses = transactions.filter((t) => t.type === 'expense');

  const groups: Record<GroupType, number> = { essenciais: 0, desejos: 0, prioridades: 0 };
  expenses.forEach((t) => {
    const cat = categoryMap.get(t.category_id || '');
    if (cat) groups[cat.group_type] += Number(t.amount);
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <AccordionItem value="spending" className="border-border/50">
      <AccordionTrigger className="px-4 text-sm font-semibold text-foreground hover:no-underline">
        Como estou gastando?
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {totalIncome === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Adicione receitas para ver a comparação com a meta ideal.
          </p>
        ) : (
          <div className="space-y-5">
            {(Object.keys(groups) as GroupType[]).map((group) => {
              const limit = GROUP_LIMITS[group];
              const idealAmount = totalIncome * limit;
              const spent = groups[group];
              const percentOfIdeal = Math.min((spent / idealAmount) * 100, 100);
              const isOver = spent > idealAmount;
              const percentLabel = totalIncome > 0 ? Math.round((spent / totalIncome) * 100) : 0;

              return (
                <div key={group} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isOver ? (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {GROUP_LABELS[group]}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      {percentLabel}%
                    </span>
                  </div>

                  <div className="relative">
                    <Progress
                      value={percentOfIdeal}
                      className={`h-3 ${isOver ? '[&>div]:bg-warning' : '[&>div]:bg-success'}`}
                    />
                    {/* Ideal limit marker */}
                    <div
                      className="absolute top-0 h-3 border-r-2 border-dashed border-foreground/40"
                      style={{ left: `${limit * 100}%` }}
                      title={`Meta: ${(limit * 100).toFixed(0)}%`}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(spent)} / {formatCurrency(idealAmount)}{' '}
                    <span className="text-muted-foreground/70">({(limit * 100).toFixed(0)}%)</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default SpendingAccordion;
