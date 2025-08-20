import { apiClient } from "@/lib/api";
import { Unit, CreateUnitInput, UpdateUnitInput } from "@/types";

export class UnitService {
  async getAll(): Promise<Unit[]> {
    return await apiClient.get<Unit[]>("/units");
  }

  async getById(id: string): Promise<Unit> {
    return await apiClient.get<Unit>(`/units/${id}`);
  }

  async create(data: CreateUnitInput): Promise<Unit> {
    return await apiClient.post<Unit>("/units", data);
  }

  async update(id: string, data: UpdateUnitInput): Promise<Unit> {
    return await apiClient.patch<Unit>(`/units/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/units/${id}`);
  }
}

export const unitService = new UnitService();
