import { useEffect, useMemo, useState } from 'react';
import { MonthlyProjectionOverride, MonthlyProjectionStatus, ProjectionTemplate } from '@/types/finance';
import {
  buildMonthlyProjectionItems,
  createMonthlyProjectionOverrideId,
  getProjectionOverridesStorageKey,
  readLocalStorageJson,
  writeLocalStorageJson,
} from '@/lib/projections';

interface SaveProjectionOverrideInput {
  templateId: string;
  month: number;
  year: number;
  amountOverride?: number | null;
  titleOverride?: string | null;
  status?: MonthlyProjectionStatus;
  paidTransactionId?: string | null;
}

export function useMonthlyProjectionItems(
  userId: string | undefined,
  templates: ProjectionTemplate[],
  month: number,
  year: number,
) {
  const [overrides, setOverrides] = useState<MonthlyProjectionOverride[]>([]);

  useEffect(() => {
    if (!userId) {
      setOverrides([]);
      return;
    }

    const storageKey = getProjectionOverridesStorageKey(userId);
    const storedOverrides = readLocalStorageJson<MonthlyProjectionOverride[]>(storageKey, []);
    setOverrides(storedOverrides);
  }, [userId]);

  const persistOverrides = (nextOverrides: MonthlyProjectionOverride[]) => {
    if (!userId) return;
    writeLocalStorageJson(getProjectionOverridesStorageKey(userId), nextOverrides);
    setOverrides(nextOverrides);
  };

  const saveOverride = ({
    templateId,
    month: overrideMonth,
    year: overrideYear,
    amountOverride,
    titleOverride,
    status,
    paidTransactionId,
  }: SaveProjectionOverrideInput) => {
    if (!userId) return;

    const overrideId = createMonthlyProjectionOverrideId(templateId, overrideMonth, overrideYear);
    const existingOverride = overrides.find((override) => override.id === overrideId);
    const nextOverride: MonthlyProjectionOverride = {
      id: overrideId,
      user_id: userId,
      template_id: templateId,
      month: overrideMonth,
      year: overrideYear,
      amount_override:
        amountOverride === undefined
          ? existingOverride?.amount_override ?? null
          : amountOverride,
      title_override:
        titleOverride === undefined
          ? existingOverride?.title_override ?? null
          : titleOverride,
      status: status ?? existingOverride?.status ?? 'predicted',
      paid_transaction_id:
        paidTransactionId === undefined
          ? existingOverride?.paid_transaction_id ?? null
          : paidTransactionId,
      updated_at: new Date().toISOString(),
    };

    const nextOverrides = existingOverride
      ? overrides.map((override) => (override.id === overrideId ? nextOverride : override))
      : [...overrides, nextOverride];

    persistOverrides(nextOverrides);
  };

  const clearOverride = (templateId: string, overrideMonth: number, overrideYear: number) => {
    const overrideId = createMonthlyProjectionOverrideId(templateId, overrideMonth, overrideYear);
    persistOverrides(overrides.filter((override) => override.id !== overrideId));
  };

  const items = useMemo(
    () => buildMonthlyProjectionItems({ templates, overrides, month, year }),
    [month, overrides, templates, year],
  );

  return {
    items,
    overrides,
    saveOverride,
    clearOverride,
  };
}
