"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { stockTransactionService } from "@/services/stockTransaction.service";
import { Stock } from "@/types";
import Cookies from "js-cookie";
import withPermission from "@/hoc/withPermission";

const StockPage = () => {
  const [allStock, setAllStock] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [search, setSearch] = useState({
    product: "",
    quantity: "",
    stockName: "",
  });
  const permissions = JSON.parse(Cookies.get("permission") || "[]");
  const roles = JSON.parse(Cookies.get("roles") || "[]");
  const warehouse = JSON.parse(Cookies.get("user") || "null").warehouse;
  const shop = JSON.parse(Cookies.get("user") || "null").shop;

  useEffect(() => {
    fetchStock();
  }, []);

  const isWarehouseRole = roles.includes("warehouse");
  const isShopRole = roles.includes("shop");

  const fetchStock = async () => {
    try {
      const data = await stockTransactionService.getAllStock();

      // Check if the user has "warehouse" role

      let filteredData;

      if (isWarehouseRole) {
        filteredData = data.filter(
          (stock) =>
            stock.warehouse?.id?.toLowerCase() === warehouse?.id?.toLowerCase(),
        );
      } else if (isShopRole) {
        filteredData = data.filter(
          (stock) => stock.shop?.id?.toLowerCase() === shop?.id?.toLowerCase(),
        );
      } else {
        filteredData = data;
      }

      // If user has warehouse role, filter stock by warehouse name
      // const filteredData = isWarehouseRole
      //   ? data.filter(
      //       (stock) =>
      //         stock.warehouse?.id?.toLowerCase() ===
      //         warehouse?.id?.toLowerCase()
      //     )
      //   : data;

      setAllStock(filteredData);
    } catch (error) {
      toast.error("Failed to fetch stock");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (field, value) => {
    setSearch((prev) => ({ ...prev, [field]: value }));
  };

  const filteredStock = allStock.filter((stock) => {
    const matchesProduct = stock.product.name
      .toLowerCase()
      .includes(search.product.toLowerCase());
    const matchesQuantity = search.quantity
      ? stock.quantity === parseInt(search.quantity, 10)
      : true;
    const matchesStockName =
      stock.shop?.name
        ?.toLowerCase()
        .includes(search.stockName.toLowerCase()) ||
      stock.warehouse?.name
        ?.toLowerCase()
        .includes(search.stockName.toLowerCase());

    return matchesProduct && matchesQuantity && matchesStockName;
  });

  const total = filteredStock.length;

  const paginatedStock = filteredStock.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPage(1);
    setPageSize(newPageSize);
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
            Stock
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="">
            <select
              className="appearance-none px-4 py-2 pr-10 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded-lg shadow-md">
        <div className="flex flex-col">
          <label
            htmlFor="productFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Product
          </label>
          <input
            type="text"
            placeholder="Search by product"
            className="w-48 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
            value={search.product}
            onChange={(e) => handleSearchChange("product", e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="quantityFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Quantity
          </label>
          <input
            type="text"
            placeholder="Search by quantity"
            className="w-48 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
            value={search.quantity}
            onChange={(e) => handleSearchChange("quantity", e.target.value)}
          />
        </div>
        {!isShopRole && !isWarehouseRole && (
          <div className="flex flex-col">
            <label
              htmlFor="stockNameFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Stock Name
            </label>
            <input
              type="text"
              placeholder="Search by stock name"
              className="w-48 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
              value={search.stockName}
              onChange={(e) => handleSearchChange("stockName", e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total product sold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedStock.map((stock) => (
              <tr key={stock.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stock.product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stock.product.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stock.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stock.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isShopRole
                    ? stock.shop?.name
                      ? `SHOP: ${stock.shop.name}`
                      : "N/A"
                    : isWarehouseRole
                      ? stock.warehouse?.name
                        ? `WareHouse: ${stock.warehouse.name}`
                        : "N/A"
                      : stock.warehouse?.name
                        ? `WareHouse: ${stock.warehouse.name}`
                        : stock.shop?.name
                          ? `SHOP: ${stock.shop.name}`
                          : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(stock.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-2 py-4">
        <button
          className="px-2 py-1 rounded bg-gray-200 text-gray-700 font-semibold "
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
          className="px-2 py-1 rounded bg-gray-200 text-gray-700 font-semibold "
          disabled={page === Math.ceil(total / pageSize) || total === 0}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default withPermission(StockPage, "stock.read");
