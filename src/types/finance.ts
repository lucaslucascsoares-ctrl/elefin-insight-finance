export interface Transaction {
  id: string;
  created_at: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category_id: string | null;
  description: string | null;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  group_type: 'essenciais' | 'desejos' | 'prioridades';
  user_id: string | null;
}

export type GroupType = 'essenciais' | 'desejos' | 'prioridades';
export type ForecastGroupType = GroupType | 'outros';
export type ForecastSource = 'recurring' | 'history' | 'manual';
export type ForecastStatus = 'predicted' | 'confirmed' | 'dismissed';
export type MonthlyProjectionStatus = 'predicted' | 'paid' | 'ignored' | 'edited';

export const GROUP_LABELS: Record<GroupType, string> = {
  essenciais: 'Necessidades Essenciais',
  desejos: 'Estilo de Vida',
  prioridades: 'Prioridades Financeiras',
};

export const GROUP_LIMITS: Record<GroupType, number> = {
  essenciais: 0.5,
  desejos: 0.3,
  prioridades: 0.2,
};

export interface MonthBalance {
  id: string;
  user_id: string;
  mes: number;
  ano: number;
  caixa_inicial: number;
  created_at: string;
}

export interface DadosMesAnteriorCategoria {
  nome: string;
  valorReal: number;
  previsaoMesAtual: number;
}

export interface DadosMesAnterior {
  mes: string;
  ano: number;
  categorias: DadosMesAnteriorCategoria[];
  totalGasto: number;
}

export interface RecurringRule {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category_id: string | null;
  description: string | null;
  starts_at: string;
  active: boolean;
  created_at: string;
}

export interface RecurringRuleInput {
  type: 'income' | 'expense';
  amount: number;
  category_id: string | null;
  description: string | null;
  starts_at: string;
}

export interface ForecastItem {
  id: string;
  user_id: string;
  month: number;
  year: number;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  category_id: string | null;
  group_type: ForecastGroupType;
  source: ForecastSource;
  status: ForecastStatus;
  reference_month: number;
  reference_year: number;
  recurring_rule_id: string | null;
  reference_transaction_id: string | null;
}

export interface ForecastCategorySummary {
  nome: string;
  valorReal: number;
  previsaoMesAtual: number;
  itens: ForecastItem[];
}

export interface MonthlyForecastData {
  mesReferencia: string;
  anoReferencia: number;
  categorias: ForecastCategorySummary[];
  totalGastoAnterior: number;
  totalPrevisto: number;
  totalEntradaPrevisto: number;
  totalSaidaPrevisto: number;
  incomeItems: ForecastItem[];
  expenseItems: ForecastItem[];
  groups: Record<GroupType, number>;
}

export interface ProjectionReminderConfig {
  due_day: number | null;
  reminder_enabled: boolean | null;
  reminder_days_before: number[];
  reminder_on_due_date: boolean | null;
}

export interface ProjectionTemplate {
  id: string;
  user_id: string;
  legacy_local_id: string | null;
  title: string;
  account_name: string;
  category_name: string;
  description: string | null;
  default_amount: number;
  category_id: string | null;
  group_type: GroupType;
  source: 'projecao';
  is_active: boolean;
  due_day: number | null;
  reminder_enabled: boolean | null;
  reminder_days_before: number[];
  reminder_on_due_date: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectionTemplateInput {
  title: string;
  account_name: string;
  category_name: string;
  description: string | null;
  default_amount: number;
  category_id: string | null;
  group_type: GroupType;
  due_day: number | null;
  reminder_enabled: boolean | null;
  reminder_days_before: number[];
  reminder_on_due_date: boolean | null;
  is_active: boolean;
}

export interface MonthlyProjectionOverride {
  id: string;
  user_id: string;
  template_id: string;
  month: number;
  year: number;
  amount_override: number | null;
  title_override: string | null;
  status: MonthlyProjectionStatus;
  paid_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyProjectionItem {
  id: string;
  template_id: string;
  user_id: string;
  month: number;
  year: number;
  title: string;
  account_name: string;
  category_name: string;
  amount: number;
  category_id: string | null;
  group_type: GroupType;
  status: MonthlyProjectionStatus;
  paid_transaction_id: string | null;
  is_overridden: boolean;
  due_day: number | null;
  reminder_enabled: boolean | null;
  reminder_days_before: number[];
  reminder_on_due_date: boolean | null;
}

export interface NotificationPreferences {
  paymentRemindersEnabled: boolean;
  defaultDaysBefore: number[];
  defaultOnDueDate: boolean;
  channels: {
    push: boolean;
    email: boolean;
  };
}
