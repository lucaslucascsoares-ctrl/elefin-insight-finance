import type { GroupType } from '@/types/finance';

const GROUP_TYPES: GroupType[] = ['essenciais', 'desejos', 'prioridades'];

export const isGroupType = (value: unknown): value is GroupType =>
  typeof value === 'string' && GROUP_TYPES.includes(value as GroupType);

export const normalizeGroupType = (value: unknown, fallback: GroupType = 'essenciais'): GroupType =>
  isGroupType(value) ? value : fallback;
