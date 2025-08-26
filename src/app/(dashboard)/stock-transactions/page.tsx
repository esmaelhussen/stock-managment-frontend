"use client";

import React, { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { stockTransactionService } from "@/services/stockTransaction.service";
import { productService } from "@/services/product.service";
import { warehouseService } from "@/services/warehouse.service";
import { authService } from "@/services/auth.service";
import {
  StockTransaction,
  CreateStockTransactionInput,
  Product,
  Warehouse,
} from "@/types";
import Cookies from "js-cookie";
import withPermission from "@/hoc/withPermission";
import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";

export default function StockTransactionsPage() {
  const [allTransactions, setAllTransactions] = useState<StockTransaction[]>(
    []
  );
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string> | null>(
    null
  );
  const [userWarehouseId, setUserWarehouseId] = useState<string | null>(null);
  const total = allTransactions.length;
  const permissions = JSON.parse(Cookies.get("permission") || "[]");
  const userId = JSON.parse(Cookies.get("user") || "{}").id;
  const roles = JSON.parse(Cookies.get("roles") || "[]");
  const warehouse = JSON.parse(Cookies.get("user") || "null").warehouse;
  console.log("roles", roles.includes("warehouse"));

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    fetchTransactions();
    const warehouseId = authService.getWarehouseId();
    setUserWarehouseId(warehouseId);
  }, []);

  useEffect(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setTransactions(allTransactions.slice(start, end));
  }, [allTransactions, page, pageSize]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await productService.getAll();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };

    const fetchWarehouses = async () => {
      try {
        const fetchedWarehouses = await warehouseService.getAll();
        setWarehouses(fetchedWarehouses);
      } catch (error) {
        console.error("Failed to fetch warehouses", error);
      }
    };

    fetchProducts();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (userWarehouseId && isCreateModalOpen) {
      setValue("warehouseId", userWarehouseId);
      setValue("sourceWarehouseId", userWarehouseId);
    }
  }, [isCreateModalOpen, userWarehouseId, setValue]);

  const fetchTransactions = async () => {
    try {
      const data = await stockTransactionService.getAllTransactions();

      const isWarehouseRole = roles.includes("warehouse");

      const filteredData = isWarehouseRole
        ? data.filter((transaction) => {
            const sourceId = transaction.sourceWarehouse?.id?.toLowerCase();
            const targetId = transaction.targetWarehouse?.id?.toLowerCase();
            const userWarehouseId = warehouse?.id?.toLowerCase();
            return sourceId === userWarehouseId || targetId === userWarehouseId;
          })
        : data;

      setAllTransactions(filteredData);
    } catch (error) {
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateStockTransactionInput) => {
    // Validation
    const errors: Record<string, string> = {};
    if (!data.type) errors.type = "Transaction type is required";
    if (!data.productId) errors.productId = "Product is required";
    if (!data.quantity || data.quantity <= 0)
      errors.quantity = "Quantity must be greater than 0";

    if (data.type === "add" || data.type === "remove") {
      if (!data.sourceWarehouseId)
        errors.sourceWarehouseId = "Source Warehouse is required";
    }

    if (data.type === "transfer") {
      if (!data.sourceWarehouseId)
        errors.sourceWarehouseId = "Source Warehouse is required";
      if (!data.targetWarehouseId)
        errors.targetWarehouseId = "Target Warehouse is required";
    }

    setFormErrors(Object.keys(errors).length ? errors : null);
    if (Object.keys(errors).length) return;

    try {
      await stockTransactionService.createTransaction(data);
      toast.success("Transaction created successfully");
      setIsCreateModalOpen(false);
      reset(); // Reset the form fields
      fetchTransactions(); // Refresh the transactions list
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create transaction"
      );
    }
  };

  const transactionType = watch("type");

  const onSubmit = (data: any) => {
    const transformedData: CreateStockTransactionInput = {
      ...data,
      quantity: Number(data.quantity), // Ensure quantity is sent as a number
      sourceWarehouseId:
        data.type === "add" || data.type === "remove"
          ? data.warehouseId
          : data.sourceWarehouseId,
      targetWarehouseId:
        data.type === "transfer" ? data.targetWarehouseId : undefined,
      transactedById: userId,
    };

    // Clean up unused fields
    delete (transformedData as any).warehouseId;

    console.log("Transformed Data:", transformedData); // Optional debug log
    handleCreate(transformedData);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Stock Transactions
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              className="appearance-none px-4 py-2 pr-10 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
              value={pageSize}
              onChange={(e) => {
                setPage(1);
                setPageSize(Number(e.target.value));
              }}
            >
              {[6, 10, 12].map((size) => (
                <option
                  key={size}
                  value={size}
                  className="bg-white text-black font-bold"
                >
                  {size} per page
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source Warehouse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target Warehouse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transacted By
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.sourceWarehouse.name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.targetWarehouse?.name ||
                    "not require for this transaction"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="font-bold">
                    {transaction.transactedBy?.firstName}{" "}
                    {transaction.transactedBy?.middleName}
                    {": "}
                  </span>
                  {transaction.transactedBy?.phoneNumber}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-2 py-4">
        <button
          className="px-2 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>
        {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => (
          <button
            key={i + 1}
            className={`px-2 py-1 rounded font-semibold ${
              page === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="px-2 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
          disabled={page === Math.ceil(total / pageSize) || total === 0}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      {/* Create Transaction Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            reset(); // Reset the form fields
          }}
          title="Create Transaction"
          size="lg"
        >
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700"
              >
                Transaction Type
              </label>
              <select
                id="type"
                {...register("type", {
                  required: "Transaction type is required",
                })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
              >
                <option value="">Select a Type</option>
                <option value="add">Add</option>
                <option value="remove">Remove</option>
                <option value="transfer">Transfer</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm">
                  {errors.type.message?.toString()}
                </p>
              )}
            </div>

            {(transactionType === "add" || transactionType === "remove") && (
              <div className="space-y-4">
                <label
                  htmlFor="warehouseId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Warehouse
                </label>
                <select
                  id="warehouseId"
                  {...register("warehouseId", {
                    required: "Warehouse is required",
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                  disabled={!!userWarehouseId}
                >
                  <option value="">Select a Warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
                {errors.warehouseId && (
                  <p className="text-red-500 text-sm">
                    {errors.warehouseId.message?.toString()}
                  </p>
                )}
              </div>
            )}

            {transactionType === "transfer" && (
              <>
                <div className="space-y-4">
                  <label
                    htmlFor="sourceWarehouseId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Source Warehouse
                  </label>
                  <select
                    id="sourceWarehouseId"
                    {...register("sourceWarehouseId", {
                      required: "Source Warehouse is required",
                    })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                    disabled={!!userWarehouseId}
                  >
                    <option value="">Select a Source Warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                  {errors.sourceWarehouseId && (
                    <p className="text-red-500 text-sm">
                      {errors.sourceWarehouseId.message?.toString()}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <label
                    htmlFor="targetWarehouseId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Target Warehouse
                  </label>
                  <select
                    id="targetWarehouseId"
                    {...register("targetWarehouseId", {
                      required: "Target Warehouse is required",
                    })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                  >
                    <option value="">Select a Target Warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                  {errors.targetWarehouseId && (
                    <p className="text-red-500 text-sm">
                      {errors.targetWarehouseId.message?.toString()}
                    </p>
                  )}
                </div>
              </>
            )}

            <Input
              label="Quantity"
              type="number"
              {...register("quantity", {
                required: "Quantity is required",
                min: { value: 1, message: "Quantity must be at least 1" },
              })}
              error={errors.quantity?.message?.toString()}
            />

            <div className="space-y-4">
              <label
                htmlFor="productId"
                className="block text-sm font-medium text-gray-700"
              >
                Product
              </label>
              <select
                id="productId"
                {...register("productId", { required: "Product is required" })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
              >
                <option value="">Select a Product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {errors.productId && (
                <p className="text-red-500 text-sm">
                  {errors.productId.message?.toString()}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  reset();
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
