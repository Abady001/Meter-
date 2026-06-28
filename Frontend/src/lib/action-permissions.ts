import type { UserRole } from './types';

export type BillingAction =
  | 'user:manage'
  | 'user:read'
  | 'role:manage'
  | 'area:manage'
  | 'project:manage'
  | 'project:read'
  | 'customer:manage'
  | 'customer:read'
  | 'customer:write'
  | 'meter:manage'
  | 'meter:read'
  | 'meter:write'
  | 'meter:assign'
  | 'meter:terminate'
  | 'reading:manage'
  | 'reading:read'
  | 'reading:write'
  | 'reading:approve'
  | 'invoice:manage'
  | 'invoice:read'
  | 'invoice:write'
  | 'invoice:issue'
  | 'invoice:cancel'
  | 'payment:manage'
  | 'payment:read'
  | 'payment:write'
  | 'payment:edit'
  | 'payment:delete'
  | 'payment:record'
  | 'payment:reverse'
  | 'sim:manage'
  | 'sim:read'
  | 'sim:write'
  | 'billing:manage'
  | 'billing:read'
  | 'report:read'
  | 'report:manage'
  | 'alert:read'
  | 'alert:manage'
  | 'ticket:read'
  | 'ticket:manage'
  | 'audit:view'
  | 'config:manage'
  | 'settlement:run'
  | 'notification:send'
  | 'admin:access';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 100,
  system_admin: 90,
  admin: 80,
  area_manager: 70,
  team_leader: 65,
  supervisor: 60,
  operator: 55,
  technician: 50,
  finance: 45,
  accountant: 40,
  support: 35,
  collector: 30,
  meter_reader: 25,
  inspector: 20,
  viewer: 10,
  customer: 5,
};

const ACTION_MINIMUM_ROLE: Record<BillingAction, UserRole> = {
  'user:manage': 'super_admin',
  'user:read': 'system_admin',
  'role:manage': 'super_admin',
  'area:manage': 'system_admin',
  'project:manage': 'admin',
  'project:read': 'viewer',
  'customer:manage': 'admin',
  'customer:read': 'viewer',
  'customer:write': 'area_manager',
  'meter:manage': 'admin',
  'meter:read': 'viewer',
  'meter:write': 'team_leader',
  'meter:assign': 'area_manager',
  'meter:terminate': 'admin',
  'reading:manage': 'admin',
  'reading:read': 'viewer',
  'reading:write': 'technician',
  'reading:approve': 'team_leader',
  'invoice:manage': 'admin',
  'invoice:read': 'viewer',
  'invoice:write': 'area_manager',
  'invoice:issue': 'area_manager',
  'invoice:cancel': 'admin',
  'payment:manage': 'admin',
  'payment:read': 'viewer',
  'payment:write': 'collector',
  'payment:reverse': 'finance',
  'sim:manage': 'admin',
  'sim:read': 'operator',
  'sim:write': 'operator',
  'billing:manage': 'system_admin',
  'billing:read': 'finance',
  'report:read': 'viewer',
  'report:manage': 'super_admin',
  'alert:read': 'viewer',
  'alert:manage': 'admin',
  'ticket:read': 'viewer',
  'ticket:manage': 'operator',
  'audit:view': 'admin',
  'config:manage': 'super_admin',
  'settlement:run': 'accountant',
  'notification:send': 'system_admin',
  'admin:access': 'super_admin',
};

export function canPerform(role: UserRole | undefined | null, action: BillingAction): boolean {
  if (!role) return false;
  const userLevel = ROLE_HIERARCHY[role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[ACTION_MINIMUM_ROLE[action]];
  return userLevel >= requiredLevel;
}
