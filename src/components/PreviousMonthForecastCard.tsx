import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, Lock } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ForecastItem, MonthlyForecastData } from '@/types/finance';
import { FORECAST_SOURCE_LABELS } from '@/lib/forecast';

interface PreviousMonthForecastCardProps {
  data: MonthlyForecastData | null;
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

const sourceToneClass: Record<ForecastItem['source'], string> = {
  recurring: 'bg-slate-800 text-white',
  history: 'bg-sky-500/15 text-sky-700',
  manual: 'bg-amber-500/15 text-amber-700',
};

const PreviousMonthForecastCard = ({
  data,
  currentMonthLabel,
  currentMonthShortLabel,
  previousMonthShortLabel,
}: PreviousMonthForecastCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => data?.categorias.find((categoria) => categoria.nome === selectedCategoryName) ?? null,
    [data, selectedCategoryName],
  );

  return (
    <>
      <section className="px-4 pt-4">
        <div className="rounded-[26px] border border-border bg-card px-4 py-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="break-words text-[15px] font-semibold text-foreground">
                {data ? `Previsão baseada em ${data.mesReferencia}` : 'Previsão baseada no mês anterior'}
              </h3>
              <p className="mt-1 break-words text-sm text-muted-foreground">
                Clique para {isOpen ? 'ocultar' : 'ver'} a previsão
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-semibold text-amber-700">
                somente leitura
              </span>
              <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={isOpen ? 'Ocultar previsão' : 'Mostrar previsão'}
              >
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isOpen && (
            <div className="mt-4">
              {data ? (
                <>
                  <div className="flex items-start gap-3 rounded-2xl bg-muted/40 px-3 py-3">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Esses dados refletem seus gastos do mês anterior e servem como referência para o mês atual.
                      Contas fixas entram primeiro, e o histórico recente complementa a previsão.
                    </p>
                  </div>

                  <div className="mt-5 overflow-x-auto rounded-2xl border border-border/80">
                    <div className="min-w-[560px]">
                      <div className="grid grid-cols-[minmax(140px,1.35fr)_minmax(110px,1fr)_minmax(140px,1fr)_auto] gap-4 border-b border-border bg-muted/30 px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        <span>Categoria</span>
                        <span className="text-right">{previousMonthShortLabel}</span>
                        <span className="text-right">Previsão {currentMonthShortLabel}</span>
                        <span className="text-right">Variação</span>
                      </div>

                      <div className="divide-y divide-border/80">
                        {data.categorias.map((categoria) => {
                          const variation = getVariation(categoria.valorReal, categoria.previsaoMesAtual);
                          const isClickable = categoria.itens.length > 0;

                          return (
                            <button
                              key={categoria.nome}
                              type="button"
                              onClick={() => isClickable && setSelectedCategoryName(categoria.nome)}
                              className="grid w-full grid-cols-[minmax(140px,1.35fr)_minmax(110px,1fr)_minmax(140px,1fr)_auto] gap-4 px-4 py-4 text-left text-sm transition hover:bg-muted/20 disabled:cursor-default"
                              disabled={!isClickable}
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="break-words font-medium text-foreground">{categoria.nome}</span>
                                {isClickable && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                              </div>
                              <span className="text-right text-muted-foreground">{formatCurrency(categoria.valorReal)}</span>
                              <span className="text-right font-semibold text-foreground">
                                {formatCurrency(categoria.previsaoMesAtual)}
                              </span>
                              <div className="flex justify-end">
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pillToneClass[variation.tone]}`}>
                                  {variation.label}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="border-t border-border bg-muted/20 px-4 py-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                          <span className="text-base font-semibold text-foreground">Total previsto</span>
                          <div className="sm:text-right">
                            <p className="text-xl font-bold text-foreground">{formatCurrency(data.totalPrevisto)}</p>
                            <p className="text-sm text-muted-foreground">
                              vs {formatCurrency(data.totalGastoAnterior)} em {data.mesReferencia}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-3 rounded-2xl bg-muted/40 px-3 py-4">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p className="text-sm leading-relaxed text-muted-foreground">Sem dados do mês anterior para comparar.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Drawer open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategoryName(null)}>
        <DrawerContent className="max-h-[85dvh]">
          <DrawerHeader>
            <DrawerTitle>{selectedCategory?.nome || 'Detalhes da previsão'}</DrawerTitle>
            <DrawerDescription>Itens previstos para {currentMonthLabel}, com origem recorrente ou histórica.</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-3 overflow-y-auto px-4 pb-6">
            {selectedCategory?.itens.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Base: {item.source === 'recurring' ? 'regra recorrente' : `${previousMonthShortLabel}`}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-foreground">{formatCurrency(item.amount)}</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${sourceToneClass[item.source]}`}>
                    {FORECAST_SOURCE_LABELS[item.source]}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {item.source === 'recurring'
                      ? 'Tem prioridade na previsão'
                      : 'Entrou pelo histórico do mês anterior'}
                  </span>
                </div>
              </div>
            ))}

            {selectedCategory && selectedCategory.itens.length === 0 && (
              <div className="rounded-2xl bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
                Nenhum item detalhado nesta categoria.
              </div>
            )}

            <Button variant="outline" className="w-full" onClick={() => setSelectedCategoryName(null)}>
              Fechar detalhes
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default PreviousMonthForecastCard;
