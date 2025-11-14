import { User, UserRole } from '@prisma/client';
import prisma from '@/lib/database/prisma';
import { PermissionError } from '../types/auth.error';

// Permission types definition
export type Permission = 
  | 'read:customer'
  | 'write:customer'
  | 'delete:customer'
  | 'read:template'
  | 'write:template'
  | 'delete:template'
  | 'read:mail'
  | 'write:mail'
  | 'delete:mail'
  | 'read:user'
  | 'write:user'
  | 'delete:user'
  | 'read:report'
  | 'write:report'
  | 'read:settings'
  | 'write:settings';

// check if user has specific permission
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return false;
  }

  // use utility function to check if role has permission
  return roleHasPermission(user.role, permission);
}

// Validate user permissions
export async function checkPermission(userId: string, permission: Permission): Promise<void> {
  const hasPerm = await hasPermission(userId, permission);
  
  if (!hasPerm) {
    throw new PermissionError(
      `User does not have permission: ${permission}`,
      'INSUFFICIENT_PERMISSIONS'
    );
  }
}

// Check if user has specific role
export function hasRole(user: User, role: UserRole): boolean {
  return user.role === role;
}

// Check if user is admin
export function isAdmin(user: User): boolean {
  return user.role === UserRole.ADMIN;
}

// Check if user is regular user
export function isUser(user: User): boolean {
  return user.role === UserRole.USER;
}

// Super Admin check (same as Admin here, can be extended if needed)
export function isSuperAdmin(user: User): boolean {
  return user.role === UserRole.ADMIN;
}

// Check if user is editor
export function isEditor(user: User): boolean {
  return user.role === UserRole.EDITOR;
}

// Check if user can manage content (editor or admin)
export function canManageContent(user: User): boolean {
  return user.role === UserRole.EDITOR || user.role === UserRole.ADMIN;
}

// ============================================
// Role-based access control (RBAC) utilities
// ============================================

// Role permissions mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
  USER: [
    'read:customer',
    'write:customer',
    'read:template',
    'write:template',
    'read:mail',
    'write:mail',
    'read:report',
  ],
  EDITOR: [
    'read:customer',
    'write:customer',
    'read:template',
    'write:template',
    'delete:template',
    'read:mail',
    'write:mail',
    'read:report',
    'write:report',
  ],
  ADMIN: [
    'read:customer',
    'write:customer',
    'delete:customer',
    'read:template',
    'write:template',
    'delete:template',
    'read:mail',
    'write:mail',
    'delete:mail',
    'read:user',
    'write:user',
    'delete:user',
    'read:report',
    'write:report',
    'read:settings',
    'write:settings',
  ],
};

// Check if role has specific permission
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = rolePermissions[role] || [];
  return permissions.includes(permission);
}

// Fetch all permissions for a role
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] || [];
}

// Get all roles
export function getAllRoles(): UserRole[] {
  return Object.values(UserRole);
}

// Get role description
export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrator with full access to all system features';
    case UserRole.EDITOR:
      return 'Editor with access to content management features';
    case UserRole.USER:
      return 'Standard user with access to basic features';
    default:
      return 'Unknown role';
  }
}

// ============================================
// Unified RBAC Service
// ============================================

export const rbac = {
  // Permission checks
  hasPermission,
  roleHasPermission,
  canManageContent,
  
  // role checks
  getRolePermissions,
  getAllRoles,
  getRoleDescription,
  isAdmin,
  isEditor,
  
  // permission enforcement
  requirePermission: async (userId: string, permission: Permission) => {
    const hasAccess = await hasPermission(userId, permission);
    if (!hasAccess) {
      throw new PermissionError(`Permission denied: ${permission}`, 'PERMISSION_DENIED');
    }
    return true;
  }
};