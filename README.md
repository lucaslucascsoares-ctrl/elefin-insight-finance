# Elefin

Aplicacao de financas pessoais com:

- frontend em React + Vite
- autenticacao com Supabase Auth
- banco PostgreSQL no Supabase
- persistencia de transacoes, saldo mensal, recorrencia e projecoes

## Rodando localmente

Requisitos:

- Node.js
- npm

Instalacao:

```sh
npm install
```

Desenvolvimento:

```sh
npm run dev
```

Build de producao:

```sh
npm run build
```

Testes:

```sh
npm test
```

## Variaveis de ambiente

Crie um arquivo `.env` na raiz com:

```env
VITE_SUPABASE_PROJECT_ID="seu_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="sua_publishable_key"
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
```

## Banco de dados

O projeto usa Supabase.

As migrations SQL ficam em:

- [supabase/migrations](C:/Users/lucas/OneDrive/Documentos/New%20project/supabase/migrations)

Tabelas principais:

- `categories`
- `transactions`
- `month_balances`
- `projection_templates`
- `monthly_projection_overrides`
- `recurring_rules`

## Publicacao

O frontend pode ser publicado em plataformas como:

- Vercel
- Netlify

Ao publicar:

1. configure as variaveis `VITE_SUPABASE_*`
2. confirme que o projeto Supabase correto esta ativo
3. valide login, transacoes e projecoes no ambiente publicado

## Repositorio

GitHub:

- [elefin-insight-finance](https://github.com/lucaslucascsoares-ctrl/elefin-insight-finance)
