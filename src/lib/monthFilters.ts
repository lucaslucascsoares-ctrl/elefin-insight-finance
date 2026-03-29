import { Transaction } from '@/types/finance';

const ISO_DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})/;

export const getMonthPartsFromDateString = (value: string) => {
  const match = ISO_DATE_PREFIX.exec(value.trim());

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;

  return { year, month, day };
};

export const isDateInMonth = (value: string, month: number, year: number) => {
  const parts = getMonthPartsFromDateString(value);
  if (!parts) return false;
  return parts.month === month && parts.year === year;
};

export const isDateBeforeMonth = (value: string, month: number, year: number) => {
  const parts = getMonthPartsFromDateString(value);
  if (!parts) return false;
  return parts.year < year || (parts.year === year && parts.month < month);
};

export const filterTransactionsByMonth = (transactions: Transaction[], month: number, year: number) =>
  transactions.filter((transaction) => isDateInMonth(transaction.date, month, year));
