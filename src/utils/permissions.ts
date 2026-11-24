import type { RoleCode } from '../types';

export interface Permissions {
  isAuthenticated: boolean;
  canViewCatalog: boolean;
  canCreateOrder: boolean;
  canManageOrders: boolean;
  canManageProducts: boolean;
}

export function getPermissions(role?: RoleCode | null): Permissions {
  return {
    isAuthenticated: Boolean(role),
    canViewCatalog: true,
    canCreateOrder: role === 'client' || role === 'manager' || role === 'admin',
    canManageOrders: role === 'manager' || role === 'admin',
    canManageProducts: role === 'admin',
  };
}