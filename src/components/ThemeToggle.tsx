import { Moon, SunMedium } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  compact?: boolean;
}

const ThemeToggle = ({ compact = false }: ThemeToggleProps) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className={`group inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 p-1 text-slate-600 shadow-[0_10px_22px_rgba(15,23,42,0.06)] backdrop-blur transition-all duration-300 hover:-translate-y-[1px] hover:bg-white dark:border-[#263731] dark:bg-[#16211D] dark:text-[#E6F2EE] dark:shadow-[0_12px_28px_rgba(3,10,8,0.4)] ${
        compact ? 'h-10 pl-1 pr-1.5' : 'h-11 pl-1 pr-2'
      }`}
    >
      <span
        className={`relative inline-flex items-center rounded-full transition-all duration-300 ${
          compact ? 'h-8 w-14' : 'h-9 w-16'
        } ${isDark ? 'bg-[#2F6F5E]' : 'bg-slate-100 dark:bg-[#1B2823]'}`}
      >
        <span
          className={`absolute inset-y-1 rounded-full bg-white shadow-[0_8px_18px_rgba(15,23,42,0.18)] transition-all duration-300 dark:bg-[#0B1210] ${
            compact
              ? isDark
                ? 'left-[30px] w-6'
                : 'left-1 w-6'
              : isDark
                ? 'left-[34px] w-7'
                : 'left-1 w-7'
          }`}
        />
        <span className="relative z-10 flex w-full items-center justify-between px-2">
          <SunMedium className={`h-3.5 w-3.5 transition-opacity ${isDark ? 'opacity-35 text-[#B8CBC3]' : 'opacity-100 text-amber-500'}`} />
          <Moon className={`h-3.5 w-3.5 transition-opacity ${isDark ? 'opacity-100 text-[#E6F2EE]' : 'opacity-40 text-slate-500'}`} />
        </span>
      </span>
      {!compact ? (
        <span className="pr-1 text-[0.8rem] font-medium tracking-[-0.01em] text-slate-600 dark:text-[#B8CBC3]">
          {isDark ? 'Escuro' : 'Claro'}
        </span>
      ) : null}
    </button>
  );
};

export default ThemeToggle;
