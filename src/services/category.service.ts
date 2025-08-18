import { apiClient } from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  name?: string;
}

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

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  }
}

export const categoryService = new CategoryService();
