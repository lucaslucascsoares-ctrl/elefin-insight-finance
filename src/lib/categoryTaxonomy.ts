import { Category, GroupType } from '@/types/finance';

export interface TaxonomySubcategory {
  id: string;
  nome: string;
  itens: string[];
}

export interface TaxonomyCategoryGroup {
  id: string;
  nome: string;
  groupType: GroupType;
  subcategorias: TaxonomySubcategory[];
}

export const CATEGORY_TAXONOMY: TaxonomyCategoryGroup[] = [
  {
    nome: 'Necessidades Essenciais',
    id: 'essencial',
    groupType: 'essenciais',
    subcategorias: [
      {
        nome: 'Habitação',
        id: 'habitacao',
        itens: [
          'Aluguel',
          'Prestação da Casa/Hipoteca',
          'Condomínio',
          'IPTU/Impostos Prediais',
          'Seguro Residencial',
          'Energia Elétrica',
          'Água e Esgoto',
          'Gás',
          'Internet/Telefone',
          'Obra/Reforma',
          'Outros Custos de Habitação',
        ],
      },
      {
        nome: 'Alimentação Essencial',
        id: 'alimentacao_essencial',
        itens: [
          'Supermercado',
          'Atacados',
          'Mercado',
          'Mercearia',
          'Padaria',
          'Hortifruti',
          'Açougue',
          'Feira',
          'Outros Custos de Alimentação Essencial',
        ],
      },
      {
        nome: 'Educação',
        id: 'educacao',
        itens: [
          'Creche',
          'Escola',
          'Universidade',
          'Matrículas',
          'Material Didático',
          'Transporte Escolar',
          'Uniforme Escolar',
          'Alimentação Escolar',
          'Outros Custos de Educação Essencial',
        ],
      },
      {
        nome: 'Saúde',
        id: 'saude',
        itens: [
          'Planos de Saúde',
          'Consultas Médicas',
          'Exames Médicos',
          'Tratamentos Médicos',
          'Atendimento Médico',
          'Medicamentos',
          'Itens de Uso Necessário',
          'Vacinas',
          'Outros Custos de Saúde Essencial',
        ],
      },
      {
        nome: 'Transporte',
        id: 'transporte',
        itens: [
          'Transporte Público',
          'Combustível',
          'Financiamento Veicular',
          'Manutenção Veicular',
          'Doc e Impostos Veiculares',
          'Seguro Veicular',
          'Estacionamentos',
          'Pedágios',
          'Outros Custos de Transporte Essencial',
        ],
      },
      {
        nome: 'Outras Necessidades Básicas',
        id: 'outros_essenciais',
        itens: [],
      },
    ],
  },
  {
    nome: 'Estilo de Vida',
    id: 'lifestyle',
    groupType: 'desejos',
    subcategorias: [
      {
        nome: 'Lazer',
        id: 'lazer',
        itens: [
          'Cinema',
          'Teatro',
          'Shows',
          'Exposições',
          'Atrações Turísticas',
          'Praia',
          'Passeios',
          'Viagens',
          'Hospedagens',
          'Outros Custos de Lazer',
        ],
      },
      {
        nome: 'Alimentação Não Essencial',
        id: 'alimentacao_nao_essencial',
        itens: [
          'Restaurantes/Bares',
          'Delivery',
          'Cafeterias',
          'Lanchonetes',
          'Bebidas',
          'Outros Custos de Alimentação Não Essencial',
        ],
      },
      {
        nome: 'Assinaturas',
        id: 'assinaturas',
        itens: [
          'Streaming TV/Vídeo',
          'Streaming Música/Áudio',
          'Streaming Leitura',
          'Ferramentas Digitais',
          'Clubes',
          'Outras Assinaturas',
        ],
      },
      {
        nome: 'Hobbies',
        id: 'hobbies',
        itens: ['Esportes', 'Artesanato', 'Jogos', 'Outros Hobbies'],
      },
      {
        nome: 'Compras Não Essenciais',
        id: 'compras_nao_essenciais',
        itens: ['Supérfluos', 'Guloseimas', 'Outras Compras Não Essenciais'],
      },
      {
        nome: 'Outros Desejos Pessoais',
        id: 'outros_lifestyle',
        itens: [],
      },
    ],
  },
  {
    nome: 'Prioridades Financeiras',
    id: 'financeiro',
    groupType: 'prioridades',
    subcategorias: [
      {
        nome: 'Construção de Reservas',
        id: 'reservas',
        itens: ['Poupança', 'Previdência', 'Consórcios', 'Fundos'],
      },
      {
        nome: 'Quitação de Dívidas',
        id: 'dividas',
        itens: ['Empréstimos', 'Cartões de Crédito', 'Dívidas de Financiamentos'],
      },
      {
        nome: 'Investimentos',
        id: 'investimentos',
        itens: [],
      },
      {
        nome: 'Outras Prioridades Financeiras',
        id: 'outros_financeiro',
        itens: ['Dízimo', 'Caridade', 'Outras Prioridades Financeiras'],
      },
    ],
  },
];

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export function findExistingCategory(categories: Category[], itemName: string, groupType: GroupType) {
  const normalizedItem = normalize(itemName);

  return (
    categories.find(
      (category) => category?.group_type === groupType && normalize(category?.name ?? '') === normalizedItem,
    ) ?? null
  );
}

export function getCustomCategoriesByGroup(categories: Category[], groupType: GroupType) {
  const taxonomyNames = new Set(
    CATEGORY_TAXONOMY
      .filter((group) => group.groupType === groupType)
      .flatMap((group) => group.subcategorias.flatMap((subcategory) => [subcategory.nome, ...subcategory.itens]))
      .map(normalize),
  );

  return categories
    .filter(Boolean)
    .filter((category) => category?.group_type === groupType && !taxonomyNames.has(normalize(category?.name ?? '')));
}

export function getProjectionCategoriesByGroup(groupType: GroupType) {
  return (
    CATEGORY_TAXONOMY.find((group) => group.groupType === groupType)?.subcategorias.map((subcategory) => ({
      id: subcategory.id,
      nome: subcategory.nome,
    })) ?? []
  );
}

export function getProjectionAccountsByCategory(groupType: GroupType, categoryName: string) {
  const group = CATEGORY_TAXONOMY.find((item) => item.groupType === groupType);
  const category = group?.subcategorias.find((subcategory) => normalize(subcategory.nome) === normalize(categoryName));

  if (!category) return [];
  if (category.itens.length === 0) {
    return [category.nome];
  }

  return category.itens.map((item) => item.trim()).filter(Boolean);
}
