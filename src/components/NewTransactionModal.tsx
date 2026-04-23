import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, Minus, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useAddCategory } from '@/hooks/useCategories';
import { useAddTransaction } from '@/hooks/useTransactions';
import { cn } from '@/lib/utils';
import { CATEGORY_TAXONOMY, getCustomCategoriesByGroup } from '@/lib/categoryTaxonomy';
import { getTransactionDateForMonth } from '@/lib/transactionDates';
import { Category, GroupType, RecurringRuleInput } from '@/types/finance';

interface NewTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  initialType: 'income' | 'expense';
  lockedType: boolean;
  selectedDate: Date;
  onSaveRecurringRule: (input: RecurringRuleInput) => void | Promise<unknown>;
}

const GROUP_TITLES: Record<GroupType, string> = {
  essenciais: 'ESSENCIAIS',
  desejos: 'ESTILO DE VIDA',
  prioridades: 'PRIORIDADES',
};

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const repairCategoryLabel = (value: string) =>
  value
    .replace(/Empr\?stimos/gi, 'Empréstimos')
    .replace(/Cart\?es de Cr[?e]dito/gi, 'Cartões de Crédito')
    .replace(/D[?i]vidas de Financiamentos/gi, 'Dívidas de Financiamentos')
    .replace(/Alimenta\?\?o/gi, 'Alimentação')
    .replace(/Educa\?\?o/gi, 'Educação')
    .replace(/Sa\?de/gi, 'Saúde')
    .replace(/Habita\?\?o/gi, 'Habitação');

const getCanonicalCategoryName = (name: string, groupType: GroupType) => {
  const repairedName = repairCategoryLabel(name);
  const normalizedName = normalize(repairedName);

  if (groupType === 'essenciais' && (normalizedName === 'espaco' || normalizedName === '')) {
    return 'Aluguel';
  }

  return repairedName;
};

