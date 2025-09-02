import { apiClient } from "@/lib/api";
import { SalesTransaction, CreateSalesTransactionInput } from "@/types";

export class SaleService {
  async getShopProducts(shopId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/shop/${shopId}/products`);
  }

  async createSalesTransaction(
    data: CreateSalesTransactionInput
  ): Promise<SalesTransaction> {
    return apiClient.post<SalesTransaction>("/sales-transactions", data);
  }

  async getSalesTransactions(shopId: string): Promise<SalesTransaction[]> {
    return apiClient.get<SalesTransaction[]>(
      `/sales-transactions?shopId=${shopId}`
    );
  }

  async updateTransactionStatus(
    transactionId: string,
    status: "unpayed" | "payed"
  ): Promise<void> {
    await apiClient.patch(`/sales-transactions/${transactionId}/status`, {
      status,
    });
  }
}

export const saleService = new SaleService();
