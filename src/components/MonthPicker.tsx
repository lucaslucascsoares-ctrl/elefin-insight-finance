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
        aria-label="Voltar um mes"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <span className="min-w-[180px] text-center text-sm font-semibold capitalize text-foreground">
        {label}
      </span>

      <button
        type="button"
        className={navButtonClass}
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Avancar um mes"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default MonthPicker;
