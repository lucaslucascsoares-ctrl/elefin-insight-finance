import { Page, Route } from '@playwright/test';

const SUPABASE_URL = 'https://mwusvooptbavstvqbpyo.supabase.co';
const FIXED_NOW_ISO = '2026-03-28T12:00:00-03:00';
const TEST_USER_ID = '11111111-1111-4111-8111-111111111111';
const TEST_USER_EMAIL = 'lucas.lucascsoares@gmail.com';
const TEST_USER_PASSWORD = '9772120';

type GroupType = 'essenciais' | 'desejos' | 'prioridades';
type TransactionType = 'income' | 'expense';
type MonthlyProjectionStatus = 'predicted' | 'paid' | 'ignored' | 'edited';

interface CategoryRow {
  id: string;
  name: string;
  group_type: GroupType;
  user_id: string | null;
}

interface TransactionRow {
  id: string;
  created_at: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category_id: string | null;
  description: string | null;
  date: string;
}

interface ProjectionTemplateRow {
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
  created_at: string;
  updated_at: string;
}

interface MonthlyProjectionOverrideRow {
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

interface MonthBalanceRow {
  id: string;
  user_id: string;
  mes: number;
  ano: number;
  caixa_inicial: number;
  created_at: string;
}

interface RecurringRuleRow {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category_id: string | null;
  description: string | null;
  starts_at: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockSupabaseState {
  categories: CategoryRow[];
  transactions: TransactionRow[];
  projectionTemplates: ProjectionTemplateRow[];
  monthlyProjectionOverrides: MonthlyProjectionOverrideRow[];
  monthBalances: MonthBalanceRow[];
  recurringRules: RecurringRuleRow[];
  notificationPreferences: {
    paymentRemindersEnabled: boolean;
    defaultDaysBefore: number[];
    defaultOnDueDate: boolean;
    channels: {
      push: boolean;
      email: boolean;
    };
  };
}

let idCounter = 0;

const createId = () => `00000000-0000-4000-8000-${String(++idCounter).padStart(12, '0')}`;
const nowIso = () => new Date(FIXED_NOW_ISO).toISOString();

const buildProjectionDescription = ({
  note = null,
  dueDay = null,
  reminderEnabled = null,
  reminderDaysBefore = [],
  reminderOnDueDate = null,
}: {
  note?: string | null;
  dueDay?: number | null;
  reminderEnabled?: boolean | null;
  reminderDaysBefore?: number[];
  reminderOnDueDate?: boolean | null;
}) =>
  JSON.stringify({
    _type: 'elefin_projection_template_v1',
    note,
    reminder: {
      due_day: dueDay,
      reminder_enabled: reminderEnabled,
      reminder_days_before: reminderDaysBefore,
      reminder_on_due_date: reminderOnDueDate,
    },
  });

const defaultCategories = (): CategoryRow[] => [
  { id: createId(), name: 'Aluguel', group_type: 'essenciais', user_id: null },
  { id: createId(), name: 'Condomínio', group_type: 'essenciais', user_id: null },
  { id: createId(), name: 'Energia', group_type: 'essenciais', user_id: null },
  { id: createId(), name: 'Água', group_type: 'essenciais', user_id: null },
  { id: createId(), name: 'Internet', group_type: 'essenciais', user_id: null },
  { id: createId(), name: 'Mercado', group_type: 'essenciais', user_id: null },
  { id: createId(), name: 'Restaurantes', group_type: 'desejos', user_id: null },
  { id: createId(), name: 'Lazer', group_type: 'desejos', user_id: null },
  { id: createId(), name: 'Investimentos', group_type: 'prioridades', user_id: null },
];

export const createProjectionTemplateRow = ({
  title,
  accountName,
  categoryName,
  amount,
  groupType = 'essenciais',
  dueDay = null,
  reminderEnabled = null,
  reminderDaysBefore = [],
  reminderOnDueDate = null,
  categoryId = null,
}: {
  title: string;
  accountName: string;
  categoryName: string;
  amount: number;
  groupType?: GroupType;
  dueDay?: number | null;
  reminderEnabled?: boolean | null;
  reminderDaysBefore?: number[];
  reminderOnDueDate?: boolean | null;
  categoryId?: string | null;
}): ProjectionTemplateRow => ({
  id: createId(),
  user_id: TEST_USER_ID,
  legacy_local_id: null,
  title,
  account_name: accountName,
  category_name: categoryName,
  description: buildProjectionDescription({
    note: null,
    dueDay,
    reminderEnabled,
    reminderDaysBefore,
    reminderOnDueDate,
  }),
  default_amount: amount,
  category_id: categoryId,
  group_type: groupType,
  source: 'projecao',
  is_active: true,
  created_at: nowIso(),
  updated_at: nowIso(),
});

export const createMonthBalanceRow = (mes: number, ano: number, caixaInicial: number): MonthBalanceRow => ({
  id: createId(),
  user_id: TEST_USER_ID,
  mes,
  ano,
  caixa_inicial: caixaInicial,
  created_at: nowIso(),
});

export const createTransactionRow = ({
  type,
  amount,
  date,
  categoryId = null,
  description = null,
}: {
  type: TransactionType;
  amount: number;
  date: string;
  categoryId?: string | null;
  description?: string | null;
}): TransactionRow => ({
  id: createId(),
  created_at: nowIso(),
  user_id: TEST_USER_ID,
  type,
  amount,
  category_id: categoryId,
  description,
  date,
});

export const createMonthlyOverrideRow = ({
  templateId,
  month,
  year,
  amountOverride = null,
  titleOverride = null,
  status = 'predicted',
  paidTransactionId = null,
}: {
  templateId: string;
  month: number;
  year: number;
  amountOverride?: number | null;
  titleOverride?: string | null;
  status?: MonthlyProjectionStatus;
  paidTransactionId?: string | null;
}): MonthlyProjectionOverrideRow => ({
  id: createId(),
  user_id: TEST_USER_ID,
  template_id: templateId,
  month,
  year,
  amount_override: amountOverride,
  title_override: titleOverride,
  status,
  paid_transaction_id: paidTransactionId,
  created_at: nowIso(),
  updated_at: nowIso(),
});

export const createMockSupabaseState = (overrides: Partial<MockSupabaseState> = {}): MockSupabaseState => ({
  categories: overrides.categories ?? defaultCategories(),
  transactions: overrides.transactions ?? [],
  projectionTemplates: overrides.projectionTemplates ?? [],
  monthlyProjectionOverrides: overrides.monthlyProjectionOverrides ?? [],
  monthBalances: overrides.monthBalances ?? [],
  recurringRules: overrides.recurringRules ?? [],
  notificationPreferences:
    overrides.notificationPreferences ?? {
      paymentRemindersEnabled: true,
      defaultDaysBefore: [2],
      defaultOnDueDate: true,
      channels: {
        push: true,
        email: false,
      },
    },
});

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'access-control-allow-headers': '*',
  'access-control-expose-headers': '*',
  'content-type': 'application/json',
};

const parseJsonBody = (body: string | null) => {
  if (!body) return null;
  return JSON.parse(body);
};

const isSingleObjectRequest = (route: Route) => {
  const accept = route.request().headers()['accept'] || '';
  return accept.includes('application/vnd.pgrst.object+json');
};

const normalizeValue = (value: unknown) => (value === null || value === undefined ? null : String(value));

const matchesEqFilter = (row: Record<string, unknown>, key: string, value: string) => {
  if (!value.startsWith('eq.')) return true;
  return normalizeValue(row[key]) === value.slice(3);
};

const matchesOrFilter = (row: Record<string, unknown>, orExpression: string) => {
  return orExpression
    .split(',')
    .map((clause) => clause.replace(/^\(|\)$/g, ''))
    .some((clause) => {
      const [field, operator, rawValue] = clause.split('.');
      if (!field || !operator) return false;
      const rowValue = row[field];

      if (operator === 'is' && rawValue === 'null') {
        return rowValue === null || rowValue === undefined;
      }

      if (operator === 'eq') {
        return normalizeValue(rowValue) === rawValue;
      }

      return false;
    });
};

const applyFilters = <T extends Record<string, unknown>>(rows: T[], url: URL) => {
  let nextRows = [...rows];

  url.searchParams.forEach((value, key) => {
    if (['select', 'order', 'limit', 'offset', 'on_conflict'].includes(key)) return;

    if (key === 'or') {
      nextRows = nextRows.filter((row) => matchesOrFilter(row, value));
      return;
    }

    nextRows = nextRows.filter((row) => matchesEqFilter(row, key, value));
  });

  const orderClauses = url.searchParams.getAll('order');
  orderClauses.forEach((clause) => {
    const [field, direction = 'asc'] = clause.split('.');
    nextRows.sort((a, b) => {
      const first = a[field];
      const second = b[field];
      if (first === second) return 0;
      if (first === null || first === undefined) return 1;
      if (second === null || second === undefined) return -1;
      if (first < second) return direction === 'desc' ? 1 : -1;
      return direction === 'desc' ? -1 : 1;
    });
  });

  return nextRows;
};

const fulfillJson = async (route: Route, payload: unknown, status = 200) => {
  await route.fulfill({
    status,
    headers: corsHeaders,
    body: JSON.stringify(payload),
  });
};

const buildUser = (state: MockSupabaseState) => ({
  id: TEST_USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: TEST_USER_EMAIL,
  email_confirmed_at: nowIso(),
  phone: '',
  confirmed_at: nowIso(),
  last_sign_in_at: nowIso(),
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: {
    notification_preferences: state.notificationPreferences,
  },
});

const buildSessionResponse = (state: MockSupabaseState) => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(new Date('2026-12-31T23:59:59Z').getTime() / 1000),
  token_type: 'bearer',
  user: buildUser(state),
});

