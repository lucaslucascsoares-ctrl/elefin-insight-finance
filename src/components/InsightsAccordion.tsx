import { Transaction, Category } from '@/types/finance';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, MessageCircle } from 'lucide-react';
import { generateInsight } from '@/lib/insights';

interface InsightsAccordionProps {
  transactions: Transaction[];
  categories: Category[];
}

const InsightsAccordion = ({ transactions, categories }: InsightsAccordionProps) => {
  const insight = generateInsight(transactions, categories);

  return (
    <AccordionItem value="insights" className="border-border/50">
      <AccordionTrigger className="px-4 text-sm font-semibold text-foreground hover:no-underline">
        Qual o próximo passo?
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="mt-0.5">
                <Lightbulb className={`h-5 w-5 ${insight.type === 'warning' ? 'text-warning' : 'text-success'}`} />
              </div>
              <p className="text-sm text-foreground leading-relaxed">{insight.message}</p>
            </div>
          </CardContent>
        </Card>

        {/* Help CTA Section */}
        <div id="help-section" className="mt-6 space-y-2">
          <h3 className="text-sm font-semibold text-foreground text-center">Precisa de ajuda?</h3>
          <Button
            variant="outline"
            className="w-full h-12 text-sm"
            onClick={() => {}}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Falar com um Especialista
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default InsightsAccordion;
