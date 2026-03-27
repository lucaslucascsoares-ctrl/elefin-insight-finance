import { describe, expect, it } from 'vitest';
import { getTransactionDateForMonth } from '@/lib/transactionDates';

describe('getTransactionDateForMonth', () => {
  it('uses the selected month when the user is viewing a past month', () => {
    const selectedDate = new Date('2026-02-01T00:00:00');
    const now = new Date('2026-03-27T12:00:00');

    expect(getTransactionDateForMonth(selectedDate, now)).toBe('2026-02-01');
  });

  it('uses today when the selected month is the current month', () => {
    const selectedDate = new Date('2026-03-01T00:00:00');
    const now = new Date('2026-03-27T12:00:00');

    expect(getTransactionDateForMonth(selectedDate, now)).toBe('2026-03-27');
  });
});