const getTableRows = (state: MockSupabaseState, tableName: string) => {
  switch (tableName) {
    case 'categories':
      return state.categories;
    case 'transactions':
      return state.transactions;
    case 'projection_templates':
      return state.projectionTemplates;
    case 'monthly_projection_overrides':
      return state.monthlyProjectionOverrides;
    case 'month_balances':
      return state.monthBalances;
    case 'recurring_rules':
      return state.recurringRules;
    default:
      return null;
  }
};

const setTableRows = (state: MockSupabaseState, tableName: string, rows: unknown[]) => {
  switch (tableName) {
    case 'categories':
      state.categories = rows as CategoryRow[];
      break;
    case 'transactions':
      state.transactions = rows as TransactionRow[];
      break;
    case 'projection_templates':
      state.projectionTemplates = rows as ProjectionTemplateRow[];
      break;
    case 'monthly_projection_overrides':
      state.monthlyProjectionOverrides = rows as MonthlyProjectionOverrideRow[];
      break;
    case 'month_balances':
      state.monthBalances = rows as MonthBalanceRow[];
      break;
    case 'recurring_rules':
      state.recurringRules = rows as RecurringRuleRow[];
      break;
  }
};

const upsertByKeys = <T extends Record<string, unknown>>(rows: T[], payload: T, keys: string[]) => {
  const index = rows.findIndex((row) => keys.every((key) => normalizeValue(row[key]) === normalizeValue(payload[key])));
  if (index >= 0) {
    rows[index] = { ...rows[index], ...payload };
    return rows[index];
  }

  rows.push(payload);
  return payload;
};

