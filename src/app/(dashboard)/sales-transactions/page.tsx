"use client";

import React, { useState, useEffect } from "react";
import type { SalesTransaction } from "@/types";
import { PlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Cookies from "js-cookie";
import { saleService } from "@/services/sale.service";
import { productService } from "@/services/product.service";
import jsPDF from "jspdf";
import withPermission from "@/hoc/withPermission";

const PAYMENT_METHODS = [
  { value: "telebirr", label: "Telebirr" },
  { value: "cbe", label: "CBE" },
  { value: "awash", label: "Awash" },
  { value: "e-birr", label: "E-Birr" },
  { value: "credit", label: "Credit" },
];

function SalesTransactionsPage() {
  const [transactions, setTransactions] = useState<SalesTransaction[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [formErrors, setFormErrors] = useState<Record<string, string> | null>(
    null
  );
  const [formItems, setFormItems] = useState([{ productId: "", quantity: 1 }]);
  const [form, setForm] = useState({ paymentMethod: "", creditorName: "" });

  // Parse cookies for roles and shopId as in stock-transactions
  const permissions = JSON.parse(Cookies.get("permission") || "[]");
  const userId = JSON.parse(Cookies.get("user") || "{}")?.id;
  const roles = JSON.parse(Cookies.get("roles") || "[]");
  const shop = JSON.parse(Cookies.get("user") || "null")?.shop;
  const shopId = shop?.id || Cookies.get("shopId");
  const isShopRole = roles.includes("shop");

  useEffect(() => {
    if (!isShopRole) return;
    fetchProducts();
    fetchTransactions();
  }, [isShopRole, shopId]);

  const fetchProducts = async () => {
    try {
      const res = await productService.getAll();
      setProducts(Array.isArray(res) ? res : []);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await saleService.getSalesTransactions(shopId);
      let filtered = Array.isArray(res) ? res : [];
      if (isShopRole && shopId) {
        filtered = filtered.filter((tx) => tx.shop?.id === shopId);
      }
      setTransactions(filtered);
    } catch (error) {
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (idx, field, value) => {
    setFormItems((prev) => {
      const items = [...prev];
      items[idx][field] = value;
      return items;
    });
  };

  const addItem = () =>
    setFormItems((prev) => [...prev, { productId: "", quantity: 1 }]);
  const removeItem = (idx) =>
    setFormItems((prev) => prev.filter((_, i) => i !== idx));

  const generatePDF = (transaction) => {
    const doc = new jsPDF();

    // Add a colorful title with a background
    doc.setFillColor(41, 128, 185); // Blue background
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 20, "F");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255); // White text
    doc.setFont("helvetica", "bold");
    doc.text(
      "Sales Transaction Receipt",
      doc.internal.pageSize.getWidth() / 2,
      15,
      {
        align: "center",
      }
    );

    // Reset text color for the content
    doc.setTextColor(0, 0, 0);

    // Add transaction details with a clean layout
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Transaction ID: ${transaction.id}`, 10, 30);
    doc.text(
      `Date: ${new Date(transaction.createdAt).toLocaleString()}`,
      10,
      40
    );
    doc.text(`Payment Method: ${transaction.paymentMethod}`, 10, 50);
    if (transaction.paymentMethod === "credit") {
      doc.text(`Creditor Name: ${transaction.creditorName || "-"}`, 10, 60);
    }

    // Add a table header for products with a background color
    doc.setFillColor(230, 230, 230); // Light gray background
    doc.rect(10, 70, 190, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("No", 10, 77);
    doc.text("Products", 22, 77);
    doc.text("Quantity", 80, 77);
    doc.text("Price", 120, 77);
    doc.text("Total", 160, 77);
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, 80, 200, 80);

    // Add product details in rows with aligned columns
    doc.setFont("helvetica", "normal");
    transaction.items.forEach((item, index) => {
      const product = products.find((p) => p.id === item.product.id);
      const yPosition = 85 + index * 10;
      doc.text(`${index + 1}`, 10, yPosition);
      doc.text(item.product.name, 22, yPosition);
      doc.text(`${item.quantity}`, 83, yPosition, { align: "right" });
      doc.text(`${product ? product.price : "N/A"}`, 130, yPosition, {
        align: "right",
      });
      doc.text(
        `${product ? item.quantity * product.price : "N/A"}`,
        165,
        yPosition,
        { align: "right" }
      );
    });

    // Add total price at the bottom with a highlighted background
    const totalPrice = calculateTotalPrice(transaction.items);
    const totalYPosition = 85 + transaction.items.length * 10 + 10;
    doc.setFillColor(241, 196, 15); // Yellow background
    doc.rect(10, totalYPosition - 5, 190, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Total Price:", 130, totalYPosition, { align: "right" });
    doc.text(`${totalPrice}`, 165, totalYPosition, { align: "right" });

    // Save the PDF
    doc.save(`transaction_${transaction.id}.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    const errors: Record<string, string> = {};
    if (!form.paymentMethod) errors.paymentMethod = "Payment method required";
    if (form.paymentMethod === "credit" && !form.creditorName)
      errors.creditorName = "Creditor name required";
    formItems.forEach((item, idx) => {
      if (!item.productId) errors[`product_${idx}`] = "Product required";
      if (!item.quantity || item.quantity < 1)
        errors[`quantity_${idx}`] = "Quantity must be at least 1";
    });
    setFormErrors(Object.keys(errors).length ? errors : null);
    if (Object.keys(errors).length) return;
    try {
      const createdTransaction = await saleService.createSalesTransaction({
        shopId,
        paymentMethod: form.paymentMethod as
          | "telebirr"
          | "cbe"
          | "awash"
          | "e-birr"
          | "credit",
        creditorName:
          form.paymentMethod === "credit" ? form.creditorName : undefined,
        items: formItems,
      });
      toast.success("Sales transaction created");
      setIsCreateModalOpen(false);
      setForm({ paymentMethod: "", creditorName: "" });
      setFormItems([{ productId: "", quantity: 1 }]);
      fetchTransactions();

      // Generate PDF for the created transaction
      generatePDF(createdTransaction);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to create transaction"
      );
    }
  };

  const calculateTotalPrice = (items) => {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.product.id);
      const price = product ? product.price : 0;
      return sum + item.quantity * price;
    }, 0);
  };

  const total = transactions.length;
  const paginated = transactions.slice((page - 1) * pageSize, page * pageSize);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Sales Transactions
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
            <PlusIcon className="h-5 w-5 mr-2" /> Add Sales Transaction
          </Button>
        </div>
      </div>
      {/* Transactions Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map((tx) => (
          <div key={tx.id} className="bg-white shadow rounded-lg p-3">
            <h2 className="text-sm font-semibold text-gray-800 mb-1">
              Transaction ID: {tx.id}
            </h2>
            <p className="text-xs text-gray-500 mb-1">
              {new Date(tx.createdAt).toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 mb-1">
              Payment: {tx.paymentMethod}
            </p>
            {tx.paymentMethod === "credit" && (
              <p className="text-xs text-gray-600 mb-2">
                Creditor: {tx.creditorName || "-"}
              </p>
            )}
            <div className="mt-2">
              <h3 className="text-xs font-medium text-gray-700 mb-1">
                Products:
              </h3>
              {tx.items.map((item, idx) => {
                const product = products.find((p) => p.id === item.product.id);
                return (
                  <div key={idx} className="border-b border-gray-100 pb-1 mb-1">
                    <p className="text-xs text-gray-800">{item.product.name}</p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity} | Price:{" "}
                      {product ? product.price : "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Total: {product ? item.quantity * product.price : "N/A"}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="font-semibold text-gray-700 text-sm">
                Total: {calculateTotalPrice(tx.items)}
              </span>
              <button
                onClick={() => generatePDF(tx)}
                className="px-4 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                Print PDF
              </button>
            </div>
          </div>
        ))}
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
            setForm({ paymentMethod: "", creditorName: "" });
            setFormItems([{ productId: "", quantity: 1 }]);
          }}
          title="Create Sales Transaction"
          size="lg"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <label
                htmlFor="paymentMethod"
                className="block text-sm font-medium text-gray-700"
              >
                Payment Method
              </label>
              <select
                id="paymentMethod"
                value={form.paymentMethod}
                onChange={(e) =>
                  handleFormChange("paymentMethod", e.target.value)
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-700 bg-gray-50 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out hover:bg-white"
                required
              >
                <option value="">Select Payment Method</option>
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.value} value={pm.value}>
                    {pm.label}
                  </option>
                ))}
              </select>
              {formErrors && formErrors.paymentMethod && (
                <p className="text-red-500 text-sm">
                  {formErrors.paymentMethod}
                </p>
              )}
            </div>
            {form.paymentMethod === "credit" && (
              <div className="space-y-4">
                <label
                  htmlFor="creditorName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Creditor Name
                </label>
                <input
                  type="text"
                  id="creditorName"
                  value={form.creditorName}
                  onChange={(e) =>
                    handleFormChange("creditorName", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-700 bg-gray-50 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out hover:bg-white"
                  required={form.paymentMethod === "credit"}
                />
                {formErrors && formErrors.creditorName && (
                  <p className="text-red-500 text-sm">
                    {formErrors.creditorName}
                  </p>
                )}
              </div>
            )}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Products
              </label>
              {formItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 mb-4 items-center">
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-700 bg-gray-50 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out hover:bg-white"
                    value={item.productId}
                    onChange={(e) =>
                      handleItemChange(idx, "productId", e.target.value)
                    }
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    className="w-24 px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-700 bg-gray-50 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out hover:bg-white"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(idx, "quantity", Number(e.target.value))
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-red-500 hover:text-red-700 transition duration-200 ease-in-out"
                  >
                    Remove
                  </button>
                  {formErrors && formErrors[`product_${idx}`] && (
                    <p className="text-red-500 text-sm">
                      {formErrors[`product_${idx}`]}
                    </p>
                  )}
                  {formErrors && formErrors[`quantity_${idx}`] && (
                    <p className="text-red-500 text-sm">
                      {formErrors[`quantity_${idx}`]}
                    </p>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="text-blue-500 hover:text-blue-700 transition duration-200 ease-in-out"
              >
                Add Product
              </button>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setForm({ paymentMethod: "", creditorName: "" });
                  setFormItems([{ productId: "", quantity: 1 }]);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

export default withPermission(SalesTransactionsPage, "sales.read");
