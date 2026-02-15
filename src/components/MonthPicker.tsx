import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthPickerProps {
  month: number; // 0-11
  year: number;
  onChange: (month: number, year: number) => void;
}

const MonthPicker = ({ month, year, onChange }: MonthPickerProps) => {
  const now = new Date();
  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();

  const handlePrev = () => {
    if (month === 0) {
      onChange(11, year - 1);
    } else {
      onChange(month - 1, year);
    }
  };

  const handleNext = () => {
    if (isCurrentMonth) return;
    if (month === 11) {
      onChange(0, year + 1);
    } else {
      onChange(month + 1, year);
    }
  };

  const label = format(new Date(year, month), "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        onClick={handlePrev}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium text-foreground capitalize min-w-[160px] text-center">
        {label}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        onClick={handleNext}
        disabled={isCurrentMonth}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MonthPicker;
