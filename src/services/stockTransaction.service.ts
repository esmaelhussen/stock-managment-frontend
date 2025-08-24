import { apiClient } from "@/lib/api";
import { StockTransaction, CreateStockTransactionInput, Stock } from "@/types";

export class StockTransactionService {
  async getAllStock(): Promise<Stock[]> {
    return await apiClient.get<Stock[]>("/stock-transactions/all-stock");
  }

  //   async getStockByWarehouse(warehouseId: string): Promise<Stock[]> {
  //     return await apiClient.get<Stock[]>(
  //       `/stock-transactions/stock?warehouseId=${warehouseId}`
  //     );
  //   }

  async getAllTransactions(): Promise<StockTransaction[]> {
    return await apiClient.get<StockTransaction[]>(
      "/stock-transactions/history"
    );
  }

  async createTransaction(
    transactionData: CreateStockTransactionInput
  ): Promise<StockTransaction> {
    return await apiClient.post<StockTransaction>(
      "/stock-transactions",
      transactionData
    );
  }
}

export const stockTransactionService = new StockTransactionService();
