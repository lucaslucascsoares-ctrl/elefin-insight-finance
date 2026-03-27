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
  user_id?: string | null;
}

export type GroupType = 'essenciais' | 'desejos' | 'prioridades';

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
