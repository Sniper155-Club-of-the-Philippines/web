import { describe, expect, it } from 'vitest';
import {
    AUTH_ROUTES,
    canAccessStore,
    hasAdminSideRole,
    isMember,
    landingPath,
    mustChangePassword,
} from './auth';
import type { User } from '@/types/models/user';

const make = (over: Partial<User>): User => over as User;

describe('hasAdminSideRole', () => {
    it.each([
        ['admin', true],
        ['store-manager', true],
        ['order-manager', true],
        ['content-manager', true],
        ['member', false],
    ] as const)('treats %s as admin-side=%s', (role, expected) => {
        expect(hasAdminSideRole(make({ roles: [role] }))).toBe(expected);
    });

    it('is false for no roles, null, or undefined roles', () => {
        expect(hasAdminSideRole(make({ roles: [] }))).toBe(false);
        expect(hasAdminSideRole(null)).toBe(false);
        expect(hasAdminSideRole(make({}))).toBe(false);
    });
});

describe('isMember / canAccessStore', () => {
    it('detects the member role', () => {
        expect(isMember(make({ roles: ['member'] }))).toBe(true);
        expect(isMember(make({ roles: ['admin'] }))).toBe(false);
        expect(isMember(null)).toBe(false);
    });

    it('canAccessStore mirrors membership', () => {
        expect(canAccessStore(make({ roles: ['admin', 'member'] }))).toBe(true);
        expect(canAccessStore(make({ roles: ['admin'] }))).toBe(false);
    });
});

describe('mustChangePassword', () => {
    it('reflects the force_password_change flag', () => {
        expect(mustChangePassword(make({ force_password_change: true }))).toBe(
            true,
        );
        expect(mustChangePassword(make({ force_password_change: false }))).toBe(
            false,
        );
        expect(mustChangePassword(make({}))).toBe(false);
        expect(mustChangePassword(null)).toBe(false);
    });
});

describe('landingPath', () => {
    it('sends a forced-reset user to change-password regardless of role', () => {
        expect(
            landingPath(
                make({ roles: ['admin'], force_password_change: true }),
            ),
        ).toBe(AUTH_ROUTES.changePassword);
        expect(
            landingPath(
                make({ roles: ['member'], force_password_change: true }),
            ),
        ).toBe(AUTH_ROUTES.changePassword);
    });

    it('sends an admin-side user to the dashboard', () => {
        expect(landingPath(make({ roles: ['store-manager'] }))).toBe(
            AUTH_ROUTES.dashboard,
        );
    });

    it('sends a member + admin-side user to the dashboard', () => {
        expect(landingPath(make({ roles: ['member', 'order-manager'] }))).toBe(
            AUTH_ROUTES.dashboard,
        );
    });

    it('sends a member-only user to the member portal', () => {
        expect(landingPath(make({ roles: ['member'] }))).toBe(
            AUTH_ROUTES.member,
        );
    });

    it('falls back to the dashboard for a roleless user', () => {
        expect(landingPath(make({ roles: [] }))).toBe(AUTH_ROUTES.dashboard);
        expect(landingPath(null)).toBe(AUTH_ROUTES.dashboard);
    });
});
