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
      <div className="h-full min-h-[102px] min-w-0 overflow-hidden rounded-[24px] border border-[#D6E1CC] bg-[#FDFEFB] px-2 py-2.5 shadow-[0_14px_28px_rgba(92,134,109,0.08)] min-[380px]:min-h-[118px] min-[380px]:rounded-[28px] min-[380px]:px-3 min-[380px]:py-3 min-[420px]:min-h-[132px] min-[420px]:px-4 min-[420px]:py-4 dark:border-[#233027] dark:bg-[#111A14] dark:shadow-[0_4px_12px_rgba(0,0,0,0.40)]">
        <div className="flex h-full min-w-0 flex-col items-center justify-center gap-2 text-center min-[420px]:gap-3">
          <div className="min-w-0">
            <p className="text-[0.56rem] font-medium uppercase tracking-[0.12em] text-[#9B7A4B] min-[380px]:text-[0.64rem] min-[420px]:text-[0.74rem] min-[420px]:tracking-[0.18em] dark:text-[#ABBC82] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">
              {eyebrow}
            </p>
          </div>
          <span className={`block min-w-0 max-w-full overflow-hidden whitespace-nowrap text-center text-[clamp(0.6rem,1.95vw,0.78rem)] font-bold leading-none tracking-[-0.015em] min-[380px]:text-[clamp(0.72rem,2.15vw,0.9rem)] min-[420px]:text-[1.08rem] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)] ${valueClass}`}>
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
