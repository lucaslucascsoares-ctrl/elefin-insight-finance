interface BalanceSummaryCardProps {
  eyebrow: string;
  title: string;
  value: number;
  compact: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const BalanceSummaryCard = ({ eyebrow = 'Saldo', title, value, compact = false }: BalanceSummaryCardProps) => {
  const valueClass = value >= 0 ? 'text-[hsl(var(--success))]' : 'text-destructive';

  if (compact) {
    return (
      <div className="h-full min-h-[96px] min-w-0 rounded-2xl border border-[#D6E1CC] bg-[#EEF3E6] px-1.5 py-3 shadow-[0_14px_28px_rgba(92,134,109,0.08),inset_0_1px_0_rgba(255,255,255,0.56)] min-[380px]:rounded-3xl min-[380px]:px-2 min-[420px]:min-h-[128px] min-[420px]:px-4 min-[420px]:py-4 dark:border-[#233027] dark:bg-[#111A14] dark:shadow-[0_4px_12px_rgba(0,0,0,0.40)]">
        <div className="flex h-full min-w-0 flex-col items-center justify-between gap-2 text-center min-[420px]:gap-3">
          <div className="min-w-0">
            <p className="text-[0.56rem] font-semibold uppercase tracking-[0.08em] text-[#9B7A4B] min-[380px]:text-[0.62rem] min-[420px]:text-[0.72rem] min-[420px]:tracking-[0.16em] dark:text-[#ABBC82] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">
              {eyebrow}
            </p>
            <span className="mt-1.5 block min-w-0 text-[0.76rem] font-semibold leading-tight text-[#314238] [overflow-wrap:normal] min-[380px]:text-[0.82rem] min-[420px]:mt-2 min-[420px]:text-[0.95rem] dark:text-[#E8EEE9]">
              {title}
            </span>
          </div>
          <span className={`block min-w-0 max-w-full whitespace-nowrap text-center text-[clamp(0.56rem,2.35vw,0.8rem)] font-bold leading-none tracking-[-0.04em] min-[380px]:text-[clamp(0.66rem,2.5vw,0.9rem)] min-[420px]:text-[1.2rem] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)] ${valueClass}`}>
            {formatCurrency(value)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-3xl border border-[#D6E1CC] bg-[#EEF3E6] px-4 py-4 shadow-[0_14px_28px_rgba(92,134,109,0.08),inset_0_1px_0_rgba(255,255,255,0.56)] dark:border-[#233027] dark:bg-[#111A14] dark:shadow-[0_4px_12px_rgba(0,0,0,0.40)]">
      <div className="flex min-w-0 items-end justify-between gap-4">
        <div className="min-w-0">
          <span className="block min-w-0 text-[0.98rem] font-semibold leading-tight tracking-[-0.02em] text-[#314238] dark:text-[#E8EEE9]">
            {title}
          </span>
        </div>
        <span className={`min-w-0 whitespace-nowrap text-right text-[clamp(1.1rem,2.8vw,1.45rem)] font-bold tracking-[-0.04em] leading-none dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)] ${valueClass}`}>
          {formatCurrency(value)}
        </span>
      </div>
    </div>
  );
};

export default BalanceSummaryCard;
