import { apiClient } from "@/lib/api";
import { Warehouse, CreateWarehouseInput, UpdateWarehouseInput } from "@/types";

export class WarehouseService {
  async getAll(): Promise<Warehouse[]> {
    return await apiClient.get<Warehouse[]>("/warehouses");
  }

  async getById(id: string): Promise<Warehouse> {
    return await apiClient.get<Warehouse>(`/warehouses/${id}`);
  }

  async create(data: CreateWarehouseInput): Promise<Warehouse> {
    return await apiClient.post<Warehouse>("/warehouses", data);
  }

  async update(id: string, data: UpdateWarehouseInput): Promise<Warehouse> {
    return await apiClient.patch<Warehouse>(`/warehouses/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/warehouses/${id}`);
  }
}

export const warehouseService = new WarehouseService();
