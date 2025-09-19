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

  async makeCreditPayment(
    transactionId: string,
    amount: number
  ): Promise<{ paidAmount: number; remainingAmount: number; status: string }> {
    return apiClient.post(`/sales-transactions/${transactionId}/credit-payment`, {
      amount,
    });
  }

  async getCreditTransactions(
    locationId?: string,
    type?: "shop" | "warehouse"
  ): Promise<SalesTransaction[]> {
    const params = locationId && type ? `?${type}Id=${locationId}` : "";
    return apiClient.get<SalesTransaction[]>(`/sales-transactions/credit${params}`);
  }

  async getOverdueCredits(): Promise<SalesTransaction[]> {
    return apiClient.get<SalesTransaction[]>("/sales-transactions/credit/overdue");
  }

  async checkOverdueCredits(): Promise<{ message: string; overdueCount: number }> {
    return apiClient.post("/sales-transactions/credit/check-overdue");
  }
}

export const saleService = new SaleService();
