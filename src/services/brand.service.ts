import { apiClient } from "@/lib/api";
import { Brand, CreateBrandInput, UpdateBrandInput } from "@/types";

export class BrandService {
  async getAll(): Promise<Brand[]> {
    return await apiClient.get<Brand[]>("/brands");
  }

  async getById(id: string): Promise<Brand> {
    return await apiClient.get<Brand>(`/brands/${id}`);
  }

  async create(data: CreateBrandInput): Promise<Brand> {
    return await apiClient.post<Brand>("/brands", data);
  }

  async update(id: string, data: UpdateBrandInput): Promise<Brand> {
    return await apiClient.patch<Brand>(`/brands/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/brands/${id}`);
  }
}

export const brandService = new BrandService();