const NewTransactionModal = ({
  open,
  onOpenChange,
  categories,
  initialType = 'expense',
  lockedType = false,
  selectedDate,
  onSaveRecurringRule,
}: NewTransactionModalProps) => {
  const { userId } = useAuth();
  const addTransaction = useAddTransaction();
  const addCategory = useAddCategory();

  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<GroupType | null>(null);
  const [expandedSubcategoryId, setExpandedSubcategoryId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [repeatMonthly, setRepeatMonthly] = useState(false);

  useEffect(() => {
    if (!open) return;

    setType(initialType);
    setAmount('');
    setDescription('');
    setSelectedCategoryId(null);
    setCategoryPickerOpen(false);
    setExpandedGroup(null);
    setExpandedSubcategoryId(null);
    setFormError('');
    setRepeatMonthly(false);
  }, [initialType, open]);

  const selectedCategory = useMemo(
    () => categories.filter(Boolean).find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  const selectedCategoryLabel = useMemo(() => {
    if (!selectedCategory) return null;
    return getCanonicalCategoryName(selectedCategory.name, selectedCategory.group_type ?? 'essenciais');
  }, [selectedCategory]);

  const handleTypeChange = (nextType: 'income' | 'expense') => {
    if (lockedType) return;

    setType(nextType);
    setFormError('');

    if (nextType === 'income') {
      setCategoryPickerOpen(false);
      setSelectedCategoryId(null);
    }
  };

  const resolveCategory = async (name: string, groupType: GroupType) => {
    const canonicalName = getCanonicalCategoryName(name, groupType);
    const existing = categories.filter(Boolean).find(
      (category) => category?.group_type === groupType && normalize(category?.name ?? '') === normalize(canonicalName),
    );

    if (existing) {
      return existing;
    }

    if (!userId) {
      throw new Error('Usu?rio n?o autenticado.');
    }

    return addCategory.mutateAsync({
      name: canonicalName,
      group_type: groupType,
      user_id: userId,
    });
  };

  const handleCategorySelect = async (name: string, groupType: GroupType) => {
    try {
      setFormError('');
      const category = await resolveCategory(name, groupType);
      setSelectedCategoryId(category.id);
      setCategoryPickerOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'N?o foi poss?vel carregar a categoria.');
    }
  };

  const handleSubmit = async () => {
    const numericAmount = Number(amount.replace(',', '.'));
    const transactionDate = getTransactionDateForMonth(selectedDate);

    if (!userId) {
      setFormError('Sua sess?o expirou. Entre novamente.');
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setFormError('Informe um valor v?lido.');
      return;
    }

    if (type === 'expense' && !selectedCategoryId) {
      setFormError('Selecione uma categoria para a saída.');
      return;
    }

    try {
      setFormError('');
      await addTransaction.mutateAsync({
        user_id: userId,
        type,
        amount: numericAmount,
        category_id: type === 'expense' ? selectedCategoryId : null,
        description: description.trim() || null,
        date: transactionDate,
      });

      if (type === 'expense' && repeatMonthly && selectedCategoryId && onSaveRecurringRule) {
        await onSaveRecurringRule({
          type,
          amount: numericAmount,
          category_id: selectedCategoryId,
          description: description.trim() || null,
          starts_at: transactionDate,
        });
      }

      onOpenChange(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar a movimentação.');
    }
  };

  const renderCategoryPanel = () => (
    <div className="mt-3 rounded-[20px] border border-[#e8e3d8] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-[#233027] dark:bg-[#111A14] dark:shadow-[0_12px_24px_rgba(0,0,0,0.50)]">
      <div className="max-h-48 overflow-y-auto px-2 py-2">
        {CATEGORY_TAXONOMY.map((taxonomyGroup) => {
          const groupType = taxonomyGroup.groupType;
          const isGroupExpanded = expandedGroup === groupType;
          const customCategories = getCustomCategoriesByGroup(categories, groupType);

          return (
            <div key={groupType} className="rounded-[16px]">
              <button
                type="button"
                onClick={() => {
                  setExpandedGroup((current) => (current === groupType ? null : groupType));
                  setExpandedSubcategoryId(null);
                }}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold tracking-[0.08em] text-slate-500 dark:text-[#94A39B]">
                  {GROUP_TITLES[groupType]}
                </span>
                {isGroupExpanded ? (
                  <Minus className="h-4 w-4 text-slate-500 dark:text-[#94A39B]" />
                ) : (
                  <Plus className="h-4 w-4 text-slate-500 dark:text-[#94A39B]" />
                )}
              </button>

              {isGroupExpanded && (
                <div className="space-y-1 pb-2">
                  {taxonomyGroup.subcategorias.map((subcategory) => {
                    const hasItems = subcategory.itens.length > 0;
                    const isSubExpanded = expandedSubcategoryId === subcategory.id;
                    const isDirectSelected =
                      !hasItems &&
                      selectedCategory?.group_type === groupType &&
                      normalize(selectedCategory?.name ?? '') === normalize(subcategory.nome);

                    return (
                      <div key={subcategory.id} className="px-1">
                        <button
                          type="button"
                          translate="no"
                          onClick={() => {
                            if (!hasItems) {
                              void handleCategorySelect(subcategory.nome, groupType);
                              return;
                            }

                            setExpandedSubcategoryId((current) =>
                              current === subcategory.id ? null : subcategory.id,
                            );
                          }}
                          className={cn(
                            'flex w-full items-center justify-between rounded-[14px] px-4 py-2.5 text-left text-[14px] font-medium text-[#8A9A68] transition dark:text-[#CDE4DB]',
                            isDirectSelected
                              ? 'bg-[#EEF3E6] text-[#7A8A58] dark:bg-[#21453C] dark:text-[#E6F2EE]'
                              : 'hover:bg-[#F4F8EC] dark:hover:bg-[#152018]',
                          )}
                        >
                          <span className="min-w-0 flex-1 break-words">{subcategory.nome}</span>
                          {hasItems ? (
                            isSubExpanded ? (
                              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 dark:text-[#94A39B]" />
                            ) : (
                              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 dark:text-[#94A39B]" />
                            )
                          ) : null}
                        </button>

                        {isSubExpanded && hasItems && (
                          <div className="ml-3 mt-1 space-y-1 border-l-2 border-[#f0ece2] pl-2 dark:border-[#233027]">
                            {subcategory.itens.map((item) => {
                              const isSelected =
                                selectedCategory?.group_type === groupType &&
                                normalize(selectedCategory?.name ?? '') === normalize(item);

                              return (
                                <button
                                  key={`${subcategory.id}-${item}`}
                                  type="button"
                                  translate="no"
                                  onClick={() => void handleCategorySelect(item, groupType)}
                                  className={cn(
                                     'flex w-full items-center rounded-[12px] px-4 py-2.5 text-left text-[14px] text-[#8A9A68] transition dark:text-[#CDE4DB]',
                                     isSelected
                                       ? 'bg-[#EEF3E6] font-medium text-[#7A8A58] dark:bg-[#21453C] dark:text-[#E6F2EE]'
                                       : 'hover:bg-[#F4F8EC] dark:hover:bg-[#152018]',
                                   )}
                                >
                                  <span className="break-words">{getCanonicalCategoryName(item, groupType)}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {customCategories.map((customCategory) => {
                    const isSelected = selectedCategory?.id === customCategory.id;

                    return (
                      <div key={customCategory.id} className="px-1">
                        <button
                          type="button"
                          translate="no"
                          onClick={() => void handleCategorySelect(customCategory.name, groupType)}
                          className={cn(
                            'flex w-full items-center rounded-[14px] px-4 py-2.5 text-left text-[14px] text-[#8A9A68] transition dark:text-[#D7E8E1]',
                            isSelected
                              ? 'bg-[#EEF3E6] font-medium text-[#7A8A58] dark:bg-[#21453C] dark:text-[#F3FBF7]'
                              : 'hover:bg-[#F4F8EC] dark:hover:bg-[#152018]',
                          )}
                        >
                          <span className="break-words">{getCanonicalCategoryName(customCategory.name, groupType)}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center border-t border-[#f0ece2] py-2 dark:border-[#233027]">
        <ChevronDown className="h-5 w-5 text-slate-600 dark:text-[#94A39B]" />
      </div>
    </div>
  );

  const isSaving = addTransaction.isPending || addCategory.isPending;
  const showExpenseCategory = type === 'expense';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] w-[min(540px,calc(100vw-64px))] max-w-[calc(100vw-64px)] flex-col gap-0 overflow-hidden rounded-[26px] border border-[#ece7de] bg-white p-0 shadow-[0_28px_90px_rgba(15,23,42,0.35)] [background:#ffffff] dark:border-[#233027] dark:bg-[#111A14] dark:shadow-[0_24px_48px_rgba(0,0,0,0.60)] [&>button:last-child]:hidden sm:rounded-[26px]">
        <DialogClose className="absolute right-6 top-6 z-10 rounded-full border border-transparent p-1 text-slate-500 transition hover:bg-[#f5f3ee] hover:text-slate-800 dark:border-[#233027] dark:text-[#94A39B] dark:hover:bg-[#152018] dark:hover:text-[#ABBC82]">
          <X className="h-7 w-7" />
          <span className="sr-only">Fechar</span>
        </DialogClose>

        <div className="flex-shrink-0 px-5 pb-4 pt-7 sm:px-8">
          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="text-[22px] font-semibold tracking-[-0.02em] text-slate-800 dark:text-[#E6F2EE] sm:text-[24px]">
              Nova Movimentação
            </DialogTitle>
            <DialogDescription className="sr-only">
              Registre uma entrada ou saída do mês atual.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 flex w-full overflow-hidden rounded-[18px] bg-[#f7f5f1] p-1.5 dark:bg-[#152018]">
            {([
              { value: 'income', label: 'Entrada' },
              { value: 'expense', label: 'Saída' },
            ] as const).map((option) => {
              const active = type === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  translate="no"
                  onClick={() => handleTypeChange(option.value)}
                  className={cn(
                    'min-w-0 flex-1 basis-0 rounded-[16px] px-4 py-3 text-[17px] font-medium transition',
                    active
                      ? 'bg-white text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:bg-[#ABBC82] dark:text-[#0F1612] dark:font-semibold dark:shadow-[0_4px_12px_rgba(171,188,130,0.25)]'
                      : 'text-slate-500 dark:text-[#C1D5CD]',
                    lockedType && !active && 'cursor-default opacity-70',
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-8">
          <div className="space-y-5 pb-2">
            <div className="space-y-2.5">
              <label className="text-[15px] text-slate-500 dark:text-[#B8CBC3]">Valor</label>
              <Input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0,00"
                className="h-[74px] rounded-[18px] border-[#e5e1d8] px-6 text-center text-[20px] font-semibold text-slate-500 shadow-none focus-visible:border-[#d9d1c2] focus-visible:ring-0 dark:border-[#233027] dark:bg-[#0F1612] dark:text-[#E6F2EE] dark:placeholder:text-[#5F6A63] dark:focus-visible:border-[#ABBC82] dark:focus-visible:ring-[#ABBC82]/20"
              />
            </div>

            {showExpenseCategory && (
              <div className="space-y-2.5">
                <label className="text-[15px] text-slate-500 dark:text-[#B8CBC3]">Categoria</label>
                <button
                  type="button"
                  onClick={() => setCategoryPickerOpen((current) => !current)}
                  className="flex h-[64px] w-full items-center justify-between gap-3 rounded-[18px] border border-[#e5e1d8] bg-white px-5 text-left text-[16px] text-slate-800 dark:border-[#233027] dark:bg-[#0F1612] dark:text-[#E6F2EE]"
                >
                  <span className="min-w-0 flex-1 truncate">{selectedCategoryLabel ?? 'Selecione a categoria'}</span>
                  {categoryPickerOpen ? (
                    <ChevronUp className="h-5 w-5 shrink-0 text-slate-500 dark:text-[#94A39B]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 shrink-0 text-slate-500 dark:text-[#94A39B]" />
                  )}
                </button>

                {categoryPickerOpen && renderCategoryPanel()}
              </div>
            )}

            {showExpenseCategory && (
              <div className="rounded-[18px] border border-[#e5e1d8] bg-[#faf8f4] px-4 py-3 dark:border-[#233027] dark:bg-[#152018]">
                <label className="flex items-start gap-3">
                  <Checkbox
                    checked={repeatMonthly}
                    onCheckedChange={(checked) => setRepeatMonthly(Boolean(checked))}
                    className="mt-0.5"
                  />
                  <span className="flex-1">
                    <span className="block text-[15px] font-medium text-slate-800 dark:text-[#E6F2EE]">Repetir todo mês</span>
                    <span className="mt-1 block text-sm text-slate-500 dark:text-[#B8CBC3]">
                      Se ativado, esta conta entra automaticamente nas pr?ximas previs?es mensais.
                    </span>
                  </span>
                </label>
              </div>
            )}

            <div className="space-y-2.5">
              <label className="text-[15px] text-slate-500 dark:text-[#B8CBC3]">Descrição (opcional)</label>
              <Input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ex: Almo?o no restaurante"
                className="h-[64px] rounded-[18px] border-[#e5e1d8] px-5 text-[16px] text-slate-700 shadow-none focus-visible:border-[#d9d1c2] focus-visible:ring-0 dark:border-[#233027] dark:bg-[#0F1612] dark:text-[#E6F2EE] dark:placeholder:text-[#5F6A63] dark:focus-visible:border-[#ABBC82] dark:focus-visible:ring-[#ABBC82]/20"
              />
            </div>

            {formError && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-[#FF6B6B]/12 dark:text-[#FF6B6B]">
                {formError}
              </p>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 px-5 pb-7 pt-3 sm:px-8 sm:pb-8">
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSaving}
            className="h-[64px] w-full rounded-[18px] bg-[#262626] text-[18px] font-semibold text-white hover:bg-[#1c1c1c] dark:bg-[#ABBC82] dark:text-[#0F1612] dark:font-semibold dark:shadow-[0_4px_12px_rgba(171,188,130,0.25)] dark:hover:bg-[#BDD494]"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewTransactionModal;
