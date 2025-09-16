"use client";

import React, { useState, useEffect, useRef } from "react";
import type { SalesTransaction, Customer } from "@/types";
import { PlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Cookies from "js-cookie";
import { saleService } from "@/services/sale.service";
import { productService } from "@/services/product.service";
import jsPDF from "jspdf";
import withPermission from "@/hoc/withPermission";
import { warehouseService } from "@/services/warehouse.service";
import { shopService } from "@/services/shop.service";
import { customerService } from "@/services/customer.service";
import { number } from "yup";

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
  const [shops, setShops] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [formErrors, setFormErrors] = useState<Record<string, string> | null>(
    null,
  );
  const [formItems, setFormItems] = useState([
    {
      productId: "",
      quantity: 1,
      discountType: "none" as "fixed" | "percent" | "none",
      discountAmount: 0,
      discountPercent: 0,
    },
  ]);
  const [form, setForm] = useState({
    paymentMethod: "",
    creditorName: "",
    selectedShopId: "",
    selectedWarehouseId: "",
    discountType: "none" as "fixed" | "percent" | "none",
    discountAmount: 0,
    discountPercent: 0,
  });
  const [stockType, setStockType] = useState("");
  const [filters, setFilters] = useState({
    date: "",
    paymentMethod: "",
    product: "",
    status: "",
  });
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    address: "",
    phoneNumber: "",
  });
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Parse cookies for roles and shopId as in stock-transactions
  const permissions = JSON.parse(Cookies.get("permission") || "[]");
  const userId = JSON.parse(Cookies.get("user") || "{}").id; // Extract userId from cookies
  const roles = JSON.parse(Cookies.get("roles") || "[]");
  const shop = JSON.parse(Cookies.get("user") || "null")?.shop;
  const shopId = shop?.id || Cookies.get("shopId");
  const warehouseId = Cookies.get("warehouseId");
  const isShopRole = roles.includes("shop");
  const isWarehouseRole = roles.includes("warehouse");

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await productService.getAll();
      setProducts(Array.isArray(res) ? res : []);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
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

    const fetchCustomers = async () => {
      try {
        const data = await customerService.getAll();
        setCustomers(data);
      } catch (error) {
        toast.error("Failed to fetch customers");
      }
    };

    fetchWarehouses();
    fetchShops();
    fetchCustomers();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let res;
      if (isShopRole) {
        res = await saleService.getSalesTransactions(shopId, "shop");
      } else if (roles.includes("warehouse")) {
        res = await saleService.getSalesTransactions(warehouseId, "warehouse");
      } else {
        res = await saleService.getSalesTransactions(undefined, undefined);
      }

      const filtered = Array.isArray(res) ? res : [];
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
    setFormItems((prev) => [
      ...prev,
      {
        productId: "",
        quantity: 1,
        discountType: "none" as "fixed" | "percent" | "none",
        discountAmount: 0,
        discountPercent: 0,
      },
    ]);
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
      },
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
      40,
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
        { align: "right" },
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

    // Add transaction status at the bottom with a highlighted background
    const statusYPosition = totalYPosition + 15;
    doc.setFillColor(52, 152, 219); // Blue background
    doc.rect(10, statusYPosition - 5, 190, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255); // White text
    doc.text("Status:", 130, statusYPosition, { align: "right" });
    doc.text(transaction.status.toUpperCase(), 165, statusYPosition, {
      align: "right",
    });

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

    let selectedShopId = shopId;
    let selectedWarehouseId = warehouseId;

    if (!isShopRole && !roles.includes("warehouse")) {
      // Logic to select shop or warehouse for other roles
      selectedShopId = form.selectedShopId;
      selectedWarehouseId = form.selectedWarehouseId;
    }

    try {
      const createdTransaction = await saleService.createSalesTransaction({
        shopId: isShopRole ? shopId : selectedShopId,
        warehouseId: roles.includes("warehouse")
          ? warehouseId
          : selectedWarehouseId,
        paymentMethod: form.paymentMethod as
          | "telebirr"
          | "cbe"
          | "awash"
          | "e-birr"
          | "credit",
        creditorName:
          form.paymentMethod === "credit" ? form.creditorName : undefined,
        items: formItems.map((item) => ({
          ...item,
          discountType: item.discountType || "none",
          discountAmount: item.discountAmount || 0,
          discountPercent: item.discountPercent || 0,
        })),
        discountType: form.discountType || "none",
        discountAmount: form.discountAmount || 0,
        discountPercent: form.discountPercent || 0,
        transactedById: userId, // Include userId in the payload
        customerType: selectedCustomerId ? "Regular" : "Walk-In",
        customerId: selectedCustomerId || undefined,
      });
      toast.success("Sales transaction created");
      setIsCreateModalOpen(false);
      setForm({
        paymentMethod: "",
        creditorName: "",
        selectedShopId: "",
        selectedWarehouseId: "",
        discountType: "none",
        discountAmount: 0,
        discountPercent: 0,
      });
      setFormItems([
        {
          productId: "",
          quantity: 1,
          discountType: "none",
          discountAmount: 0,
          discountPercent: 0,
        },
      ]);
      fetchTransactions();

      // Generate PDF for the created transaction
      generatePDF(createdTransaction);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to create transaction",
      );
    }
  };

  const handleCreateCustomer = async () => {
    try {
      const createdCustomer = await customerService.create(newCustomer);
      setCustomers((prev) => [...prev, createdCustomer]);
      setSelectedCustomerId(createdCustomer.id);
      setIsCustomerModalOpen(false);
      toast.success("Customer created successfully");
    } catch (error) {
      toast.error("Failed to create customer");
    }
  };

  const calculateTotalPrice = (items) => {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.product.id);
      const price = product ? product.price : 0;
      const itemTotal = item.quantity * price;

      // Apply item discount if exists
      let discountAmount = 0;
      if (item.discountType === "percent" && item.discountPercent) {
        discountAmount = (itemTotal * item.discountPercent) / 100;
      } else if (item.discountType === "fixed" && item.discountAmount) {
        discountAmount = Math.min(item.discountAmount, itemTotal);
      }

      return sum + (itemTotal - discountAmount);
    }, 0);
  };

  const total = transactions.length;
  const filteredTransactions = transactions.filter((tx) => {
    const matchesDate = filters.date
      ? new Date(tx.createdAt).toISOString().split("T")[0] === filters.date
      : true;
    const matchesPaymentMethod = filters.paymentMethod
      ? tx.paymentMethod === filters.paymentMethod
      : true;
    const matchesProduct = filters.product
      ? tx.items.some((item) =>
          item.product.name
            .toLowerCase()
            .includes(filters.product.toLowerCase()),
        )
      : true;
    const matchesStatus = filters.status ? tx.status === filters.status : true;
    return (
      matchesDate && matchesPaymentMethod && matchesProduct && matchesStatus
    );
  });
  const paginated = filteredTransactions.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  console.log("Paginated Transactions:", paginated); // Debugging log

  const updateTransactionStatus = async (transactionId, newStatus) => {
    try {
      await saleService.updateTransactionStatus(transactionId, newStatus); // Ensure backend supports this
      toast.success("Transaction status updated");
      fetchTransactions();
    } catch (error) {
      toast.error("Failed to update transaction status");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );

  // Filter products based on the search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Sales Transactions
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="">
            <select
              className="appearance-none px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100 font-bold bg-white dark:bg-gray-800 shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
              value={pageSize}
              onChange={(e) => {
                setPage(1);
                setPageSize(Number(e.target.value));
              }}
            >
              {[8, 7, 10].map((size) => (
                <option
                  key={size}
                  value={size}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold"
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
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {/* Date Filter */}
        <div className="flex flex-col">
          <label
            htmlFor="dateFilter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Date
          </label>
          <input
            type="date"
            id="dateFilter"
            className="w-48 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, date: e.target.value }))
            }
          />
        </div>

        {/* Payment Method Filter */}
        <div className="flex flex-col">
          <label
            htmlFor="paymentMethodFilter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Payment Method
          </label>
          <select
            id="paymentMethodFilter"
            className="w-48 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, paymentMethod: e.target.value }))
            }
          >
            <option value="">All</option>
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm.value} value={pm.value}>
                {pm.label}
              </option>
            ))}
          </select>
        </div>

        {/* Product Filter */}
        <div className="flex flex-col">
          <label
            htmlFor="productFilter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Product
          </label>
          <input
            type="text"
            id="productFilter"
            placeholder="Search product"
            className="w-64 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out hover:bg-gray-100 dark:text-gray-300  dark:bg-gray-800"
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, product: e.target.value }))
            }
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-col">
          <label
            htmlFor="statusFilter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Status
          </label>
          <select
            id="statusFilter"
            className="w-48 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out hover:bg-gray-100 dark:text-gray-300  dark:bg-gray-800"
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="">All</option>
            <option value="payed">Payed</option>
            <option value="unpayed">Unpayed</option>
          </select>
        </div>
      </div>

      {/* Enhanced Transactions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded-lg">
          <thead className=" top-0 bg-gray-100 dark:bg-gray-900 border-b dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Payment Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Customer Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Subtotal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Discount type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Final Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Creditor Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Transacted Stock Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Transacted By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginated.map((tx, index) => (
              <tr
                key={tx.id}
                className={`${
                  index % 2 === 0
                    ? "bg-gray-50 dark:bg-gray-800"
                    : "bg-white dark:bg-gray-900"
                } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
              >
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  {tx.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  {new Date(tx.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  {tx.paymentMethod}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  {tx.customer ? tx.customer?.name : "Walk-in Customer"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  {tx.items.map((item, idx) => {
                    const product = products.find(
                      (p) => p.id === item.product.id,
                    );
                    return (
                      <div key={idx} className="mb-2">
                        <p>{item.product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Qty: {item.quantity}
                          <br /> Price: {product ? product.price : "N/A"}
                          <br />
                          Dis.Type:{item.discountType}
                          <br />
                          Dis.Amount:{item.discountAmount}
                          <br />
                          {item.discountType === "percent" &&
                            `Dis.Perc.: ${item.discountPercent}%`}
                        </p>
                      </div>
                    );
                  })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  {tx.totalPrice || calculateTotalPrice(tx.items)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  {tx.discountType}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  {(() => {
                    const discount = Number(tx.discountAmount) || 0;
                    const discountPercent = Number(tx.discountPercent) || 0;
                    if (tx.discountType === "percent" && discountPercent > 0) {
                      return `${discountPercent}%`;
                    } else if (tx.discountType === "fixed" && discount > 0) {
                      return Number(discount).toFixed(2);
                    }
                    return "-";
                  })()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 font-semibold">
                  {tx.finalPrice || calculateTotalPrice(tx.items)}
                </td>

                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  {tx.creditorName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  {tx.status === "unpayed" && tx.paymentMethod === "credit" ? (
                    <button
                      onClick={() => {
                        setSelectedTransactionId(tx.id);
                        setIsConfirmModalOpen(true);
                      }}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs rounded focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                    >
                      Mark as Payed
                    </button>
                  ) : (
                    tx.status
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  <td>
                    {tx.transactedBy?.shop?.name
                      ? `Shop: ${tx.transactedBy.shop.name}`
                      : tx.transactedBy?.warehouse?.name
                        ? `Warehouse: ${tx.transactedBy.warehouse.name}`
                        : "N/A"}
                  </td>
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  {tx.transactedBy?.firstName || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  <button
                    onClick={() => generatePDF(tx)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    Print PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-end items-center gap-2 py-4">
        <button
          className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold "
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
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold "
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
            setForm({
              paymentMethod: "",
              creditorName: "",
              selectedShopId: "",
              selectedWarehouseId: "",
              discountPercent: 0,
              discountAmount: 0,
              discountType: "none",
            });
            setFormItems([
              {
                productId: "",
                quantity: 1,
                discountType: "none",
                discountAmount: 0,
                discountPercent: 0,
              },
            ]);
          }}
          title="Create Sales Transaction"
          size="xl" // Increased the width of the modal
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-700 bg-gray-50 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-700 bg-gray-50 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
                  required={form.paymentMethod === "credit"}
                />
                {formErrors && formErrors.creditorName && (
                  <p className="text-red-500 text-sm">
                    {formErrors.creditorName}
                  </p>
                )}
              </div>
            )}
            {!isShopRole && !roles.includes("warehouse") && (
              <>
                <div className="flex items-center justify-between ">
                  <div>
                    <label
                      htmlFor="targetId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Transacted Stock
                    </label>
                  </div>
                  <div>
                    <select
                      value={stockType}
                      onChange={(e) => setStockType(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out "
                    >
                      <option value="">Select Stock Type</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="shop">Shop</option>
                      <option value="All">All</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label
                    htmlFor="selectedId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Select Stock
                  </label>
                  <select
                    id="selectedId"
                    value={
                      stockType === "shop"
                        ? form.selectedShopId
                        : form.selectedWarehouseId
                    }
                    onChange={(e) => {
                      if (stockType === "shop") {
                        handleFormChange("selectedShopId", e.target.value);
                        handleFormChange("selectedWarehouseId", ""); // Clear warehouse ID
                      } else if (stockType === "warehouse") {
                        handleFormChange("selectedWarehouseId", e.target.value);
                        handleFormChange("selectedShopId", ""); // Clear shop ID
                      } else if (stockType === "All") {
                        const selectedId = e.target.value;
                        const isShop = shops.some(
                          (shop) => shop.id === selectedId,
                        );
                        const isWarehouse = warehouses.some(
                          (warehouse) => warehouse.id === selectedId,
                        );

                        if (isShop) {
                          handleFormChange("selectedShopId", selectedId);
                          handleFormChange("selectedWarehouseId", ""); // Clear warehouse ID
                        } else if (isWarehouse) {
                          handleFormChange("selectedWarehouseId", selectedId);
                          handleFormChange("selectedShopId", ""); // Clear shop ID
                        }
                      }
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-700 bg-gray-50 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
                  >
                    <option value="">Select Stock</option>
                    {stockType === "shop" &&
                      shops.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name}
                        </option>
                      ))}
                    {stockType === "warehouse" &&
                      warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    {stockType === "All" && (
                      <>
                        {shops.map((shop) => (
                          <option key={shop.id} value={shop.id}>
                            {shop.name}
                          </option>
                        ))}

                        {warehouses.map((warehouse) => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </>
            )}
            {/* Customer Selection and Creation */}
            <div className="space-y-4">
              <label
                htmlFor="customer"
                className="block text-sm font-medium text-gray-700"
              >
                Customer
              </label>
              <div className="flex gap-2">
                <select
                  id="customer"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-700 bg-gray-50 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
                >
                  <option value="">
                    Select a customer (If not select saved as walk-in customer)
                  </option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                >
                  Add Customer
                </Button>
              </div>
            </div>

            {/* Replace the product search input with a select dropdown */}

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Search and Select Product
              </label>
              <div className="relative" ref={dropdownRef}>
                <input
                  type="text"
                  id="productSearchSelect"
                  placeholder="Search or Select Product"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-gray-50 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  onFocus={() => setShowProductDropdown(true)}
                />
                {showProductDropdown && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-60 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex justify-between items-center p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          const existingItem = formItems.find(
                            (item) => item.productId === product.id,
                          );
                          if (!existingItem) {
                            setFormItems((prev) => [
                              ...prev,
                              {
                                productId: product.id,
                                quantity: 1,
                                discountType: "none",
                                discountAmount: 0,
                                discountPercent: 0,
                              },
                            ]);
                          }
                          setProductSearch(product.name);
                          setShowProductDropdown(false);
                        }}
                      >
                        <span className="text-sm text-gray-500">
                          {product.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {product.unit.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {product.price}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Products
              </label>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow rounded-lg">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Final Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formItems.map((item, idx) => {
                      const product = products.find(
                        (p) => p.id === item.productId,
                      );
                      const price = product ? product.price : 0;
                      const unit = product ? product.unit.name : "N/A"; // Autofill unit from product
                      const total = item.quantity * price;

                      // Calculate discount for this item
                      let itemDiscountAmount = 0;
                      if (
                        item.discountType === "percent" &&
                        item.discountPercent
                      ) {
                        itemDiscountAmount =
                          (total * item.discountPercent) / 100;
                      } else if (
                        item.discountType === "fixed" &&
                        item.discountAmount
                      ) {
                        itemDiscountAmount = Math.min(
                          item.discountAmount,
                          total,
                        );
                      }
                      const finalPrice = total - itemDiscountAmount;

                      return (
                        <tr key={idx}>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                            <input
                              type="text"
                              placeholder="Search or select product"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-gray-50 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out hover:bg-white"
                              list={`product-list-${idx}`}
                              value={
                                products.find((p) => p.id === item.productId)
                                  ?.name || item.productId
                              } // Ensure the input reflects the product name or typed value
                              onChange={(e) => {
                                const typedValue = e.target.value;
                                const selectedProduct = products.find(
                                  (p) => p.name === typedValue,
                                );
                                handleItemChange(
                                  idx,
                                  "productId",
                                  selectedProduct
                                    ? selectedProduct.id
                                    : typedValue,
                                ); // Update productId or keep the typed value
                              }}
                            />
                            <datalist id={`product-list-${idx}`}>
                              {products.map((p) => (
                                <option key={p.id} value={p.name} />
                              ))}
                            </datalist>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                            <input
                              type="number"
                              min={1}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-gray-50 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out hover:bg-white"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  idx,
                                  "quantity",
                                  Number(e.target.value),
                                )
                              }
                              required
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                            {price}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                            {unit}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                            <div className="flex flex-col gap-1">
                              <select
                                className="px-2 py-1 rounded border border-gray-300 text-xs"
                                value={item.discountType}
                                onChange={(e) =>
                                  handleItemChange(
                                    idx,
                                    "discountType",
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="none">None</option>
                                <option value="fixed">Fixed</option>
                                <option value="percent">Percent</option>
                              </select>
                              {item.discountType === "fixed" && (
                                <input
                                  type="number"
                                  min={0}
                                  placeholder="Amount"
                                  className="px-2 py-1 rounded border border-gray-300 text-xs"
                                  value={item.discountAmount}
                                  onChange={(e) =>
                                    handleItemChange(
                                      idx,
                                      "discountAmount",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              )}
                              {item.discountType === "percent" && (
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  placeholder="%"
                                  className="px-2 py-1 rounded border border-gray-300 text-xs"
                                  value={item.discountPercent}
                                  onChange={(e) =>
                                    handleItemChange(
                                      idx,
                                      "discountPercent",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 font-semibold">
                            {finalPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="text-red-500 hover:text-red-700 transition duration-200 ease-in-out cursor-pointer transform hover:scale-110"
                            >
                              <span className="text-lg">-</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                        <button
                          type="button"
                          onClick={addItem}
                          className="text-green-500 hover:text-green-700 transition duration-200 ease-in-out cursor-pointer transform hover:scale-110"
                        >
                          <span className="text-lg">+</span>
                        </button>
                      </td>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-right font-bold text-gray-800"
                      >
                        Subtotal:
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 font-bold">
                        {formItems
                          .reduce((sum, item) => {
                            const product = products.find(
                              (p) => p.id === item.productId,
                            );
                            const price = product ? product.price : 0;
                            const total = item.quantity * price;

                            let discountAmount = 0;
                            if (
                              item.discountType === "percent" &&
                              item.discountPercent
                            ) {
                              discountAmount =
                                (total * item.discountPercent) / 100;
                            } else if (
                              item.discountType === "fixed" &&
                              item.discountAmount
                            ) {
                              discountAmount = Math.min(
                                item.discountAmount,
                                total,
                              );
                            }

                            return sum + (total - discountAmount);
                          }, 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Transaction-level discount */}
            <div className="space-y-4 border-t pt-4">
              <label className="block text-sm font-medium text-gray-700">
                Transaction Discount (Applied to Total)
              </label>
              <div className="flex gap-4 items-center">
                <select
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
                  value={form.discountType}
                  onChange={(e) =>
                    handleFormChange("discountType", e.target.value)
                  }
                >
                  <option value="none">No Discount</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="percent">Percentage</option>
                </select>
                {form.discountType === "fixed" && (
                  <input
                    type="number"
                    min={0}
                    placeholder="Discount Amount"
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
                    value={form.discountAmount}
                    onChange={(e) =>
                      handleFormChange("discountAmount", Number(e.target.value))
                    }
                  />
                )}
                {form.discountType === "percent" && (
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Discount %"
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
                    value={form.discountPercent}
                    onChange={(e) =>
                      handleFormChange(
                        "discountPercent",
                        Number(e.target.value),
                      )
                    }
                  />
                )}
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <span className="text-lg font-semibold">Final Total:</span>
                <span className="text-xl font-bold text-green-600">
                  {(() => {
                    const subtotal = formItems.reduce((sum, item) => {
                      const product = products.find(
                        (p) => p.id === item.productId,
                      );
                      const price = product ? product.price : 0;
                      const total = item.quantity * price;
                      let discountAmount = 0;
                      if (
                        item.discountType === "percent" &&
                        item.discountPercent
                      ) {
                        discountAmount = (total * item.discountPercent) / 100;
                      } else if (
                        item.discountType === "fixed" &&
                        item.discountAmount
                      ) {
                        discountAmount = Math.min(item.discountAmount, total);
                      }
                      return sum + (total - discountAmount);
                    }, 0);

                    let transactionDiscount = 0;
                    if (
                      form.discountType === "percent" &&
                      form.discountPercent
                    ) {
                      transactionDiscount =
                        (subtotal * form.discountPercent) / 100;
                    } else if (
                      form.discountType === "fixed" &&
                      form.discountAmount
                    ) {
                      transactionDiscount = Math.min(
                        form.discountAmount,
                        subtotal,
                      );
                    }

                    return (subtotal - transactionDiscount).toFixed(2);
                  })()}
                </span>
              </div>
            </div>

            {/* Enhance the select dropdown to support typing and searching within the same input */}

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setForm({
                    paymentMethod: "",
                    creditorName: "",
                    selectedShopId: "",
                    selectedWarehouseId: "",
                    discountType: "none",
                    discountAmount: 0,
                    discountPercent: 0,
                  });
                  setFormItems([
                    {
                      productId: "",
                      quantity: 1,
                      discountType: "none",
                      discountAmount: 0,
                      discountPercent: 0,
                    },
                  ]);
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
      {/* Confirm Status Update Modal */}
      {isConfirmModalOpen && (
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title="Confirm Status Update"
        >
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Are you sure you want to mark this transaction as payed? This
              action cannot be undone.
            </p>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                updateTransactionStatus(selectedTransactionId, "payed");
                setIsConfirmModalOpen(false);
              }}
            >
              Confirm
            </Button>
          </div>
        </Modal>
      )}
      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <Modal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          title="Add New Customer"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="customerName"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="customerName"
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-gray-50 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
                required
              />
            </div>
            <div>
              <label
                htmlFor="customerAddress"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <input
                type="text"
                id="customerAddress"
                value={newCustomer.address}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, address: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-gray-50 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
                required
              />
            </div>
            <div>
              <label
                htmlFor="customerPhoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="customerPhoneNumber"
                value={newCustomer.phoneNumber}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    phoneNumber: e.target.value,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-gray-50 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsCustomerModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateCustomer}>
                Create
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default withPermission(SalesTransactionsPage, "sales.read");
