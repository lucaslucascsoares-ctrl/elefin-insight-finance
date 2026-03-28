import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthPickerProps {
  label: string;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const navButtonClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40';

const MonthPicker = ({ label, canGoNext, onPrevious, onNext }: MonthPickerProps) => {
  return (
    <div className="flex items-center justify-center gap-3 px-4 py-2">
      <button
        type="button"
        className={navButtonClass}
        onClick={onPrevious}
        aria-label="Voltar um mês"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <span className="min-w-0 flex-1 break-words text-center text-sm font-semibold capitalize text-foreground sm:flex-none sm:min-w-[180px]">
        {label}
      </span>

      <button
        type="button"
        className={navButtonClass}
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Avançar um mês"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default MonthPicker;
