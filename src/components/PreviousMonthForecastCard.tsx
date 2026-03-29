import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, Lock } from 'lucide-react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
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
  danger: 'bg-destructive/12 text-destructive',
  info: 'bg-[#21453C] text-[#9FD5C2]',
  success: 'bg-emerald-500/12 text-emerald-700',
};

const sourceToneClass: Record<ForecastItem['source'], string> = {
  recurring: 'bg-[#21453C] text-[#E6F2EE]',
  history: 'bg-[#1B2823] text-[#9FD5C2]',
  manual: 'bg-amber-500/12 text-amber-700',
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
        <div className="rounded-[28px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] px-4 py-5 shadow-[0_18px_36px_rgba(15,23,42,0.06)] dark:border-[#263731] dark:bg-[linear-gradient(180deg,#111A17,#16211D)] dark:shadow-[0_18px_38px_rgba(3,10,8,0.34)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-[#8EA39B]">Previsão</p>
              <h3 className="mt-1 break-words text-[1.05rem] font-semibold tracking-[-0.02em] text-foreground dark:text-[#E6F2EE]">
                {data ? `Previsão baseada em ${data.mesReferencia}` : 'Previsão baseada no mês anterior'}
              </h3>
              <p className="mt-1 break-words text-sm leading-6 text-muted-foreground dark:text-[#B8CBC3]">
                Clique para {isOpen ? 'ocultar' : 'ver'} a previsão.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-amber-500/12 px-3 py-1 text-[11px] font-semibold text-amber-700 dark:bg-[#1B2823] dark:text-[#B8CBC3]">
                somente leitura
              </span>
              <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 shadow-[0_10px_20px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-[1px] hover:bg-slate-50 hover:text-slate-700 dark:border-[#263731] dark:bg-[#1B2823] dark:text-[#B8CBC3] dark:shadow-none dark:hover:bg-[#21453C] dark:hover:text-[#E6F2EE]"
                aria-label={isOpen ? 'Ocultar previsão' : 'Mostrar previsão'}
              >
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isOpen ? (
            <div className="mt-4">
              {data ? (
                <>
                  <div className="flex items-start gap-3 rounded-3xl border border-slate-200/70 bg-[linear-gradient(180deg,rgba(244,248,245,0.96),rgba(232,239,234,0.88))] px-4 py-4 dark:!border-[#314740] dark:bg-none dark:!bg-[#16211D]">
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-amber-600 shadow-[0_8px_18px_rgba(15,23,42,0.05)] dark:!bg-[#21453C] dark:!text-[#CDE4DB] dark:shadow-none">
                      <Lock className="h-4 w-4" />
                    </span>
                    <p className="text-sm leading-7 text-muted-foreground dark:!text-[#C5D8D0]">
                      Esses dados refletem seus gastos do mês anterior e servem como referência para o mês atual.
                      Contas fixas entram primeiro, e o histórico recente complementa a previsão.
                    </p>
                  </div>

                  <div className="mt-5 overflow-x-auto rounded-3xl border border-slate-200/80 bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:border-[#263731] dark:bg-[#16211D] dark:shadow-none">
                    <div className="min-w-[580px]">
                      <div className="grid grid-cols-[minmax(160px,1.35fr)_minmax(120px,1fr)_minmax(150px,1fr)_auto] gap-5 border-b border-slate-200/70 bg-slate-50/70 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:border-[#263731] dark:bg-[#1B2823] dark:text-[#8EA39B]">
                        <span>Categoria</span>
                        <span className="text-right">{previousMonthShortLabel}</span>
                        <span className="text-right">Previsão {currentMonthShortLabel}</span>
                        <span className="text-right">Variação</span>
                      </div>

                      <div className="divide-y divide-slate-200/70 dark:divide-[#263731]">
                        {data.categorias.map((categoria) => {
                          const variation = getVariation(categoria.valorReal, categoria.previsaoMesAtual);
                          const isClickable = categoria.itens.length > 0;

                          return (
                            <button
                              key={categoria.nome}
                              type="button"
                              onClick={() => isClickable && setSelectedCategoryName(categoria.nome)}
                              className="grid w-full grid-cols-[minmax(160px,1.35fr)_minmax(120px,1fr)_minmax(150px,1fr)_auto] gap-5 px-5 py-4 text-left text-sm transition-colors hover:bg-slate-50/70 disabled:cursor-default dark:hover:bg-[#1B2823]"
                              disabled={!isClickable}
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="break-words font-medium text-foreground">{categoria.nome}</span>
                                {isClickable ? <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" /> : null}
                              </div>
                              <span className="text-right text-muted-foreground">{formatCurrency(categoria.valorReal)}</span>
                              <span className="text-right font-semibold tracking-[-0.01em] text-foreground">
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

                      <div className="border-t border-slate-200/70 bg-slate-50/60 px-5 py-5 dark:border-[#263731] dark:bg-[#1B2823]">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                          <span className="text-base font-semibold tracking-[-0.01em] text-foreground">Total previsto</span>
                          <div className="sm:text-right">
                            <p className="text-[1.6rem] font-bold tracking-[-0.04em] text-foreground">
                              {formatCurrency(data.totalPrevisto)}
                            </p>
                            <p className="text-sm leading-6 text-muted-foreground">
                              vs {formatCurrency(data.totalGastoAnterior)} em {data.mesReferencia}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-3 rounded-3xl border border-slate-200/70 bg-[linear-gradient(180deg,rgba(244,248,245,0.96),rgba(232,239,234,0.88))] px-4 py-4 dark:!border-[#314740] dark:bg-none dark:!bg-[#16211D]">
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-amber-600 shadow-[0_8px_18px_rgba(15,23,42,0.05)] dark:!bg-[#21453C] dark:!text-[#CDE4DB] dark:shadow-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <p className="text-sm leading-7 text-muted-foreground dark:text-[#B8CBC3]">Sem dados do mês anterior para comparar.</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <Drawer open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategoryName(null)}>
        <DrawerContent className="max-h-[85dvh] border-t border-slate-200/80 bg-[rgba(255,255,255,0.98)] backdrop-blur-xl dark:border-[#263731] dark:bg-[rgba(11,18,16,0.96)]">
          <DrawerHeader>
            <DrawerTitle className="tracking-[-0.02em]">
              {selectedCategory?.nome || 'Detalhes da previsão'}
            </DrawerTitle>
            <DrawerDescription>
              Itens previstos para {currentMonthLabel}, com origem recorrente ou histórica.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-3 overflow-y-auto px-4 pb-6">
            {selectedCategory?.itens.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] px-4 py-4 shadow-[0_14px_26px_rgba(15,23,42,0.05)] dark:border-[#263731] dark:bg-[#16211D] dark:shadow-[0_14px_26px_rgba(3,10,8,0.28)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs leading-6 text-muted-foreground dark:text-[#8EA39B]">
                      Base: {item.source === 'recurring' ? 'regra recorrente' : `${previousMonthShortLabel}`}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tracking-[-0.01em] text-foreground">
                    {formatCurrency(item.amount)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${sourceToneClass[item.source]}`}>
                    {FORECAST_SOURCE_LABELS[item.source]}
                  </span>
                  <span className="text-[11px] text-muted-foreground dark:text-[#8EA39B]">
                    {item.source === 'recurring'
                      ? 'Tem prioridade na previsão'
                      : 'Entrou pelo histórico do mês anterior'}
                  </span>
                </div>
              </div>
            ))}

            {selectedCategory && selectedCategory.itens.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 px-4 py-4 text-sm text-muted-foreground dark:bg-[#1B2823] dark:text-[#8EA39B]">
                Nenhum item detalhado nesta categoria.
              </div>
            ) : null}

            <Button variant="outline" className="w-full rounded-2xl" onClick={() => setSelectedCategoryName(null)}>
              Fechar detalhes
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default PreviousMonthForecastCard;
