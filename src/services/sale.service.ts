import { apiClient } from "@/lib/api";
import { SalesTransaction, CreateSalesTransactionInput } from "@/types";

export class SaleService {
  async createSalesTransaction(
    data: CreateSalesTransactionInput,
  ): Promise<SalesTransaction> {
    return apiClient.post<SalesTransaction>("/sales-transactions", data);
  }

  // async getProducts(locationId: string, type: "shop" | "warehouse"): Promise<any[]> {
  //   return apiClient.get<any[]>(`/${type}/${locationId}/products`);
  // }

  async getSalesTransactions(
    locationId: string,
    type: "shop" | "warehouse",
  ): Promise<SalesTransaction[]> {
    return apiClient.get<SalesTransaction[]>(
      `/sales-transactions?${type}Id=${locationId}`,
    );
  }

  async updateTransactionStatus(
    transactionId: string,
    status: "unpayed" | "payed",
  ): Promise<void> {
    await apiClient.patch(`/sales-transactions/${transactionId}/status`, {
      status,
    });
  }

  async getSalesReport(
    locationId: string,
    type: "shop" | "warehouse",
    period: "daily" | "weekly" | "monthly" | "yearly",
  ): Promise<any> {
    return apiClient.get(
      `/sales-transactions/report?${type}Id=${locationId}&period=${period}`,
    );
  }
}

export const saleService = new SaleService();
