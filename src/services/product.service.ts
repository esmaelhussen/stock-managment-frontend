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
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === "image" && value instanceof File) {
          formData.append("file", value); // Use the field name `file` for the image
        } else if (key === "price") {
          formData.append(key, value.toString()); // Ensure price is sent as a number
        } else {
          formData.append(key, String(value));
        }
      }
    });
    return await apiClient.post<Product>("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === "image" && value instanceof File) {
          formData.append("file", value); // Use the field name `file` for the image
        } else if (key === "price") {
          formData.append(key, value.toString()); // Ensure price is sent as a number
        } else {
          formData.append(key, String(value));
        }
      }
    });
    return await apiClient.patch<Product>(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }
}

export const productService = new ProductService();
