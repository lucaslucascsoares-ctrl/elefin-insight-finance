export interface AdminUserRecord {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  isDisabled: boolean;
}

export const MASTER_ADMIN_EMAIL = 'lucas.lucascsoares@gmail.com';

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const parseAdminEmails = (value: string | undefined | null) =>
  [...new Set((value ?? '').split(',').map(normalizeEmail).filter(Boolean))];

export const isAdminEmail = (
  email: string | null | undefined,
  _adminEmails: string[] = [],
) => {
  if (!email) return false;
  const normalizedEmail = normalizeEmail(email);
  return normalizedEmail === MASTER_ADMIN_EMAIL;
};

export const canAccessAdminShell = (email: string | null | undefined) => isAdminEmail(email);

export const summarizeAdminUsers = (
  users: AdminUserRecord[],
  now = new Date(),
  recentWindowDays = 30,
) => {
  const threshold = new Date(now);
  threshold.setDate(threshold.getDate() - recentWindowDays);

  return {
    totalUsers: users.length,
    activeUsers: users.filter((user) => Boolean(user.lastSignInAt) && !user.isDisabled).length,
    disabledUsers: users.filter((user) => user.isDisabled).length,
    newUsersLast30Days: users.filter((user) => new Date(user.createdAt) >= threshold).length,
  };
};
