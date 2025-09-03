import { apiClient } from "@/lib/api";
import { Shop, CreateShopInput, UpdateShopInput } from "@/types";

export class ShopService {
  async getAll(): Promise<Shop[]> {
    return await apiClient.get<Shop[]>("/shops");
  }

  async getById(id: string): Promise<Shop> {
    return await apiClient.get<Shop>(`/shops/${id}`);
  }

  async create(data: CreateShopInput): Promise<Shop> {
    return await apiClient.post<Shop>("/shops", data);
  }

  async update(id: string, data: UpdateShopInput): Promise<Shop> {
    return await apiClient.patch<Shop>(`/shops/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/shops/${id}`);
  }

  // async getShopsByWarehouse(warehouseId: string): Promise<Shop[]> {
  //   return await apiClient.get<Shop[]>(`/warehouses/${warehouseId}/shops`);
  // }
}

export const shopService = new ShopService();
