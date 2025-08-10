import { apiClient } from '@/lib/api';
import { Permission, CreatePermissionInput, UpdatePermissionInput } from '@/types';

export class PermissionService {
  async getAll(): Promise<Permission[]> {
    return await apiClient.get<Permission[]>('/permissions');
  }

  async getByResource(resource: string): Promise<Permission[]> {
    return await apiClient.get<Permission[]>(`/permissions?resource=${resource}`);
  }

  async getById(id: string): Promise<Permission> {
    return await apiClient.get<Permission>(`/permissions/${id}`);
  }

  async create(data: CreatePermissionInput): Promise<Permission> {
    return await apiClient.post<Permission>('/permissions', data);
  }

  async update(id: string, data: UpdatePermissionInput): Promise<Permission> {
    return await apiClient.patch<Permission>(`/permissions/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/permissions/${id}`);
  }
}

export const permissionService = new PermissionService();