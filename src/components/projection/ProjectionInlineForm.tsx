import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Category, GROUP_LABELS, GroupType, ProjectionTemplate, ProjectionTemplateInput } from '@/types/finance';
import { getProjectionAccountsByCategory, getProjectionCategoriesByGroup } from '@/lib/categoryTaxonomy';

interface ProjectionInlineFormProps {
  categories: Category[];
  template?: ProjectionTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelEdit: () => void;
  onSave: (input: ProjectionTemplateInput) => void;
}

const defaultGroupType: GroupType = 'essenciais';

const ProjectionInlineForm = ({
  categories,
  template,
  open,
  onOpenChange,
  onCancelEdit,
  onSave,
}: ProjectionInlineFormProps) => {
  const [groupType, setGroupType] = useState<GroupType>(defaultGroupType);
  const [categoryName, setCategoryName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [linkedAccount, setLinkedAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!open) return;

    setGroupType(template?.group_type ?? defaultGroupType);
    setCategoryName(template?.category_name ?? '');
    setAccountName(template?.account_name ?? '');
    setLinkedAccount(template?.account_name ?? '');
    setAmount(template ? `${template.default_amount}` : '');
    setDescription(template?.description ?? '');
    setFormError('');
  }, [open, template]);

  const availableCategories = useMemo(
    () => getProjectionCategoriesByGroup(groupType),
    [groupType],
  );

  const availableAccounts = useMemo(
    () => (categoryName ? getProjectionAccountsByCategory(groupType, categoryName) : []),
    [categoryName, groupType],
  );

  const matchingCategory = useMemo(() => {
    if (!categoryName) return null;
    return categories.find(
      (category) => category.group_type === groupType && category.name.toLowerCase() === accountName.toLowerCase(),
    );
  }, [accountName, categories, groupType, categoryName]);

  const handleGroupChange = (nextGroup: GroupType) => {
    setGroupType(nextGroup);
    setCategoryName('');
    setLinkedAccount('');
    setAccountName('');
    setFormError('');
  };

  const handleCategoryChange = (nextCategory: string) => {
    setCategoryName(nextCategory);
    setLinkedAccount('');
    setAccountName('');
    setFormError('');
  };

  const handleLinkedAccountChange = (nextAccount: string) => {
    setLinkedAccount(nextAccount);
    setAccountName(nextAccount);
    setFormError('');
  };

  const resetForm = () => {
    setGroupType(defaultGroupType);
    setCategoryName('');
    setLinkedAccount('');
    setAccountName('');
    setAmount('');
    setDescription('');
    setFormError('');
  };

  const handleSave = () => {
    const numericAmount = Number(amount.replace(',', '.'));

    if (!categoryName) {
      setFormError('Selecione uma categoria.');
      return;
    }

    if (!linkedAccount) {
      setFormError('Selecione a conta vinculada a categoria.');
      return;
    }

    if (accountName.trim() !== linkedAccount) {
      setFormError('A conta precisa corresponder a opcao vinculada a categoria.');
      return;
    }

    if (!availableAccounts.includes(linkedAccount)) {
      setFormError('A conta selecionada nao pertence a categoria escolhida.');
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError('Informe um valor padrao valido.');
      return;
    }

    onSave({
      title: linkedAccount,
      account_name: linkedAccount,
      category_name: categoryName,
      description: description.trim() || null,
      default_amount: numericAmount,
      category_id: matchingCategory?.id ?? null,
      group_type: groupType,
    });

    resetForm();
    onOpenChange(false);
  };

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
      className="rounded-[28px] border border-border/70 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="projection-inline-form"
          className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
        >
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {template ? 'Editar projeção' : 'Projeção de Gastos'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {template
                ? 'Atualize a conta fixa usando grupo, categoria e conta vinculada.'
                : 'Cadastre suas contas fixas para que elas aparecam automaticamente em todos os meses.'}
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background">
            {open ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </span>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent
        id="projection-inline-form"
        className="overflow-hidden border-t border-border/70 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      >
        <div className="space-y-4 px-4 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="projection-group-inline">Grupo</Label>
              <select
                id="projection-group-inline"
                value={groupType}
                onChange={(event) => handleGroupChange(event.target.value as GroupType)}
                className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                {Object.entries(GROUP_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projection-category-inline">Categoria</Label>
              <select
                id="projection-category-inline"
                value={categoryName}
                onChange={(event) => handleCategoryChange(event.target.value)}
                className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
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
            <Label htmlFor="projection-linked-account-inline">Conta vinculada a categoria</Label>
            <select
              id="projection-linked-account-inline"
              value={linkedAccount}
              disabled={!categoryName}
              onChange={(event) => handleLinkedAccountChange(event.target.value)}
              className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
            <Label htmlFor="projection-account-inline">Conta</Label>
            <Input
              id="projection-account-inline"
              value={accountName}
              readOnly
              placeholder="A conta sera preenchida pela opcao acima"
              className="h-12 rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projection-amount-inline">Valor padrao</Label>
            <Input
              id="projection-amount-inline"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0,00"
              className="h-12 rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projection-description-inline">Observacao</Label>
            <Textarea
              id="projection-description-inline"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Opcional"
              className="min-h-[96px] rounded-2xl"
            />
          </div>

          {formError ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</p>
          ) : null}

          <div className="flex items-center gap-3">
            <Button type="button" onClick={handleSave} className="h-12 flex-1 rounded-2xl text-base font-semibold">
              {template ? 'Salvar alteracoes' : 'Salvar projeção'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onCancelEdit();
                onOpenChange(false);
              }}
              className="h-12 rounded-2xl px-4"
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
