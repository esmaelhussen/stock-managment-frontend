import { apiClient } from "@/lib/api";
import { Product, CreateProductInput, UpdateProductInput } from "@/types";

export class ProductService {
  async getAll(): Promise<Product[]> {
    return await apiClient.get<Product[]>("/products");
  }

  async getById(id: string): Promise<Product> {
    return await apiClient.get<Product>(`/products/${id}`);
  }

  async create(data: CreateProductInput): Promise<Product> {
    return await apiClient.post<Product>("/products", data);
  }

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    return await apiClient.patch<Product>(`/products/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }
}

export const productService = new ProductService();
