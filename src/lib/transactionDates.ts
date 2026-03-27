export const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTransactionDateForMonth = (selectedDate: Date, now = new Date()) => {
  const sameMonth =
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth();

  if (sameMonth) {
    return toIsoDate(now);
  }

  return toIsoDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
};
