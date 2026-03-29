import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthPickerProps {
  label: string;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const navButtonClass =
  'inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 shadow-[0_10px_22px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-[1px] hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40';

const MonthPicker = ({ label, canGoNext, onPrevious, onNext }: MonthPickerProps) => {
  return (
    <div className="px-4 py-4">
      <div className="rounded-[26px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between gap-3">
          <button type="button" className={navButtonClass} onClick={onPrevious} aria-label="Voltar um mês">
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1 text-center">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-400">Mês atual</p>
            <span className="mt-1 block break-words text-[1.02rem] font-semibold capitalize tracking-[-0.02em] text-foreground">
              {label}
            </span>
          </div>

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
      </div>
    </div>
  );
};

export default MonthPicker;
