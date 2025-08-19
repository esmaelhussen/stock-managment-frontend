import { apiClient } from '@/lib/api';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types';

export class CategoryService {
  async getAll(): Promise<Category[]> {
    return await apiClient.get<Category[]>('/categories');
  }

  async getById(id: string): Promise<Category> {
    return await apiClient.get<Category>(`/categories/${id}`);
  }

  async create(data: CreateCategoryInput): Promise<Category> {
    return await apiClient.post<Category>('/categories', data);
  }

  async update(id: string, data: UpdateCategoryInput): Promise<Category> {
    return await apiClient.patch<Category>(`/categories/${id}`, data);
  }

  async remove(id: string): Promise<void> {
    return await apiClient.delete(`/categories/${id}`);
  }
}

export const categoryService = new CategoryService();
