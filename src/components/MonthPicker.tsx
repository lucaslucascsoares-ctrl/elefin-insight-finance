import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthPickerProps {
  label: string;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const navButtonClass =
  'inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 shadow-[0_8px_18px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-[1px] hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 min-[380px]:h-10 min-[380px]:w-10 dark:border-[#314740] dark:bg-[#16211D] dark:text-[#B8CBC3] dark:hover:bg-[#1B2823] dark:hover:text-[#E6F2EE]';

const MonthPicker = ({ label, canGoNext, onPrevious, onNext }: MonthPickerProps) => {
  return (
    <div className="px-4 py-3">
      <div className="rounded-[24px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] px-4 py-2.5 shadow-[0_12px_24px_rgba(15,23,42,0.05)] min-[380px]:rounded-[26px] min-[380px]:py-3 dark:border-[#263731] dark:bg-[linear-gradient(180deg,#111A17,#16211D)] dark:shadow-[0_18px_36px_rgba(3,10,8,0.34)]">
        <div className="flex items-center justify-between gap-3">
          <button type="button" className={navButtonClass} onClick={onPrevious} aria-label="Voltar um mês">
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1 text-center">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#9B7A4B] min-[380px]:text-[0.72rem] min-[380px]:tracking-[0.16em] dark:text-[#8EA39B]">
              Mês atual
            </p>
            <span className="mt-0.5 block text-[0.98rem] font-semibold capitalize tracking-[-0.02em] text-[#314238] [overflow-wrap:normal] min-[380px]:mt-1 min-[380px]:text-[1.02rem] dark:text-[#E6F2EE]">
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
