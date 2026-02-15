import { Transaction, Category, GroupType, GROUP_LABELS } from '@/types/finance';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

interface SpendingAccordionProps {
  transactions: Transaction[];
  categories: Category[];
}

const SpendingAccordion = ({ transactions, categories }: SpendingAccordionProps) => {
  const now = new Date();
  const monthExpenses = transactions.filter((t) => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const groups: Record<GroupType, number> = { essenciais: 0, desejos: 0, prioridades: 0 };

  monthExpenses.forEach((t) => {
    const cat = categoryMap.get(t.category_id || '');
    if (cat) groups[cat.group_type] += Number(t.amount);
  });

  const maxValue = Math.max(...Object.values(groups), 1);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <AccordionItem value="spending" className="border-border/50">
      <AccordionTrigger className="px-4 text-sm font-semibold text-foreground hover:no-underline">
        Como estou gastando?
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          {(Object.keys(groups) as GroupType[]).map((group) => (
            <div key={group} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{GROUP_LABELS[group]}</span>
                <span className="font-medium text-foreground">{formatCurrency(groups[group])}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(groups[group] / maxValue) * 100}%`,
                    backgroundColor: `hsl(var(--chart-${group}))`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default SpendingAccordion;
