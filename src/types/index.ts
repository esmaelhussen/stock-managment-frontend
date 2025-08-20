export interface Category {
  id: string;
  name: string;
  identifier?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryInput {
  name: string;
  identifier?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  identifier?: string;
}
export interface User {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  isActive: boolean;
  userRoles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  rolePermissions: RolePermission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  role: Role;
  assignedAt: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  permission: Permission;
  assignedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    permissions: string[];
  };
}

export interface CreateUserInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  password: string;
  roleIds?: string[];
}

export interface UpdateUserInput {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  isActive?: boolean;
  roleIds?: string[];
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: string[];
}

export interface CreatePermissionInput {
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface UpdatePermissionInput {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  description?: string;
}

export interface CreateWarehouseInput {
  name: string;
  address: string;
  description?: string;
}

export interface UpdateWarehouseInput {
  name?: string;
  address?: string;
  description?: string;
}

export interface Unit {
  id: string;
  name: string;
}

export interface CreateUnitInput {
  name: string;
}

export interface UpdateUnitInput {
  name?: string;
}