const handleRestRequest = async (route: Route, state: MockSupabaseState) => {
  const request = route.request();
  const url = new URL(request.url());
  const tableName = url.pathname.split('/rest/v1/')[1];
  const rows = getTableRows(state, tableName);

  if (!rows) {
    await fulfillJson(route, { error: `Unhandled table ${tableName}` }, 404);
    return;
  }

  if (request.method() === 'GET') {
    const filteredRows = applyFilters(rows, url);
    await fulfillJson(route, isSingleObjectRequest(route) ? filteredRows[0] ?? null : filteredRows);
    return;
  }

  if (request.method() === 'POST') {
    const body = parseJsonBody(request.postData());
    const payloads = Array.isArray(body) ? body : [body];
    const nextRows = [...rows];
    const insertedRows = payloads.map((payload) => {
      if (tableName === 'projection_templates') {
        const row: ProjectionTemplateRow = {
          id: createId(),
          legacy_local_id: null,
          source: 'projecao',
          is_active: true,
          created_at: nowIso(),
          updated_at: nowIso(),
          ...payload,
        };
        nextRows.push(row);
        return row;
      }

      if (tableName === 'transactions') {
        const row: TransactionRow = {
          id: createId(),
          created_at: nowIso(),
          ...payload,
        };
        nextRows.push(row);
        return row;
      }

      if (tableName === 'monthly_projection_overrides') {
        const row = upsertByKeys(
          nextRows as MonthlyProjectionOverrideRow[],
          {
            id: createId(),
            created_at: nowIso(),
            updated_at: nowIso(),
            amount_override: null,
            title_override: null,
            status: 'predicted',
            paid_transaction_id: null,
            ...payload,
          },
          ['user_id', 'template_id', 'month', 'year'],
        );
        row.updated_at = nowIso();
        return row;
      }

      if (tableName === 'month_balances') {
        const row = upsertByKeys(
          nextRows as MonthBalanceRow[],
          {
            id: createId(),
            created_at: nowIso(),
            ...payload,
          },
          ['user_id', 'mes', 'ano'],
        );
        return row;
      }

      if (tableName === 'recurring_rules') {
        const row: RecurringRuleRow = {
          id: createId(),
          created_at: nowIso(),
          updated_at: nowIso(),
          active: true,
          ...payload,
        };
        nextRows.push(row);
        return row;
      }

      nextRows.push(payload);
      return payload;
    });

    setTableRows(state, tableName, nextRows);
    const responsePayload = isSingleObjectRequest(route) ? insertedRows[0] ?? null : insertedRows;
    await fulfillJson(route, responsePayload);
    return;
  }

  if (request.method() === 'PATCH') {
    const body = parseJsonBody(request.postData()) as Record<string, unknown>;
    const nextRows = [...rows];
    const filteredRows = applyFilters(nextRows as Record<string, unknown>[], url);
    const idsToUpdate = new Set(filteredRows.map((row) => normalizeValue((row as { id?: string }).id)));

    const updatedRows = nextRows.map((row) => {
      const rowId = normalizeValue((row as { id?: string }).id);
      if (!idsToUpdate.has(rowId)) return row;
      return {
        ...row,
        ...body,
        updated_at: nowIso(),
      };
    });

    setTableRows(state, tableName, updatedRows);
    const refreshedRows = applyFilters(updatedRows as Record<string, unknown>[], url);
    await fulfillJson(route, isSingleObjectRequest(route) ? refreshedRows[0] ?? null : refreshedRows);
    return;
  }

  if (request.method() === 'DELETE') {
    const nextRows = [...rows];
    const filteredRows = applyFilters(nextRows as Record<string, unknown>[], url);
    const idsToDelete = new Set(filteredRows.map((row) => JSON.stringify(row)));
    const remainingRows = nextRows.filter((row) => !idsToDelete.has(JSON.stringify(row)));
    setTableRows(state, tableName, remainingRows);
    await fulfillJson(route, []);
    return;
  }

  await fulfillJson(route, { error: `Unhandled method ${request.method()}` }, 405);
};

