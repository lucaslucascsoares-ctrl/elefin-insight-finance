import { useCallback, useEffect, useMemo, useState } from 'react';
import { RecurringRule, RecurringRuleInput } from '@/types/finance';

const STORAGE_PREFIX = 'elefin:recurring-rules';
const UPDATE_EVENT = 'elefin:recurring-rules-updated';

const createId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalize = (value: string | null | undefined) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const getStorageKey = (userId?: string) => `${STORAGE_PREFIX}:${userId || 'anonymous'}`;

const readRules = (userId?: string): RecurringRule[] => {
  if (!userId || typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecurringRule[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeRules = (userId: string, rules: RecurringRule[]) => {
  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(rules));
  window.dispatchEvent(new Event(UPDATE_EVENT));
};

export function useRecurringRules(userId?: string) {
  const [rules, setRules] = useState<RecurringRule[]>(() => readRules(userId));

  useEffect(() => {
    setRules(readRules(userId));
  }, [userId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncRules = () => setRules(readRules(userId));

    window.addEventListener('storage', syncRules);
    window.addEventListener(UPDATE_EVENT, syncRules);

    return () => {
      window.removeEventListener('storage', syncRules);
      window.removeEventListener(UPDATE_EVENT, syncRules);
    };
  }, [userId]);

  const activeRules = useMemo(() => rules.filter((rule) => rule.active), [rules]);

  const saveRule = useCallback(
    (input: RecurringRuleInput) => {
      if (!userId || typeof window === 'undefined') return null;

      const currentRules = readRules(userId);
      const normalizedDescription = normalize(input.description);
      const startsAt = input.starts_at.slice(0, 10);

      const existing = currentRules.find(
        (rule) =>
          rule.type === input.type &&
          rule.category_id === input.category_id &&
          normalize(rule.description) === normalizedDescription,
      );

      const nextRule: RecurringRule = existing
        ? {
            ...existing,
            amount: input.amount,
            starts_at: startsAt,
            description: input.description,
            active: true,
          }
        : {
            id: createId(),
            user_id: userId,
            type: input.type,
            amount: input.amount,
            category_id: input.category_id,
            description: input.description,
            starts_at: startsAt,
            active: true,
            created_at: new Date().toISOString(),
          };

      const nextRules = existing
        ? currentRules.map((rule) => (rule.id === existing.id ? nextRule : rule))
        : [...currentRules, nextRule];

      writeRules(userId, nextRules);
      setRules(nextRules);
      return nextRule;
    },
    [userId],
  );

  const removeRule = useCallback(
    (ruleId: string) => {
      if (!userId || typeof window === 'undefined') return;

      const nextRules = readRules(userId).filter((rule) => rule.id !== ruleId);
      writeRules(userId, nextRules);
      setRules(nextRules);
    },
    [userId],
  );

  const toggleRule = useCallback(
    (ruleId: string, active: boolean) => {
      if (!userId || typeof window === 'undefined') return;

      const nextRules = readRules(userId).map((rule) =>
        rule.id === ruleId ? { ...rule, active } : rule,
      );

      writeRules(userId, nextRules);
      setRules(nextRules);
    },
    [userId],
  );

  return {
    rules,
    activeRules,
    saveRule,
    removeRule,
    toggleRule,
  };
}
