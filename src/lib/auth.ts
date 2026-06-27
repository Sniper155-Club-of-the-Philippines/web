import type { User } from '@/types/models/user';

/**
 * Roles that belong to the admin side of the app (the `/dashboard` portal).
 * `member` is intentionally excluded — it is the store-only portal role.
 */
export const ADMIN_SIDE_ROLES = [
    'admin',
    'store-manager',
    'order-manager',
    'content-manager',
] as const;

export const AUTH_ROUTES = {
    dashboard: '/dashboard',
    member: '/member',
    changePassword: '/change-password',
} as const;

type RoleAware =
    | Pick<User, 'roles' | 'force_password_change'>
    | null
    | undefined;

/** Does the user hold at least one admin-side role? */
export function hasAdminSideRole(user: RoleAware): boolean {
    const roles = user?.roles ?? [];
    return roles.some((role) =>
        (ADMIN_SIDE_ROLES as readonly string[]).includes(role),
    );
}

/** Is the user a store member? */
export function isMember(user: RoleAware): boolean {
    return (user?.roles ?? []).includes('member');
}

/** Must the user reset their password before doing anything else? */
export function mustChangePassword(user: RoleAware): boolean {
    return Boolean(user?.force_password_change);
}

/**
 * A member who also holds an admin-side role lands on `/dashboard` but is
 * offered a "Go to Store" path. This is true exactly when both are present.
 */
export function canAccessStore(user: RoleAware): boolean {
    return isMember(user);
}

/**
 * The path a user should land on after authenticating.
 *
 * Precedence: a forced password reset wins over everything; otherwise any
 * admin-side role goes to `/dashboard` (a `member` + admin-side user lands here
 * too, with a "Go to Store" path); a member-only user goes to `/member`. A user
 * with no recognised role falls back to `/dashboard` (the admin area re-gates
 * server-side regardless).
 */
export function landingPath(user: RoleAware): string {
    if (mustChangePassword(user)) {
        return AUTH_ROUTES.changePassword;
    }

    if (hasAdminSideRole(user)) {
        return AUTH_ROUTES.dashboard;
    }

    if (isMember(user)) {
        return AUTH_ROUTES.member;
    }

    return AUTH_ROUTES.dashboard;
}