const handleAuthRequest = async (route: Route, state: MockSupabaseState) => {
  const request = route.request();
  const url = new URL(request.url());
  const body = parseJsonBody(request.postData());

  if (request.method() === 'POST' && url.pathname === '/auth/v1/token') {
    if (body?.email && body.email !== TEST_USER_EMAIL) {
      await fulfillJson(route, { error: 'Invalid login credentials' }, 400);
      return;
    }

    if (body?.password && body.password !== TEST_USER_PASSWORD) {
      await fulfillJson(route, { error: 'Invalid login credentials' }, 400);
      return;
    }

    await fulfillJson(route, buildSessionResponse(state));
    return;
  }

  if (request.method() === 'GET' && url.pathname === '/auth/v1/user') {
    await fulfillJson(route, buildUser(state));
    return;
  }

  if (request.method() === 'PUT' && url.pathname === '/auth/v1/user') {
    const nextMetadata = body?.data?.notification_preferences;
    if (nextMetadata) {
      state.notificationPreferences = nextMetadata;
    }

    await fulfillJson(route, {
      user: buildUser(state),
    });
    return;
  }

  if (request.method() === 'POST' && url.pathname === '/auth/v1/logout') {
    await fulfillJson(route, {});
    return;
  }

  await fulfillJson(route, {});
};

const installBrowserClock = async (page: Page) => {
  await page.addInitScript(({ fixedNow }) => {
    const FixedDate = Date;
    const fixedTimestamp = new FixedDate(fixedNow).getTime();

    class MockDate extends FixedDate {
      constructor(...args: ConstructorParameters<typeof Date>) {
        if (args.length === 0) {
          super(fixedTimestamp);
          return;
        }

        super(...args);
      }

      static now() {
        return fixedTimestamp;
      }
    }

    MockDate.parse = FixedDate.parse;
    MockDate.UTC = FixedDate.UTC;
    // @ts-expect-error browser override for deterministic tests
    window.Date = MockDate;
  }, { fixedNow: FIXED_NOW_ISO });
};

export async function installMockSupabase(page: Page, stateOverrides: Partial<MockSupabaseState> = {}) {
  const state = createMockSupabaseState(stateOverrides);

  await installBrowserClock(page);

  await page.route(`${SUPABASE_URL}/**`, async (route) => {
    const request = route.request();

    if (request.method() === 'OPTIONS') {
      await fulfillJson(route, {});
      return;
    }

    const url = new URL(request.url());

    if (url.pathname.startsWith('/auth/v1/')) {
      await handleAuthRequest(route, state);
      return;
    }

    if (url.pathname.startsWith('/rest/v1/')) {
      await handleRestRequest(route, state);
      return;
    }

    await fulfillJson(route, {});
  });

  return state;
}

export const mockSupabaseUser = {
  id: TEST_USER_ID,
  email: TEST_USER_EMAIL,
  password: TEST_USER_PASSWORD,
  fixedNowIso: FIXED_NOW_ISO,
};
