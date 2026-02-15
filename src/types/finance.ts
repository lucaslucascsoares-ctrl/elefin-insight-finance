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
}

export type GroupType = 'essenciais' | 'desejos' | 'prioridades';

export const GROUP_LABELS: Record<GroupType, string> = {
  essenciais: 'Essenciais',
  desejos: 'Desejos',
  prioridades: 'Prioridades',
};

export const GROUP_LIMITS: Record<GroupType, number> = {
  essenciais: 0.5,
  desejos: 0.3,
  prioridades: 0.2,
};
