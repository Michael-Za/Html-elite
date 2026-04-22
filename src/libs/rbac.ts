import { UserRole } from "@prisma/client";

// Permission definitions for each role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    // Full system access - can see and do everything
    "system:manage",
    "tenants:create",
    "tenants:read",
    "tenants:update",
    "tenants:delete",
    "tenant:manage",
    "users:create",
    "users:read",
    "users:update",
    "users:delete",
    "users:all", // Can see all users across tenants
    "deals:create",
    "deals:read",
    "deals:update",
    "deals:delete",
    "deals:all", // Can see all deals across tenants
    "contacts:create",
    "contacts:read",
    "contacts:update",
    "contacts:delete",
    "contacts:all",
    "companies:create",
    "companies:read",
    "companies:update",
    "companies:delete",
    "companies:all",
    "meetings:create",
    "meetings:read",
    "meetings:update",
    "meetings:delete",
    "meetings:all",
    "tasks:create",
    "tasks:read",
    "tasks:update",
    "tasks:delete",
    "tasks:all",
    "prospects:create",
    "prospects:read",
    "prospects:update",
    "prospects:delete",
    "prospects:all",
    "settings:read",
    "settings:update",
    "reports:read",
    "reports:all",
    "activity:read",
    "activity:all",
    "invitations:manage",
    "invitations:all",
  ],
  ADMIN: [
    // Full tenant access
    "tenant:manage",
    "users:create",
    "users:read",
    "users:update",
    "users:delete",
    "deals:create",
    "deals:read",
    "deals:update",
    "deals:delete",
    "contacts:create",
    "contacts:read",
    "contacts:update",
    "contacts:delete",
    "companies:create",
    "companies:read",
    "companies:update",
    "companies:delete",
    "meetings:create",
    "meetings:read",
    "meetings:update",
    "meetings:delete",
    "tasks:create",
    "tasks:read",
    "tasks:update",
    "tasks:delete",
    "prospects:create",
    "prospects:read",
    "prospects:update",
    "prospects:delete",
    "settings:read",
    "settings:update",
    "reports:read",
    "activity:read",
  ],
  MANAGER: [
    // Most access except user management
    "deals:create",
    "deals:read",
    "deals:update",
    "deals:delete",
    "contacts:create",
    "contacts:read",
    "contacts:update",
    "contacts:delete",
    "companies:create",
    "companies:read",
    "companies:update",
    "companies:delete",
    "meetings:create",
    "meetings:read",
    "meetings:update",
    "meetings:delete",
    "tasks:create",
    "tasks:read",
    "tasks:update",
    "tasks:delete",
    "prospects:create",
    "prospects:read",
    "prospects:update",
    "prospects:delete",
    "settings:read",
    "reports:read",
    "activity:read",
  ],
  VIEWER: [
    // Read-only access
    "deals:read",
    "contacts:read",
    "companies:read",
    "meetings:read",
    "tasks:read",
    "prospects:read",
    "reports:read",
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if user can perform action on a resource
 */
export function canPerform(role: UserRole, action: "create" | "read" | "update" | "delete", resource: string): boolean {
  const permission = `${resource}:${action}`;
  return hasPermission(role, permission);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): string[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(role: UserRole): boolean {
  return role === "SUPER_ADMIN";
}

/**
 * Check if user is admin (includes SUPER_ADMIN)
 */
export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/**
 * Check if user is manager or above
 */
export function isManagerOrAbove(role: UserRole): boolean {
  return role === "ADMIN" || role === "MANAGER" || role === "SUPER_ADMIN";
}

/**
 * Role display names
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Administrator",
  ADMIN: "Administrator",
  MANAGER: "Manager",
  VIEWER: "Viewer",
};

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SUPER_ADMIN: "Full system access - can manage all tenants and users across the platform",
  ADMIN: "Full access to all features including user management and tenant settings",
  MANAGER: "Can manage deals, contacts, companies, meetings, and tasks. Cannot manage users.",
  VIEWER: "Read-only access to view data without editing capabilities",
};
