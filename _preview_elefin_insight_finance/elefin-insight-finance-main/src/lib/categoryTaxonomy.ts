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
        nome: 'Habitacao',
        id: 'habitacao',
        itens: [
          'Aluguel',
          'Prestacao da Casa/Hipoteca',
          'Condominio',
          'IPTU/Impostos Prediais',
          'Seguro Residencial',
          'Energia Eletrica',
          'Agua e Esgoto',
          'Gas',
          'Internet/Telefone',
          'Obra/Reforma',
          'Outros Custos de Habitacao',
        ],
      },
      {
        nome: 'Alimentacao Essencial',
        id: 'alimentacao_essencial',
        itens: [
          'Supermercado',
          'Atacados',
          'Mercado',
          'Mercearia',
          'Padaria',
          'Hortfrut',
          'Acougue',
          'Feira',
          'Outros Custos de Alimentacao Essencial',
        ],
      },
      {
        nome: 'Educacao',
        id: 'educacao',
        itens: [
          'Creche',
          'Escola',
          'Universidade',
          'Matriculas',
          'Material Didatico',
          'Transporte Escolar',
          'Uniforme Escolar',
          'Alimentacao Escolar',
          'Outros Custos de Educacao Essencial',
        ],
      },
      {
        nome: 'Saude',
        id: 'saude',
        itens: [
          'Planos de Saude',
          'Consultas Medicas',
          'Exames Medicos',
          'Tratamentos Medicos',
          'Atendimento Medico',
          'Medicamentos',
          'Itens de Uso Necessario',
          'Vacinas',
          'Outros Custos de Saude Essencial',
        ],
      },
      {
        nome: 'Transporte',
        id: 'transporte',
        itens: [
          'Transporte Publico',
          'Combustivel',
          'Financiamento Veicular',
          'Manutencao Veicular',
          'Doc e Impostos Veiculares',
          'Seguro Veicular',
          'Estacionamentos',
          'Pedagios',
          'Outros Custos de Transporte Essencial',
        ],
      },
      {
        nome: 'Outras Necessidades Basicas',
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
          'Exposicoes',
          'Atracoes Turisticas',
          'Praia',
          'Passeios',
          'Viagens',
          'Hospedagens',
          'Outros Custos de Lazer',
        ],
      },
      {
        nome: 'Alimentacao Nao Essencial',
        id: 'alimentacao_nao_essencial',
        itens: [
          'Restaurantes/Bares',
          'Delivery',
          'Cafeterias',
          'Lanchonetes',
          'Bebidas',
          'Outros Custos de Alimentacao Nao Essencial',
        ],
      },
      {
        nome: 'Assinaturas',
        id: 'assinaturas',
        itens: [
          'Streaming TV/Video',
          'Streaming Musica/Audio',
          'Streaming Leitura',
          'Ferramentas Digitais',
          'Clubes',
          'Outras Assinaturas',
        ],
      },
      {
        nome: 'Hobbies',
        id: 'hobbies',
        itens: ['Esportes', 'Artesanatos', 'Jogos', 'Outros Hobbies'],
      },
      {
        nome: 'Compras Nao Essenciais',
        id: 'compras_nao_essenciais',
        itens: ['Superfluos', 'Guloseimas', 'Outras Compras Nao Essenciais'],
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
        nome: 'Construcao de Reservas',
        id: 'reservas',
        itens: ['Poupancas', 'Previdencias', 'Consorcios', 'Fundos'],
      },
      {
        nome: 'Quitacao de Dividas',
        id: 'dividas',
        itens: ['Emprestimos', 'Cartoes de Credito', 'Dividas de Financiamentos'],
      },
      {
        nome: 'Investimentos',
        id: 'investimentos',
        itens: [],
      },
      {
        nome: 'Outras Prioridades Financeiras',
        id: 'outros_financeiro',
        itens: ['Dizimo', 'Caridade', 'Outras Prioridades Financeiras'],
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
      (category) => category.group_type === groupType && normalize(category.name) === normalizedItem,
    ) || null
  );
}

export function getCustomCategoriesByGroup(categories: Category[], groupType: GroupType) {
  const taxonomyNames = new Set(
    CATEGORY_TAXONOMY
      .filter((group) => group.groupType === groupType)
      .flatMap((group) => group.subcategorias.flatMap((subcategory) => [subcategory.nome, ...subcategory.itens]))
      .map(normalize),
  );

  return categories.filter(
    (category) => category.group_type === groupType && !taxonomyNames.has(normalize(category.name)),
  );
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
