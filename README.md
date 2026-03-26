# Êxodo — Gestão de Sinistros

Kanban de gestão de sinistros para associação de proteção veicular.

## Tecnologias
- React 18 + TypeScript
- Vite
- lucide-react (ícones)

## Estrutura
```
src/
  components/
    KanbanBoard.tsx   — Layout principal + header + busca
    KanbanColumn.tsx  — Coluna do kanban
    KanbanCard.tsx    — Card individual
    CardModal.tsx     — Drawer lateral com detalhes completos
  data/
    mock.ts           — Dados mockados + config de colunas
  types/
    index.ts          — Tipos TypeScript
```

## Colunas do pipeline
1. Evento aberto
2. Vistoria inicial (checklist técnico + fotos + orçamento)
3. Orçamento / cotação
4. Regulagem / aprovação
5. Execução do serviço
6. Negociação de minuta
7. Avaliação final

## Como rodar localmente
```bash
npm install
npm run dev
```

## Como importar no Lovable
1. Suba esse projeto no GitHub
2. No Lovable: New Project → Import from GitHub
3. Selecione o repositório

## Próximo passo
- Integrar com banco de dados (Supabase recomendado para Lovable)
- Schema disponível separadamente
