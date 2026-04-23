import { describe, expect, it } from 'vitest';
import {
  MASTER_ADMIN_EMAIL,
  canAccessAdminShell,
  isAdminEmail,
  parseAdminEmails,
  summarizeAdminUsers,
  type AdminUserRecord,
} from '@/lib/adminAccess';

describe('admin access helpers', () => {
  it('normalizes and de-duplicates admin emails from config', () => {
    expect(parseAdminEmails(' Lucas@Example.com,admin@example.com, lucas@example.com ')).toEqual([
      'lucas@example.com',
      'admin@example.com',
    ]);
  });

  it('checks admin access by the locked master email only', () => {
    expect(isAdminEmail(' lucas.lucascsoares@gmail.com ', [])).toBe(true);
    expect(isAdminEmail('other@example.com', [MASTER_ADMIN_EMAIL])).toBe(false);
  });

  it('allows the admin shell to render immediately for the master email', () => {
    expect(canAccessAdminShell(' lucas.lucascsoares@gmail.com ')).toBe(true);
    expect(canAccessAdminShell('other@example.com')).toBe(false);
    expect(canAccessAdminShell(null)).toBe(false);
  });

  it('summarizes user activity for the admin dashboard', () => {
    const users: AdminUserRecord[] = [
      {
        id: '1',
        email: 'first@example.com',
        createdAt: '2026-04-20T10:00:00.000Z',
        lastSignInAt: '2026-04-21T12:00:00.000Z',
        isDisabled: false,
      },
      {
        id: '2',
        email: 'second@example.com',
        createdAt: '2026-03-01T10:00:00.000Z',
        lastSignInAt: null,
        isDisabled: true,
      },
      {
        id: '3',
        email: 'third@example.com',
        createdAt: '2026-04-10T10:00:00.000Z',
        lastSignInAt: '2026-04-18T12:00:00.000Z',
        isDisabled: false,
      },
    ];

    expect(summarizeAdminUsers(users, new Date('2026-04-22T00:00:00.000Z'))).toEqual({
      totalUsers: 3,
      activeUsers: 2,
      disabledUsers: 1,
      newUsersLast30Days: 2,
    });
  });
});
