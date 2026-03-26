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
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useAddCategory } from '@/hooks/useCategories';
import { useAddTransaction } from '@/hooks/useTransactions';
import { cn } from '@/lib/utils';
import { CATEGORY_TAXONOMY, getCustomCategoriesByGroup } from '@/lib/categoryTaxonomy';
import { Category, GroupType } from '@/types/finance';

interface NewTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  initialType?: 'income' | 'expense';
  lockedType?: boolean;
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

const NewTransactionModal = ({
  open,
  onOpenChange,
  categories,
  initialType = 'expense',
  lockedType = false,
}: NewTransactionModalProps) => {
  const { session } = useAuth();
  const addTransaction = useAddTransaction();
  const addCategory = useAddCategory();

  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<GroupType>('essenciais');
  const [expandedSubcategoryId, setExpandedSubcategoryId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!open) return;

    setType(initialType);
    setAmount('');
    setDescription('');
    setSelectedCategoryId(null);
    setCategoryPickerOpen(false);
    setExpandedGroup('essenciais');
    setExpandedSubcategoryId(null);
    setFormError('');
  }, [initialType, open]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

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
    const match = categories.find(
      (category) => category.group_type === groupType && normalize(category.name) === normalize(name),
    );

    if (match) {
      return match;
    }

    if (!session?.user?.id) {
      throw new Error('Usuário não autenticado.');
    }

    return addCategory.mutateAsync({
      name,
      group_type: groupType,
      user_id: session.user.id,
    });
  };

  const handleCategorySelect = async (name: string, groupType: GroupType) => {
    try {
      setFormError('');
      const category = await resolveCategory(name, groupType);
      setSelectedCategoryId(category.id);
      setCategoryPickerOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível carregar a categoria.');
    }
  };

  const handleSubmit = async () => {
    const numericAmount = Number(amount.replace(',', '.'));

    if (!session?.user?.id) {
      setFormError('Sua sessão expirou. Entre novamente.');
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setFormError('Informe um valor válido.');
      return;
    }

    if (type === 'expense' && !selectedCategoryId) {
      setFormError('Selecione uma categoria para a saída.');
      return;
    }

    try {
      setFormError('');
      await addTransaction.mutateAsync({
        user_id: session.user.id,
        type,
        amount: numericAmount,
        category_id: type === 'expense' ? selectedCategoryId : null,
        description: description.trim() || null,
        date: new Date().toISOString().slice(0, 10),
      });
      onOpenChange(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar a movimentação.');
    }
  };

  const renderCategoryPanel = () => (
    <div className="mt-3 rounded-[24px] border border-[#e8e3d8] bg-white shadow-[0_14px_35px_rgba(15,23,42,0.08)]">
      <div className="max-h-72 overflow-y-auto px-2 py-2">
        {CATEGORY_TAXONOMY.map((taxonomyGroup) => {
          const groupType = taxonomyGroup.groupType;
          const isGroupExpanded = expandedGroup === groupType;
          const customCategories = getCustomCategoriesByGroup(categories, groupType);

          return (
            <div key={groupType} className="rounded-[18px]">
              {/* Group header */}
              <button
                type="button"
                onClick={() => {
                  setExpandedGroup(groupType);
                  setExpandedSubcategoryId(null);
                }}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold tracking-[0.08em] text-slate-500">
                  {GROUP_TITLES[groupType]}
                </span>
                {isGroupExpanded ? (
                  <Minus className="h-4 w-4 text-slate-500" />
                ) : (
                  <Plus className="h-4 w-4 text-slate-500" />
                )}
              </button>

              {isGroupExpanded && (
                <div className="space-y-0.5 pb-2">
                  {/* Taxonomy subcategories */}
                  {taxonomyGroup.subcategorias.map((subcategory) => {
                    const isSubExpanded = expandedSubcategoryId === subcategory.id;
                    const hasItems = subcategory.itens.length > 0;

                    return (
                      <div key={subcategory.id} className="px-1">
                        {/* Subcategory header */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!hasItems) {
                              // Subcategory with no items is directly selectable
                              void handleCategorySelect(subcategory.nome, groupType);
                            } else {
                              setExpandedSubcategoryId(
                                isSubExpanded ? null : subcategory.id,
                              );
                            }
                          }}
                          className={cn(
                            'flex w-full items-center justify-between rounded-[14px] px-4 py-2.5 text-left text-[14px] font-medium text-slate-600 transition',
                            !hasItems &&
                              selectedCategory?.group_type === groupType &&
                              normalize(selectedCategory.name) === normalize(subcategory.nome)
                              ? 'bg-[#e5e5e5] text-slate-900'
                              : 'hover:bg-[#f6f4ef]',
                          )}
                        >
                          <span>{subcategory.nome}</span>
                          {hasItems ? (
                            isSubExpanded ? (
                              <ChevronDown className="h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            )
                          ) : null}
                        </button>

                        {/* Items inside subcategory */}
                        {isSubExpanded && hasItems && (
                          <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-[#f0ece2] pl-2">
                            {subcategory.itens.map((item) => {
                              const isSelected =
                                selectedCategory?.group_type === groupType &&
                                normalize(selectedCategory.name) === normalize(item);

                              return (
                                <button
                                  key={`${subcategory.id}-${item}`}
                                  type="button"
                                  onClick={() => void handleCategorySelect(item, groupType)}
                                  className={cn(
                                    'flex w-full items-center rounded-[12px] px-4 py-2.5 text-left text-[14px] text-slate-700 transition',
                                    isSelected
                                      ? 'bg-[#e5e5e5] font-medium text-slate-900'
                                      : 'hover:bg-[#f6f4ef]',
                                  )}
                                >
                                  {item}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Custom categories (not in taxonomy) */}
                  {customCategories.map((custom) => {
                    const isSelected = selectedCategory?.id === custom.id;
                    return (
                      <div key={custom.id} className="px-1">
                        <button
                          type="button"
                          onClick={() => void handleCategorySelect(custom.name, groupType)}
                          className={cn(
                            'flex w-full items-center rounded-[14px] px-4 py-2.5 text-left text-[14px] text-slate-700 transition',
                            isSelected
                              ? 'bg-[#e5e5e5] font-medium text-slate-900'
                              : 'hover:bg-[#f6f4ef]',
                          )}
                        >
                          {custom.name}
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

      <div className="flex justify-center border-t border-[#f0ece2] py-2">
        <ChevronDown className="h-5 w-5 text-slate-600" />
      </div>
    </div>
  );

  const isSaving = addTransaction.isPending || addCategory.isPending;
  const showExpenseCategory = type === 'expense';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-[610px] gap-0 overflow-hidden rounded-[28px] border border-[#ece7de] bg-white p-0 opacity-100 shadow-[0_28px_90px_rgba(15,23,42,0.35)] [background:#ffffff] [&>button:last-child]:hidden sm:rounded-[28px]">
        <DialogClose className="absolute right-6 top-6 z-10 rounded-full p-1 text-slate-500 transition hover:bg-[#f5f3ee] hover:text-slate-800">
          <X className="h-7 w-7" />
          <span className="sr-only">Fechar</span>
        </DialogClose>

        <div className="bg-white px-9 pb-9 pt-8 [background:#ffffff]">
          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="text-[26px] font-semibold tracking-[-0.02em] text-slate-800">
              Nova Movimentação
            </DialogTitle>
            <DialogDescription className="sr-only">
              Registre uma entrada ou saída do mês atual.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 grid grid-cols-2 rounded-[20px] bg-[#f7f5f1] p-1.5">
            {([
              { value: 'income', label: 'Entrada' },
              { value: 'expense', label: 'Saída' },
            ] as const).map((option) => {
              const active = type === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleTypeChange(option.value)}
                  className={cn(
                    'rounded-[18px] px-4 py-4 text-[18px] font-medium transition',
                    active ? 'bg-white text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.08)]' : 'text-slate-500',
                    lockedType && !active && 'cursor-default opacity-70',
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 space-y-7">
            <div className="space-y-3">
              <label className="text-[16px] text-slate-500">Valor</label>
              <Input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0,00"
                className="h-[88px] rounded-[20px] border-[#e5e1d8] px-6 text-center text-[22px] font-semibold text-slate-500 shadow-none focus-visible:border-[#d9d1c2] focus-visible:ring-0"
              />
            </div>

            {showExpenseCategory && (
              <div className="space-y-3">
                <label className="text-[16px] text-slate-500">Categoria</label>
                <button
                  type="button"
                  onClick={() => setCategoryPickerOpen((current) => !current)}
                  className="flex h-[72px] w-full items-center justify-between rounded-[20px] border border-[#e5e1d8] bg-white px-5 text-left text-[17px] text-slate-800"
                >
                  <span>{selectedCategory?.name ?? 'Selecione a categoria'}</span>
                  {categoryPickerOpen ? (
                    <ChevronUp className="h-5 w-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-500" />
                  )}
                </button>

                {categoryPickerOpen && renderCategoryPanel()}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[16px] text-slate-500">Descrição (opcional)</label>
              <Input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ex: Almoço no restaurante"
                className="h-[72px] rounded-[20px] border-[#e5e1d8] px-5 text-[17px] text-slate-700 shadow-none focus-visible:border-[#d9d1c2] focus-visible:ring-0"
              />
            </div>
          </div>

          {formError && (
            <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {formError}
            </p>
          )}

          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSaving}
            className="mt-8 h-[72px] w-full rounded-[20px] bg-[#262626] text-[18px] font-semibold text-white hover:bg-[#1c1c1c]"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewTransactionModal;
