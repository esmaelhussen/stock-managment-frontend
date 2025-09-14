import { apiClient } from "@/lib/api";
import { Customer, CreateCustomerInput, UpdateCustomerInput } from "@/types";

export class CustomerService {
  async getAll(): Promise<Customer[]> {
    return await apiClient.get<Customer[]>("/customers");
  }

  async getById(id: string): Promise<Customer> {
    return await apiClient.get<Customer>(`/customers/${id}`);
  }

  async create(data: CreateCustomerInput): Promise<Customer> {
    return await apiClient.post<Customer>("/customers", data);
  }

  async update(id: string, data: UpdateCustomerInput): Promise<Customer> {
    return await apiClient.patch<Customer>(`/customers/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  }
}

export const customerService = new CustomerService();
