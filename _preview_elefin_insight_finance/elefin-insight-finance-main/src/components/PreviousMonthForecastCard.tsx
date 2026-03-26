import { useState } from 'react';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { DadosMesAnterior } from '@/types/finance';

interface PreviousMonthForecastCardProps {
  data: DadosMesAnterior | null;
  currentMonthLabel: string;
  currentMonthShortLabel: string;
  previousMonthShortLabel: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const getVariation = (previousValue: number, currentValue: number) => {
  if (Math.abs(previousValue - currentValue) < 0.005) {
    return { label: 'igual', tone: 'success' as const };
  }

  if (previousValue === 0) {
    return {
      label: currentValue > 0 ? '+100%' : 'igual',
      tone: currentValue > 0 ? ('danger' as const) : ('success' as const),
    };
  }

  const percentage = Math.round(((currentValue - previousValue) / previousValue) * 100);

  if (percentage > 0) {
    return { label: `+${percentage}%`, tone: 'danger' as const };
  }

  return { label: `${percentage}%`, tone: 'info' as const };
};

const pillToneClass = {
  danger: 'bg-destructive/15 text-destructive',
  info: 'bg-sky-500/15 text-sky-600',
  success: 'bg-emerald-500/15 text-emerald-600',
};

const PreviousMonthForecastCard = ({
  data,
  currentMonthLabel,
  currentMonthShortLabel,
  previousMonthShortLabel,
}: PreviousMonthForecastCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="px-4 pt-4">
      <div className="rounded-[26px] border border-border bg-card px-4 py-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">
              {data ? `Previsao baseada em ${data.mes}` : 'Previsao baseada no mes anterior'}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Clique para {isOpen ? 'ocultar' : 'ver'} a previsao
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-semibold text-amber-700">
              leitura
            </span>
            <button
              type="button"
              onClick={() => setIsOpen((current) => !current)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={isOpen ? 'Ocultar previsao' : 'Mostrar previsao'}
            >
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="pointer-events-none mt-4">
            {data ? (
              <>
                <div className="flex items-start gap-3 rounded-2xl bg-muted/40 px-3 py-3">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Esses dados refletem seus gastos de {previousMonthShortLabel} e servem apenas como referencia para {currentMonthLabel}.
                  </p>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-border/80">
                  <div className="grid grid-cols-[1.2fr_1fr_1fr_auto] gap-3 border-b border-border bg-muted/30 px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>Categoria</span>
                    <span className="text-right">{previousMonthShortLabel}</span>
                    <span className="text-right">Previsao {currentMonthShortLabel}</span>
                    <span className="text-right">Variacao</span>
                  </div>

                  <div className="divide-y divide-border/80">
                    {data.categorias.map((categoria) => {
                      const variation = getVariation(categoria.valorReal, categoria.previsaoMesAtual);

                      return (
                        <div
                          key={categoria.nome}
                          className="grid grid-cols-[1.2fr_1fr_1fr_auto] gap-3 px-3 py-3 text-sm"
                        >
                          <span className="font-medium text-foreground">{categoria.nome}</span>
                          <span className="text-right text-muted-foreground">
                            {formatCurrency(categoria.valorReal)}
                          </span>
                          <span className="text-right font-semibold text-foreground">
                            {formatCurrency(categoria.previsaoMesAtual)}
                          </span>
                          <div className="flex justify-end">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pillToneClass[variation.tone]}`}>
                              {variation.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-border bg-muted/20 px-3 py-4">
                    <div className="flex items-end justify-between gap-4">
                      <span className="text-base font-semibold text-foreground">Total previsto</span>
                      <div className="text-right">
                        <p className="text-xl font-bold text-foreground">
                          {formatCurrency(
                            data.categorias.reduce((sum, categoria) => sum + categoria.previsaoMesAtual, 0),
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          vs {formatCurrency(data.totalGasto)} em {data.mes}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-3 rounded-2xl bg-muted/40 px-3 py-4">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Sem dados do mes anterior para comparar.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default PreviousMonthForecastCard;
