import { apiClient } from '@/lib/api';
import { Role, CreateRoleInput, UpdateRoleInput } from '@/types';

export class RoleService {
  async getAll(): Promise<Role[]> {
    return await apiClient.get<Role[]>('/roles');
  }

  async getById(id: string): Promise<Role> {
    return await apiClient.get<Role>(`/roles/${id}`);
  }

  async create(data: CreateRoleInput): Promise<Role> {
    return await apiClient.post<Role>('/roles', data);
  }

  async update(id: string, data: UpdateRoleInput): Promise<Role> {
    return await apiClient.patch<Role>(`/roles/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/roles/${id}`);
  }
}

export const roleService = new RoleService();