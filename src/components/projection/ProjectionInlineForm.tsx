import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  Category,
  GROUP_LABELS,
  GroupType,
  NotificationPreferences,
  ProjectionTemplate,
  ProjectionTemplateInput,
} from '@/types/finance';
import {
  CATEGORY_TAXONOMY,
  getCustomCategoriesByGroup,
  getProjectionAccountsByCategory,
  getProjectionCategoriesByGroup,
} from '@/lib/categoryTaxonomy';

interface ProjectionInlineFormProps {
  categories: Category[];
  template: ProjectionTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelEdit: () => void;
  onSave: (input: ProjectionTemplateInput) => void | Promise<void>;
  notificationPreferences: NotificationPreferences;
  compactLayout: boolean;
}

const defaultGroupType: GroupType = 'essenciais';

const groupOrder: GroupType[] = ['essenciais', 'desejos', 'prioridades'];

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const ProjectionInlineForm = ({
  categories,
  template,
  open,
  onOpenChange,
  onCancelEdit,
  onSave,
  compactLayout = false,
}: ProjectionInlineFormProps) => {
  const [groupType, setGroupType] = useState<GroupType>(defaultGroupType);
  const [categoryName, setCategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [compactCategoryPickerOpen, setCompactCategoryPickerOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<GroupType | null>(null);
  const [expandedSubcategoryId, setExpandedSubcategoryId] = useState<string | null>(null);
  const [accountName, setAccountName] = useState('');
  const [linkedAccount, setLinkedAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [repeatMonthly, setRepeatMonthly] = useState(true);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setGroupType(template?.group_type ?? defaultGroupType);
    setCategoryName(template?.category_name ?? '');
    setSelectedCategoryId(template?.category_id ?? '');
    setCompactCategoryPickerOpen(false);
    setExpandedGroup(template?.group_type ?? defaultGroupType);
    setExpandedSubcategoryId(null);
    setAccountName(template?.account_name ?? '');
    setLinkedAccount(template?.account_name ?? '');
    setAmount(template ? `${template.default_amount}` : '');
    setDescription(template?.description ?? '');
    setDueDay(template?.due_day ? `${template.due_day}` : '');
    setRepeatMonthly(template?.is_active ?? true);
    setFormError('');
    setSaving(false);
  }, [open, template]);

  const availableCategories = useMemo(() => {
    if (compactLayout) {
      return categories;
    }

    return getProjectionCategoriesByGroup(groupType);
  }, [categories, compactLayout, groupType]);

  const availableAccounts = useMemo(
    () => (compactLayout ? [] : categoryName ? getProjectionAccountsByCategory(groupType, categoryName) : []),
    [categoryName, compactLayout, groupType],
  );

  const matchingCategory = useMemo(() => {
    if (!accountName) return null;

    return (
      categories
        .filter(Boolean)
        .find(
          (category) =>
            category?.group_type === groupType && (category?.name ?? '').toLowerCase() === accountName.toLowerCase(),
        ) ?? null
    );
  }, [accountName, categories, groupType]);

  const resetForm = () => {
    setGroupType(defaultGroupType);
    setCategoryName('');
    setSelectedCategoryId('');
    setCompactCategoryPickerOpen(false);
    setExpandedGroup(defaultGroupType);
    setExpandedSubcategoryId(null);
    setLinkedAccount('');
    setAccountName('');
    setAmount('');
    setDescription('');
    setDueDay('');
    setRepeatMonthly(true);
    setFormError('');
    setSaving(false);
  };

  const handleGroupChange = (nextGroup: GroupType) => {
    setGroupType(nextGroup);
    setCategoryName('');
    setSelectedCategoryId('');
    setLinkedAccount('');
    setAccountName('');
    setFormError('');
  };

  const handleCategoryChange = (nextCategory: string) => {
    setCategoryName(nextCategory);
    setSelectedCategoryId('');
    setCompactCategoryPickerOpen(false);
    setLinkedAccount('');
    setAccountName('');
    setFormError('');
  };

  const handleCompactCategoryChange = (nextCategoryId: string) => {
    const selectedCategory = categories.filter(Boolean).find((category) => category.id === nextCategoryId) ?? null;

    setSelectedCategoryId(nextCategoryId);
    setCategoryName(selectedCategory?.name ?? '');
    setGroupType(selectedCategory?.group_type ?? defaultGroupType);
    setLinkedAccount(selectedCategory?.name ?? '');
    setAccountName(selectedCategory?.name ?? '');
    setCompactCategoryPickerOpen(false);
    setFormError('');
  };

  const handleCompactCategoryNameChange = (nextCategoryName: string, nextGroupType: GroupType) => {
    const selectedCategory =
      categories
        .filter(Boolean)
        .find(
          (category) =>
            category?.group_type === nextGroupType && normalize(category?.name ?? '') === normalize(nextCategoryName),
        ) ?? null;

    setSelectedCategoryId(selectedCategory?.id ?? '');
    setCategoryName(nextCategoryName);
    setGroupType(nextGroupType);
    setLinkedAccount(nextCategoryName);
    setAccountName(nextCategoryName);
    setCompactCategoryPickerOpen(false);
    setExpandedSubcategoryId(null);
    setFormError('');
  };

  const handleLinkedAccountChange = (nextAccount: string) => {
    setLinkedAccount(nextAccount);
    setAccountName(nextAccount);
    setFormError('');
  };

  const handleSave = async () => {
    const numericAmount = Number(amount.replace(',', '.'));
    const parsedDueDay = dueDay.trim() ? Number(dueDay) : null;

    if (!categoryName) {
      setFormError('Selecione uma categoria.');
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError('Informe um valor padrão válido.');
      return;
    }

    if (!compactLayout) {
      if (!linkedAccount) {
        setFormError('Selecione a conta vinculada à categoria.');
        return;
      }

      if (accountName.trim() !== linkedAccount) {
      setFormError('A conta precisa corresponder à opção vinculada à categoria.');
        return;
      }

      if (!availableAccounts.includes(linkedAccount)) {
        setFormError('A conta selecionada não pertence à categoria escolhida.');
        return;
      }

      if (parsedDueDay !== null && (!Number.isFinite(parsedDueDay) || parsedDueDay < 1 || parsedDueDay > 31)) {
        setFormError('Informe um dia de vencimento entre 1 e 31.');
        return;
      }
    }

    try {
      setSaving(true);

      await onSave({
        title: compactLayout ? categoryName : linkedAccount,
        account_name: compactLayout ? categoryName : linkedAccount,
        category_name: categoryName,
        description: description.trim() || null,
        default_amount: numericAmount,
        category_id: compactLayout ? selectedCategoryId || null : matchingCategory?.id ?? null,
        group_type: groupType,
        due_day: compactLayout ? null : parsedDueDay,
        reminder_enabled: compactLayout ? null : parsedDueDay === null ? null : true,
        reminder_days_before: [],
        reminder_on_due_date: compactLayout ? null : parsedDueDay !== null,
        is_active: repeatMonthly,
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Projection save failed:', error);
      const message = error instanceof Error && error.message ? error.message : 'Não foi possível salvar a projeção. Tente novamente.';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const renderCompactCategoryPicker = () => (
    <div className="mt-3 rounded-[20px] border border-[#e8e3d8] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-[#233027] dark:bg-[#111A14] dark:shadow-[0_12px_24px_rgba(0,0,0,0.50)]">
      <div className="max-h-48 overflow-y-auto px-2 py-2">
        {CATEGORY_TAXONOMY.map((taxonomyGroup) => {
          const currentGroup = taxonomyGroup.groupType;
          const isGroupExpanded = expandedGroup === currentGroup;
          const customCategories = getCustomCategoriesByGroup(categories, currentGroup);

          return (
            <div key={currentGroup} className="rounded-[16px]">
              <button
                type="button"
                onClick={() => {
                  setExpandedGroup((current) => (current === currentGroup ? null : currentGroup));
                  setExpandedSubcategoryId(null);
                }}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold tracking-[0.08em] text-slate-500 dark:text-[#94A39B]">
                  {GROUP_LABELS[currentGroup]}
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
                      groupType === currentGroup &&
                      normalize(categoryName) === normalize(subcategory.nome);

                    return (
                      <div key={subcategory.id} className="px-1">
                        <button
                          type="button"
                          translate="no"
                          onClick={() => {
                            if (!hasItems) {
                              handleCompactCategoryNameChange(subcategory.nome, currentGroup);
                              return;
                            }

                            setExpandedSubcategoryId((current) => (current === subcategory.id ? null : subcategory.id));
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
                                groupType === currentGroup && normalize(categoryName) === normalize(item);

                              return (
                                <button
                                  key={`${subcategory.id}-${item}`}
                                  type="button"
                                  translate="no"
                                  onClick={() => handleCompactCategoryNameChange(item, currentGroup)}
                                  className={cn(
                                    'flex w-full items-center rounded-[12px] px-4 py-2.5 text-left text-[14px] text-[#8A9A68] transition dark:text-[#CDE4DB]',
                                    isSelected
                                      ? 'bg-[#EEF3E6] font-medium text-[#7A8A58] dark:bg-[#21453C] dark:text-[#E6F2EE]'
                                      : 'hover:bg-[#F4F8EC] dark:hover:bg-[#152018]',
                                  )}
                                >
                                  <span className="break-words">{item}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {customCategories.map((customCategory) => {
                    const isSelected = selectedCategoryId === customCategory.id;

                    return (
                      <div key={customCategory.id} className="px-1">
                        <button
                          type="button"
                          translate="no"
                          onClick={() => handleCompactCategoryChange(customCategory.id)}
                          className={cn(
                            'flex w-full items-center rounded-[14px] px-4 py-2.5 text-left text-[14px] text-[#8A9A68] transition dark:text-[#D7E8E1]',
                            isSelected
                              ? 'bg-[#EEF3E6] font-medium text-[#7A8A58] dark:bg-[#21453C] dark:text-[#F3FBF7]'
                              : 'hover:bg-[#F4F8EC] dark:hover:bg-[#152018]',
                          )}
                        >
                          <span className="break-words">{customCategory.name}</span>
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

  return (
    <Collapsible
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetForm();
          onCancelEdit();
        }

        onOpenChange(nextOpen);
      }}
      className={cn(
        'rounded-[28px] border border-[#D6E1CC] bg-[linear-gradient(180deg,#FCFDF9,#F7FAF1)] shadow-[0_18px_36px_rgba(92,134,109,0.10)] dark:border-[#26342C] dark:bg-[linear-gradient(180deg,#121B16,#121B16)] dark:shadow-[0_22px_42px_rgba(0,0,0,0.52)]',
        compactLayout && 'border-0 bg-transparent shadow-none dark:border-0 dark:bg-transparent dark:shadow-none',
      )}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="projection-inline-form"
          data-testid="projection-form-toggle"
          className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left sm:px-8 sm:pt-7"
        >
          <div className="min-w-0 flex-1">
            <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#314238] dark:text-[#E6F2EE] sm:text-[24px]">{template ? 'Editar projeção' : 'Projeção de Gastos'}</h2>
            <p className="mt-2 break-words text-sm text-[#64766B] dark:text-[#94A39B]">
              {compactLayout
                  ? 'Cadastre suas contas fixas para que elas apareçam automaticamente nas próximas previsões.'
                : template
                  ? 'Atualize a conta fixa usando grupo, categoria, conta e lembrete.'
                  : 'Cadastre suas contas fixas para que elas apareçam automaticamente em todos os meses.'}
            </p>
          </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D6E1CC] bg-white shadow-[0_10px_18px_rgba(92,134,109,0.08)] dark:border-[#233027] dark:bg-[#0F1612] dark:shadow-[0_10px_24px_rgba(0,0,0,0.45)]">
            {open ? <ChevronUp className="h-5 w-5 text-[#64766B] dark:text-[#E8EEE9]" /> : <ChevronDown className="h-5 w-5 text-[#64766B] dark:text-[#E8EEE9]" />}
          </span>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent
        id="projection-inline-form"
        className={cn(
          'overflow-hidden border-t border-[#D6E1CC] data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down dark:border-[#26342C]',
          compactLayout && 'border-t-0 dark:border-t-0',
        )}
      >
        <div className="space-y-5 px-5 py-4 sm:px-8">
          {compactLayout ? (
            <>
              <div className="space-y-2.5">
                <Label htmlFor="projection-amount-inline" className="text-[15px] text-[#64766B] dark:text-[#B8CBC3]">
                  Valor
                </Label>
                <Input
                  id="projection-amount-inline"
                  data-testid="projection-amount-input"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0,00"
                  className="h-[74px] rounded-[18px] border-[#D6E1CC] bg-[#FCFDF9] px-6 text-center text-[20px] font-semibold text-[#314238] placeholder:text-[#9B7A4B] focus-visible:border-[#8A9A68] focus-visible:ring-[#8A9A68]/20 dark:border-[#233027] dark:bg-[#0F1612] dark:text-[#E6F2EE] dark:placeholder:text-[#5F6A63] dark:focus-visible:border-[#ABBC82] dark:focus-visible:ring-[#ABBC82]/20"
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="projection-category-inline" className="text-[15px] text-[#64766B] dark:text-[#B8CBC3]">
                  Categoria
                </Label>
                <button
                  id="projection-category-inline"
                  type="button"
                  data-testid="projection-category-select"
                  onClick={() => setCompactCategoryPickerOpen((current) => !current)}
                  className="flex h-[64px] w-full items-center justify-between gap-3 rounded-[18px] border border-[#D6E1CC] bg-[#FCFDF9] px-5 text-left text-[16px] text-[#314238] outline-none transition focus:border-[#8A9A68] dark:border-[#233027] dark:bg-[#0F1612] dark:text-[#E6F2EE] dark:hover:border-[#ABBC82]"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {selectedCategoryId
                      ? categories.filter(Boolean).find((category) => category.id === selectedCategoryId)?.name ?? 'Selecione a categoria'
                      : 'Selecione a categoria'}
                  </span>
                  {compactCategoryPickerOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-[#64766B] dark:text-[#94A39B]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-[#64766B] dark:text-[#94A39B]" />
                  )}
                </button>
                {compactCategoryPickerOpen ? renderCompactCategoryPicker() : null}
              </div>

              <label className="flex items-start gap-3 rounded-[18px] border border-[#e5e1d8] bg-[#faf8f4] px-4 py-3 dark:border-[#233027] dark:bg-[#152018]">
                <Checkbox
                  checked={repeatMonthly}
                  onCheckedChange={(checked) => setRepeatMonthly(Boolean(checked))}
                  className="mt-0.5"
                />
                <span className="flex-1">
                  <span className="block text-[15px] font-medium text-[#314238] dark:text-[#E6F2EE]">Repetir todo mês</span>
                  <span className="mt-1 block text-sm text-[#64766B] dark:text-[#B8CBC3]">
                    Se ativado, esta conta entra automaticamente nas próximas previsões mensais.
                  </span>
                </span>
              </label>

              <div className="space-y-2.5">
                <Label htmlFor="projection-description-inline" className="text-[15px] text-[#64766B] dark:text-[#B8CBC3]">
                  Descrição (opcional)
                </Label>
                <Textarea
                  id="projection-description-inline"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Opcional"
                  className="min-h-[96px] rounded-[18px] border-[#D6E1CC] bg-[#FCFDF9] px-5 text-[16px] text-[#314238] placeholder:text-[#9B7A4B] focus-visible:border-[#8A9A68] focus-visible:ring-[#8A9A68]/20 dark:border-[#233027] dark:bg-[#0F1612] dark:text-[#E6F2EE] dark:placeholder:text-[#5F6A63] dark:focus-visible:border-[#ABBC82] dark:focus-visible:ring-[#ABBC82]/20"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="projection-group-inline" className="text-[#E8EEE9]">
                    Grupo
                  </Label>
                  <select
                    id="projection-group-inline"
                    value={groupType}
                    onChange={(event) => handleGroupChange(event.target.value as GroupType)}
                    className="h-12 w-full rounded-2xl border border-[#26342C] bg-[#0F1612] px-4 text-sm text-[#E8EEE9] outline-none focus:border-[#ABBC82]"
                  >
                    {groupOrder.map((value) => (
                      <option key={value} value={value}>
                        {GROUP_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projection-category-inline" className="text-[#E8EEE9]">
                    Categoria
                  </Label>
                  <select
                    id="projection-category-inline"
                    data-testid="projection-category-select"
                    value={categoryName}
                    onChange={(event) => handleCategoryChange(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#26342C] bg-[#0F1612] px-4 text-sm text-[#E8EEE9] outline-none focus:border-[#ABBC82]"
                  >
                    <option value="">Selecione a categoria</option>
                    {availableCategories.map((category) => (
                      <option key={category.id} value={category.nome}>
                        {category.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projection-linked-account-inline" className="text-[#E8EEE9]">
                    Conta vinculada à categoria
                </Label>
                <select
                  id="projection-linked-account-inline"
                  data-testid="projection-account-select"
                  value={linkedAccount}
                  disabled={!categoryName}
                  onChange={(event) => handleLinkedAccountChange(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#26342C] bg-[#0F1612] px-4 text-sm text-[#E8EEE9] outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">{categoryName ? 'Selecione a conta' : 'Escolha uma categoria primeiro'}</option>
                  {availableAccounts.map((account) => (
                    <option key={account} value={account}>
                      {account}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projection-account-inline" className="text-[#E8EEE9]">
                  Conta
                </Label>
                <Input
                  id="projection-account-inline"
                  data-testid="projection-account-input"
                  value={accountName}
                  readOnly
                      placeholder="A conta será preenchida pela opção acima"
                  className="h-12 rounded-2xl border-[#26342C] bg-[#0F1612] text-[#E8EEE9] placeholder:text-[#5F6A63]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projection-amount-inline" className="text-[#E8EEE9]">
                    Valor padrão
                </Label>
                <Input
                  id="projection-amount-inline"
                  data-testid="projection-amount-input"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0,00"
                  className="h-12 rounded-2xl border-[#26342C] bg-[#0F1612] text-[#E8EEE9] placeholder:text-[#5F6A63]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projection-description-inline" className="text-[#E8EEE9]">
                  Observação
                </Label>
                <Textarea
                  id="projection-description-inline"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Opcional"
                  className="min-h-[96px] rounded-2xl border-[#26342C] bg-[#0F1612] text-[#E8EEE9] placeholder:text-[#5F6A63]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="projection-due-day-inline" className="notranslate text-[#E8EEE9]" translate="no">
                    Dia de vencimento
                  </Label>
                  <Input
                    id="projection-due-day-inline"
                    data-testid="projection-due-day-input"
                    inputMode="numeric"
                    value={dueDay}
                    onChange={(event) => setDueDay(event.target.value.replace(/\D/g, '').slice(0, 2))}
                    placeholder="Ex: 10"
                    className="h-12 rounded-2xl border-[#26342C] bg-[#0F1612] text-[#E8EEE9] placeholder:text-[#5F6A63]"
                  />
                </div>

                <div className="rounded-2xl border border-[#26342C] bg-[#141F19] px-4 py-3">
                  <p className="text-sm font-semibold text-[#E8EEE9]">Lembrete automático</p>
                  <p className="mt-1 text-xs leading-5 text-[#94A39B]">
                    Assim que o dia de vencimento for informado, a projeção será lembrada automaticamente nesse dia.
                  </p>
                </div>
              </div>
            </>
          )}

          {formError ? (
            <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {formError}
            </p>
          ) : null}

          <div className="flex items-center gap-3 pt-1">
            <Button
              type="button"
              data-testid="projection-form-save"
              onClick={() => void handleSave()}
              disabled={saving}
              className="h-[64px] flex-1 rounded-[18px] bg-[#8A9A68] text-[18px] font-semibold text-white shadow-[0_10px_20px_rgba(92,134,109,0.16)] hover:bg-[#7A8A58] dark:bg-[#ABBC82] dark:text-[#0F1612] dark:font-semibold dark:shadow-[0_4px_12px_rgba(171,188,130,0.25)] dark:hover:bg-[#BDD494]"
            >
              {saving ? 'Salvando...' : template ? 'Salvar alterações' : 'Salvar projeção'}
            </Button>
            <Button
              type="button"
              variant="outline"
              data-testid="projection-form-cancel"
              disabled={saving}
              onClick={() => {
                resetForm();
                onCancelEdit();
                onOpenChange(false);
              }}
              className="h-[64px] rounded-[18px] border-[#D6E1CC] bg-white px-5 text-[#64766B] hover:bg-[#F7F8F6] dark:border-[#233027] dark:bg-transparent dark:text-[#94A39B] dark:hover:border-[#ABBC82] dark:hover:text-[#ABBC82]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ProjectionInlineForm;
