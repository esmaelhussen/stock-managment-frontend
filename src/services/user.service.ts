import { apiClient } from "@/lib/api";
import { User, CreateUserInput, UpdateUserInput } from "@/types";

export class UserService {
  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    await apiClient.post(`/users/${id}/change-password`, {
      oldPassword,
      newPassword,
    });
  }
  async getAll(): Promise<User[]> {
    return await apiClient.get<User[]>("/users");
  }

  async getById(id: string): Promise<User> {
    return await apiClient.get<User>(`/users/${id}`);
  }

  async create(data: CreateUserInput): Promise<User> {
    return await apiClient.post<User>("/users", data);
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    return await apiClient.patch<User>(`/users/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  async getUserPermissions(id: string): Promise<string[]> {
    return await apiClient.get<string[]>(`/users/${id}/permissions`);
  }
}

export const userService = new UserService();
