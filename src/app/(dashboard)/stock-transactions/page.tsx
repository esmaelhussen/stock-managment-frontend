"use client";

import React, { useState, useEffect, use } from "react";
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
  Shop,
} from "@/types";
import Cookies from "js-cookie";
import withPermission from "@/hoc/withPermission";
import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import { shopService } from "@/services/shop.service";

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
  const [shops, setShops] = useState<Shop[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string> | null>(
    null
  );
  const [userWarehouseId, setUserWarehouseId] = useState<string | null>(null);
  const [userShopId, setUserShopId] = useState<string | null>(null);
  const [sourceWarehouseShops, setSourceWarehouseShops] = useState<Shop[]>([]);

  const total = allTransactions.length;
  const permissions = JSON.parse(Cookies.get("permission") || "[]");
  const userId = JSON.parse(Cookies.get("user") || "{}").id;
  const roles = JSON.parse(Cookies.get("roles") || "[]");
  const warehouse = JSON.parse(Cookies.get("user") || "null").warehouse;
  const shop = JSON.parse(Cookies.get("user") || "null").shop;
  console.log("roles", roles.includes("warehouse"));

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  const isWarehouseRole = roles.includes("warehouse");
  const isShopRole = roles.includes("shop");

  // Watch the sourceId reactively
  const sourceId = watch("sourceId");

  useEffect(() => {
    const fetchShopsForSource = async () => {
      try {
        let warehouseId = shop.warehouseId;

        // Case 1: warehouse role or manual source warehouse selection
        if (sourceId?.startsWith("warehouse:")) {
          warehouseId = sourceId.split(":")[1];
        }
        // Case 2: shop role (source is user's shop)
        else if (isShopRole && shop?.warehouse?.id) {
          warehouseId = shop.warehouseId;
        }

        // if (warehouseId) {
        //   const shopsForWarehouse =
        //     await shopService.getShopsByWarehouse(warehouseId);

        // For shop-role: exclude the source shop from target list
        //   if (isShopRole && userShopId) {
        //     setSourceWarehouseShops(
        //       shopsForWarehouse.filter((s) => s.id !== userShopId)
        //     );
        //   } else {
        //     setSourceWarehouseShops(shopsForWarehouse);
        //   }
        // } else {
        //   setSourceWarehouseShops([]);
        // }
      } catch (error) {
        console.error("Failed to fetch shops for warehouse", error);
        setSourceWarehouseShops([]);
      }
    };

    fetchShopsForSource();
  }, [sourceId, isShopRole, shop?.warehouse?.id, userShopId]);

  useEffect(() => {
    fetchTransactions();
    const warehouseId = authService.getWarehouseId();
    const shopId = authService.getShopId();
    setUserWarehouseId(warehouseId);
    setUserShopId(shopId);
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

    const fetchShops = async () => {
      try {
        const fetchedShops = await shopService.getAll();
        setShops(fetchedShops);
      } catch (error) {
        console.log("failed to fetch shops", error);
      }
    };

    fetchProducts();
    fetchWarehouses();
    fetchShops();
  }, []);

  // Autofill source based on role and fetch shops if needed
  useEffect(() => {
    if (!isCreateModalOpen) return;

    // Warehouse user
    if (isWarehouseRole && userWarehouseId) {
      setValue("sourceId", `warehouse:${userWarehouseId}`);
      // Fetch shops for this warehouse
      // shopService
      //   .getShopsByWarehouse(userWarehouseId)
      //   .then((shops) => setSourceWarehouseShops(shops))
      //   .catch(() => setSourceWarehouseShops([]));
    }
    // Shop user
    else if (isShopRole && userShopId) {
      setValue("sourceId", `shop:${userShopId}`);
      // Fetch shops in user's warehouse (if needed)
      // if (shop?.warehouse?.id) {
      //   shopService
      //     .getShopsByWarehouse(shop.warehouse.id)
      //     .then((shops) => setSourceWarehouseShops(shops))
      //     .catch(() => setSourceWarehouseShops([]));
      // }
    }
    // Neither warehouse nor shop
    else {
      setValue("sourceId", "");
      setSourceWarehouseShops([]);
    }
  }, [
    isCreateModalOpen,
    isWarehouseRole,
    isShopRole,
    userWarehouseId,
    userShopId,
    setValue,
  ]);

  const fetchTransactions = async () => {
    try {
      const data = await stockTransactionService.getAllTransactions();

      // const isWarehouseRole = roles.includes("warehouse");
      let filteredData;

      if (isWarehouseRole) {
        const userWarehouseId = warehouse?.id?.toLowerCase();
        filteredData = data.filter((transaction) => {
          const sourceId = transaction.sourceWarehouse?.id?.toLowerCase();
          const targetId = transaction.targetWarehouse?.id?.toLowerCase();
          return sourceId === userWarehouseId || targetId === userWarehouseId;
        });
      } else if (isShopRole) {
        const userShopId = shop?.id?.toLowerCase();
        filteredData = data.filter((transaction) => {
          const sourceId = transaction.sourceShop?.id?.toLowerCase();
          const targetId = transaction.targetShop?.id?.toLowerCase();
          return sourceId === userShopId || targetId === userShopId;
        });
      } else {
        filteredData = data;
      }

      // const filteredData = isWarehouseRole
      //   ? data.filter((transaction) => {
      //       const sourceId = transaction.sourceWarehouse?.id?.toLowerCase();
      //       const targetId = transaction.targetWarehouse?.id?.toLowerCase();
      //       const userWarehouseId = warehouse?.id?.toLowerCase();
      //       return sourceId === userWarehouseId || targetId === userWarehouseId;
      //     })
      //   : data;

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
      if (!data.sourceWarehouseId && !data.sourceShopId) {
        errors.source = "Source Warehouse or Source Shop is required";
      }
    }

    if (data.type === "transfer") {
      if (!data.sourceWarehouseId && !data.sourceShopId) {
        errors.source = "Source Warehouse or Source Shop is required";
      }
      if (!data.targetWarehouseId && !data.targetShopId) {
        errors.target = "Target Warehouse or Target Shop is required";
      }
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
      quantity: Number(data.quantity), // Ensure quantity is sent as a number
      productId: data.productId,
      type: data.type,
      transactedById: userId,
    };

    // ------------------
    // Source parsing
    // ------------------
    if (data.sourceId) {
      const [sourceType, sourceValue] = data.sourceId.split(":");
      if (sourceType === "warehouse") {
        transformedData.sourceWarehouseId = sourceValue;
      } else if (sourceType === "shop") {
        transformedData.sourceShopId = sourceValue;
      }
    }

    // ------------------
    // Target parsing (transfer only)
    // ------------------
    if (data.type === "transfer" && data.targetId) {
      const [targetType, targetValue] = data.targetId.split(":");
      if (targetType === "warehouse") {
        transformedData.targetWarehouseId = targetValue;
      } else if (targetType === "shop") {
        transformedData.targetShopId = targetValue;
      }
    }

    // ------------------
    // Clean up helper fields
    // ------------------
    delete (transformedData as any).sourceId;
    delete (transformedData as any).targetId;

    console.log("Transformed Data:", transformedData);
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
                Source Stock Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target Stock Name
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
                  {isShopRole
                    ? `${
                        transaction.sourceShop?.name
                          ? `SHOP: ${transaction.sourceShop.name}`
                          : transaction.sourceWarehouse?.name
                            ? `WAREHOUSE: ${transaction.sourceWarehouse.name}`
                            : "N/A"
                      }`
                    : isWarehouseRole
                      ? transaction.sourceWarehouse?.name
                        ? `WAREHOUSE: ${transaction.sourceWarehouse.name}`
                        : transaction.sourceShop?.name
                          ? `SHOP: ${transaction.sourceShop.name}`
                          : "N/A"
                      : transaction.sourceWarehouse?.name
                        ? `WareHouse: ${transaction.sourceWarehouse.name}`
                        : transaction.sourceShop?.name
                          ? `SHOP: ${transaction.sourceShop.name}`
                          : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isShopRole
                    ? transaction.targetShop?.name
                      ? `SHOP ${transaction.targetShop.name}`
                      : "not required for this transaction"
                    : isWarehouseRole
                      ? transaction.targetWarehouse?.name
                        ? `Warehouse ${transaction.targetWarehouse.name}`
                        : "not required for this transaction"
                      : transaction.targetWarehouse?.name
                        ? `Warehouse ${transaction.targetWarehouse.name}`
                        : transaction.targetShop?.name
                          ? `SHOP ${transaction.targetShop.name}`
                          : "not required for this transaction"}
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
                  htmlFor="sourceId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Source
                </label>
                <select
                  id="sourceId"
                  {...register("sourceId", {
                    required: "Source is required",
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                  disabled={!!userWarehouseId || !!userShopId} // auto-filled if role
                >
                  <option value="">Select a Source</option>

                  {/* Warehouses */}
                  {(!userWarehouseId && !userShopId) || !isShopRole
                    ? warehouses.map((warehouse) => (
                        <option
                          key={warehouse.id}
                          value={`warehouse:${warehouse.id}`}
                        >
                          Warehouse: {warehouse.name}
                        </option>
                      ))
                    : null}

                  {/* Shops */}
                  {(!userWarehouseId && !userShopId) || !isWarehouseRole
                    ? shops.map((shop) => (
                        <option key={shop.id} value={`shop:${shop.id}`}>
                          Shop: {shop.name}
                        </option>
                      ))
                    : null}
                </select>
                {errors.sourceId && (
                  <p className="text-red-500 text-sm">
                    {errors.sourceId.message?.toString()}
                  </p>
                )}
              </div>
            )}

            {transactionType === "transfer" && (
              <>
                {/* Source Select */}
                <div className="space-y-4">
                  <label
                    htmlFor="sourceId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Source
                  </label>
                  <select
                    id="sourceId"
                    {...register("sourceId", {
                      required: "Source is required",
                    })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                    disabled={isWarehouseRole || isShopRole}
                  >
                    <option value="">Select a Source</option>

                    {/* Show warehouses if role is neither or not a shop */}
                    {(!isWarehouseRole && !isShopRole) || !isShopRole
                      ? warehouses.map((w) => (
                          <option key={w.id} value={`warehouse:${w.id}`}>
                            Warehouse: {w.name}
                          </option>
                        ))
                      : null}

                    {/* Show shops if role is neither or not a warehouse */}
                    {(!isWarehouseRole && !isShopRole) || !isWarehouseRole
                      ? shops.map((s) => (
                          <option key={s.id} value={`shop:${s.id}`}>
                            Shop: {s.name}
                          </option>
                        ))
                      : null}
                  </select>
                  {errors.sourceId && (
                    <p className="text-red-500 text-sm">
                      {errors.sourceId.message?.toString()}
                    </p>
                  )}
                </div>

                {/* Target Select */}
                <div className="space-y-4">
                  <label
                    htmlFor="targetId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Target (Warehouse / Shop)
                  </label>
                  <select
                    id="targetId"
                    {...register("targetId", {
                      required: "Target is required",
                    })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                  >
                    <option value="">Select Target</option>
                    {/* Role: neither warehouse nor shop */}
                    {/* {!isWarehouseRole && !isShopRole && ( */}
                    <>
                      {warehouses
                        .filter(
                          (w) =>
                            w.id !== (watch("sourceId")?.split(":")[1] || "")
                        )
                        .map((w) => (
                          <option key={w.id} value={`warehouse:${w.id}`}>
                            Warehouse: {w.name}
                          </option>
                        ))}
                      {shops
                        .filter(
                          (s) =>
                            s.id !== (watch("sourceId")?.split(":")[1] || "")
                        )
                        .map((s) => (
                          <option key={s.id} value={`shop:${s.id}`}>
                            Shop: {s.name}
                          </option>
                        ))}
                    </>

                    {/* Warehouse role
                    {isWarehouseRole && userWarehouseId && (
                      <>
                        {warehouses
                          .filter((w) => w.id !== userWarehouseId)
                          .map((w) => (
                            <option key={w.id} value={`warehouse:${w.id}`}>
                              Warehouse: {w.name}
                            </option>
                          ))}
                        {sourceWarehouseShops.map((s) => (
                          <option key={s.id} value={`shop:${s.id}`}>
                            Shop: {s.name}
                          </option>
                        ))}
                      </>
                    )} */}
                    {/* Shop role */}
                    {/* Shop role - Target options: shops belonging to user's warehouse */}
                    {/* Shop role - target options */}
                    {/* {isShopRole && userShopId && (
                      <>
                        {sourceWarehouseShops.map((s) => (
                          <option key={s.id} value={`shop:${s.id}`}>
                            Shop: {s.name}
                          </option>
                        ))}
                      </>
                    )} */}
                  </select>
                  {errors.targetId && (
                    <p className="text-red-500 text-sm">
                      {errors.targetId.message?.toString()}
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
