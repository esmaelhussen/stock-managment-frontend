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
import { stockTransactionService } from "@/services/stockTransaction.service";
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
  const [allStock, setAllStock] = useState<any[]>([]);
  const [filteredStock, setFilteredStock] = useState<any[]>([]);
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
  // const roles = JSON.parse(Cookies.get("roles") || "[]");
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
    creditDuration: 1,
    creditFrequency: "monthly" as "weekly" | "monthly" | "yearly",
    creditStartDate: new Date().toISOString().split("T")[0],
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
  const [isCreditPaymentModalOpen, setIsCreditPaymentModalOpen] =
    useState(false);
  const [creditPaymentAmount, setCreditPaymentAmount] = useState("");
  const [selectedCreditTransaction, setSelectedCreditTransaction] =
    useState<any>(null);

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
    fetchStock();
    fetchTransactions();
    checkOverdueCredits();
  }, []);

  const checkOverdueCredits = async () => {
    try {
      await saleService.checkOverdueCredits();
    } catch (error) {
      console.error("Failed to check overdue credits");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await productService.getAll();
      setProducts(Array.isArray(res) ? res : []);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const fetchStock = async () => {
    try {
      const data = await stockTransactionService.getAllStock();
      setAllStock(Array.isArray(data) ? data : []);
      // Initially filter based on user role
      filterStockByRole(data);
    } catch (error) {
      toast.error("Failed to fetch stock data");
    }
  };

  const filterStockByRole = (stockData: any[]) => {
    let filtered;
    if (isShopRole && shop) {
      filtered = stockData.filter(
        (stock) => stock.shop?.id?.toLowerCase() === shop?.id?.toLowerCase(),
      );
    } else if (isWarehouseRole && warehouseId) {
      filtered = stockData.filter(
        (stock) =>
          stock.warehouse?.id?.toLowerCase() === warehouseId?.toLowerCase(),
      );
    } else {
      filtered = stockData;
    }
    setFilteredStock(filtered);
  };

  const filterStockBySelection = (
    selectedShopId: string,
    selectedWarehouseId: string,
  ) => {
    let filtered = allStock;

    if (selectedShopId) {
      filtered = allStock.filter((stock) => stock.shop?.id === selectedShopId);
    } else if (selectedWarehouseId) {
      filtered = allStock.filter(
        (stock) => stock.warehouse?.id === selectedWarehouseId,
      );
    }

    setFilteredStock(filtered);
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

  const handleFormChange = (field: string, value: any) => {
    setForm((prev) => {
      const newForm = { ...prev, [field]: value };

      // When shop or warehouse is selected, filter stock accordingly
      if (field === "selectedShopId" || field === "selectedWarehouseId") {
        filterStockBySelection(
          field === "selectedShopId" ? value : newForm.selectedShopId,
          field === "selectedWarehouseId" ? value : newForm.selectedWarehouseId,
        );
      }

      return newForm;
    });
  };

  const handleItemChange = (idx: number, field: string, value: any) => {
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
  const removeItem = (idx: number) =>
    setFormItems((prev) => prev.filter((_, i) => i !== idx));

  const handleCreditPayment = (transactionId: string) => {
    const transaction = transactions.find((tx) => tx.id === transactionId);
    setSelectedCreditTransaction(transaction);
    setCreditPaymentAmount("");
    setIsCreditPaymentModalOpen(true);
  };

  const getRemainingAmount = (transaction: any) => {
    return (
      (transaction.finalPrice || transaction.totalPrice) -
      (transaction.creditPaidAmount || 0)
    );
  };

  const processCreditPayment = async () => {
    if (!selectedCreditTransaction || !creditPaymentAmount) return;

    try {
      const response = await saleService.makeCreditPayment(
        selectedCreditTransaction.id,
        parseFloat(creditPaymentAmount),
      );

      toast.success(
        `Payment of ${response.paidAmount} birr successful. Remaining: ${response.remainingAmount} birr`,
      );

      setIsCreditPaymentModalOpen(false);
      setCreditPaymentAmount("");
      setSelectedCreditTransaction(null);
      fetchTransactions();
    } catch (error) {
      toast.error("Payment failed");
    }
  };

  const generatePDF = (transaction: any) => {
    try {
      console.log("Starting PDF generation for transaction:", transaction);
      console.log("Transaction items:", transaction.items);
      console.log("Products available:", products);

      // Validate transaction data
      if (!transaction) {
        throw new Error("No transaction data provided");
      }

      if (
        !transaction.items ||
        !Array.isArray(transaction.items) ||
        transaction.items.length === 0
      ) {
        throw new Error("Transaction has no items");
      }

      // Import jsPDF properly
      const doc = new jsPDF();
      console.log("jsPDF instance created successfully");

      // Add a colorful title with a background
      doc.setFillColor(41, 128, 185); // Blue background
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 20, "F");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255); // White text
      doc.setFont("helvetica", "bold");
      // Center the title manually
      const title = "Sales Transaction Receipt";
      const titleWidth = doc.getTextWidth(title);
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.text(title, (pageWidth - titleWidth) / 2, 15);

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

      let yOffset = 60;
      if (transaction.paymentMethod === "credit") {
        doc.text(
          `Creditor Name: ${transaction.creditorName || "-"}`,
          10,
          yOffset,
        );
        yOffset += 10;
      }

      // Add customer information
      if (transaction.customer) {
        doc.text(`Customer: ${transaction.customer.name}`, 10, yOffset);
        yOffset += 10;
      } else {
        doc.text(`Customer: Walk-in Customer`, 10, yOffset);
        yOffset += 10;
      }

      // Add a table header for products with a background color
      doc.setFillColor(230, 230, 230); // Light gray background
      doc.rect(10, yOffset, 190, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.text("No", 12, yOffset + 7);
      doc.text("Product", 22, yOffset + 7);
      doc.text("Qty", 70, yOffset + 7);
      doc.text("Price", 85, yOffset + 7);
      doc.text("Discount", 105, yOffset + 7);
      doc.text("Item Total", 135, yOffset + 7);
      doc.text("Final", 165, yOffset + 7);
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(10, yOffset + 10, 200, yOffset + 10);

      // Add product details in rows with aligned columns
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      let currentY = yOffset + 15;

      if (transaction.items && Array.isArray(transaction.items)) {
        transaction.items.forEach((item: any, index: number) => {
          console.log("Processing item:", item);
          const product = products.find((p) => p.id === item.product?.id);
          const price = Number(item.price || (product ? product.price : 0));
          const quantity = Number(item.quantity || 0);
          const itemTotal = quantity * price;

          // Calculate item discount
          let itemDiscountText = "-";
          let itemFinalPrice = itemTotal;

          if (item.discountType === "percent" && item.discountPercent > 0) {
            const discountPercent = Number(item.discountPercent);
            itemDiscountText = `${discountPercent}%`;
            itemFinalPrice =
              Number(item.finalPrice) ||
              itemTotal - (itemTotal * discountPercent) / 100;
          } else if (item.discountType === "fixed" && item.discountAmount > 0) {
            const discountAmount = Number(item.discountAmount);
            itemDiscountText = `${discountAmount} birr`;
            itemFinalPrice =
              Number(item.finalPrice) || itemTotal - discountAmount;
          }

          doc.text(`${index + 1}`, 12, currentY);
          doc.text(
            (item.product?.name || "Unknown Product").substring(0, 20),
            22,
            currentY,
          );
          doc.text(`${quantity}`, 72, currentY);
          doc.text(`${price.toFixed(2)}`, 95, currentY);
          doc.text(itemDiscountText, 120, currentY);
          doc.text(`${itemTotal.toFixed(2)}`, 150, currentY);
          doc.text(`${itemFinalPrice.toFixed(2)}`, 180, currentY);

          currentY += 8;
        });
      }

      // Add subtotal
      currentY += 5;
      doc.setFont("helvetica", "normal");
      doc.text("Subtotal:", 130, currentY);
      const subtotalValue = Number(transaction.totalPrice || 0);
      doc.text(`${subtotalValue.toFixed(2)} birr`, 180, currentY);

      // Add transaction-level discount if exists
      if (transaction.discountType !== "none" && transaction.discountType) {
        currentY += 8;
        doc.text("Transaction Discount:", 130, currentY);

        let discountText = "";
        if (
          transaction.discountType === "percent" &&
          transaction.discountPercent > 0
        ) {
          const discountPercent = Number(transaction.discountPercent);
          const discountAmount = Number(transaction.discountAmount || 0);
          discountText = `${discountPercent}% (-${discountAmount.toFixed(2)} birr)`;
        } else if (
          transaction.discountType === "fixed" &&
          transaction.discountAmount > 0
        ) {
          const discountAmount = Number(transaction.discountAmount);
          discountText = `-${discountAmount.toFixed(2)} birr`;
        }
        doc.text(discountText, 180, currentY);
      }

      // Add final total with a highlighted background
      currentY += 10;
      doc.setFillColor(241, 196, 15); // Yellow background
      doc.rect(10, currentY - 5, 190, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Final Total:", 130, currentY);
      const finalTotal = Number(
        transaction.finalPrice || transaction.totalPrice || 0,
      );
      doc.text(`${finalTotal.toFixed(2)} birr`, 180, currentY);

      // Add transaction status at the bottom with a highlighted background
      currentY += 15;
      doc.setFillColor(52, 152, 219); // Blue background
      doc.rect(10, currentY - 5, 190, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255); // White text
      doc.text("Status:", 130, currentY);
      doc.text(transaction.status.toUpperCase(), 180, currentY);

      // Add shop/warehouse information
      doc.setTextColor(0, 0, 0); // Reset to black text
      currentY += 15;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      if (transaction.shop) {
        doc.text(`Shop: ${transaction.shop.name || "N/A"}`, 10, currentY);
      } else if (transaction.warehouse) {
        doc.text(
          `Warehouse: ${transaction.warehouse.name || "N/A"}`,
          10,
          currentY,
        );
      }

      if (transaction.transactedBy) {
        currentY += 7;
        doc.text(
          `Transacted By: ${transaction.transactedBy.firstName || "N/A"}`,
          10,
          currentY,
        );
      }

      // Save the PDF
      doc.save(`transaction_${transaction.id}.pdf`);
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      toast.error(
        `Failed to generate PDF: ${error.message || "Unknown error"}`,
      );
    }
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

      // Check stock availability
      const stockItem = filteredStock.find(
        (s) => s.product.id === item.productId,
      );
      if (stockItem && item.quantity > stockItem.quantity) {
        errors[`quantity_${idx}`] =
          `Quantity exceeds available stock (${stockItem.quantity})`;
      }
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
      const transactionData: any = {
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
      };

      // Add credit fields if payment method is credit
      if (form.paymentMethod === "credit") {
        transactionData.creditDuration = form.creditDuration;
        transactionData.creditFrequency = form.creditFrequency;
        transactionData.creditStartDate = form.creditStartDate;
      }

      const createdTransaction =
        await saleService.createSalesTransaction(transactionData);
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
        creditDuration: 1,
        creditFrequency: "monthly",
        creditStartDate: new Date().toISOString().split("T")[0],
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

  const calculateTotalPrice = (items: any[]) => {
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

  const updateTransactionStatus = async (
    transactionId: string | null,
    newStatus: "payed" | "unpayed",
  ) => {
    try {
      if (!transactionId) return;
      await saleService.updateTransactionStatus(transactionId, newStatus); // Ensure backend supports this
      toast.success("Transaction status updated");
      fetchTransactions();
    } catch (error) {
      toast.error("Failed to update transaction status");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  // Filter stock products based on the search term
  const filteredProducts = filteredStock.filter((stock) =>
    stock.product.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  const overdueCredits = transactions.filter(
    (tx) => tx.paymentMethod === "credit" && tx.creditOverdue,
  );

  return (
    <div>
      {/* Overdue Credits Alert */}
      {overdueCredits.length > 0 && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {overdueCredits.length} Credit Payment
                {overdueCredits.length > 1 ? "s" : ""} Overdue
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>The following customers have overdue credit payments:</p>
                <ul className="list-disc list-inside mt-1">
                  {overdueCredits.slice(0, 3).map((tx) => (
                    <li key={tx.id}>
                      {tx.creditorName}: $
                      {(tx.finalPrice || tx.totalPrice) -
                        (tx.creditPaidAmount || 0)}{" "}
                      remaining
                      {tx.creditNextDueDate &&
                        ` (Due: ${new Date(tx.creditNextDueDate).toLocaleDateString()})`}
                    </li>
                  ))}
                  {overdueCredits.length > 3 && (
                    <li>...and {overdueCredits.length - 3} more</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

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
                Credit Info
              </th>
              {!isShopRole && !roles.includes("warehouse") && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Transacted Stock Name
                </th>
              )}
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
                  {tx.totalPrice || calculateTotalPrice(tx.items)} birr
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
                  {tx.finalPrice || calculateTotalPrice(tx.items)} birr
                </td>

                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  {tx.creditorName}
                </td>
                <td
                  className={`px-6 py-4 text-sm text-gray-800 dark:text-gray-200 ${tx.status === "payed" ? "text-green-600 " : "text-red-600 "}`}
                >
                  {tx.status}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  {tx.paymentMethod === "credit" ? (
                    <div className="space-y-1">
                      {tx.creditOverdue && (
                        <span className="text-red-600 font-semibold">
                          OVERDUE!
                        </span>
                      )}
                      <div className="text-xs">
                        <p>Paid: {tx.creditPaidAmount || 0} birr </p>
                        <p>
                          Remaining:
                          {(tx.finalPrice || tx.totalPrice) -
                            (tx.creditPaidAmount || 0)}{" "}
                          birr
                        </p>
                        {tx.creditNextDueDate && (
                          <p>
                            Next Due:{" "}
                            {new Date(
                              tx.creditNextDueDate,
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                {!isShopRole && !isWarehouseRole && (
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                    {(() => {
                      // For users who are neither shop nor warehouse role
                      if (!isShopRole && !isWarehouseRole) {
                        if (tx.shop) {
                          return `Shop: ${tx.shop.name}`;
                        } else if (tx.warehouse) {
                          return `Warehouse: ${tx.warehouse.name}`;
                        }
                      }

                      // For shop role users
                      if (isShopRole && tx.transactedBy?.shop) {
                        return `Shop: ${tx.transactedBy.shop.name}`;
                      }

                      // For warehouse role users
                      if (isWarehouseRole && tx.transactedBy?.warehouse) {
                        return `Warehouse: ${tx.transactedBy.warehouse.name}`;
                      }

                      // Fallback: try to get from transaction directly
                      if (tx.shop) {
                        return `Shop: ${tx.shop.name}`;
                      } else if (tx.warehouse) {
                        return `Warehouse: ${tx.warehouse.name}`;
                      }

                      return "N/A";
                    })()}
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  {tx.transactedBy?.firstName || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => generatePDF(tx)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    >
                      Print PDF
                    </button>
                    {tx.paymentMethod === "credit" &&
                      tx.status === "unpayed" && (
                        <button
                          onClick={() => handleCreditPayment(tx.id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs rounded focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                        >
                          Pay Credit
                        </button>
                      )}
                  </div>
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
              creditDuration: 10,
              creditFrequency: "monthly",
              creditStartDate: new Date().toISOString().split("T")[0],
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
              <>
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

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-4">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Credit Payment Terms
                  </h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Amount
                      </label>
                      <input
                        type="number"
                        min="10"
                        value={form.creditDuration}
                        onChange={(e) =>
                          handleFormChange(
                            "creditDuration",
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="w-full px-3 py-2 rounded border border-gray-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Frequency
                      </label>
                      <select
                        value={form.creditFrequency}
                        onChange={(e) =>
                          handleFormChange("creditFrequency", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded border border-gray-300 text-sm"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={form.creditStartDate}
                        onChange={(e) =>
                          handleFormChange("creditStartDate", e.target.value)
                        }
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-3 py-2 rounded border border-gray-300 text-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded">
                    <p className="text-sm">
                      Customer will pay <strong>{form.creditDuration}</strong>{" "}
                      birr <strong>{form.creditFrequency}</strong> starting from{" "}
                      <strong>
                        {new Date(form.creditStartDate).toLocaleDateString()}
                      </strong>
                    </p>
                  </div>
                </div>
              </>
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
                    {filteredProducts.map((stock) => (
                      <div
                        key={stock.id}
                        className="flex justify-between items-center p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          const existingItem = formItems.find(
                            (item) => item.productId === stock.product.id,
                          );
                          if (!existingItem) {
                            setFormItems((prev) => [
                              ...prev,
                              {
                                productId: stock.product.id,
                                quantity: 1,
                                discountType: "none",
                                discountAmount: 0,
                                discountPercent: 0,
                              },
                            ]);
                          }
                          setProductSearch(stock.product.name);
                          setShowProductDropdown(false);
                        }}
                      >
                        <span className="text-sm text-gray-700 font-medium">
                          {stock.product.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {stock.product.unit.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {stock.product.price} birr
                        </span>
                        <span
                          className={`text-xs font-bold ${stock.quantity <= stock.product.alertQuantity ? "text-red-600" : "text-green-600"}`}
                        >
                          Stock: {stock.quantity}
                          {stock.quantity <= stock.product.alertQuantity &&
                            " ⚠"}
                        </span>
                      </div>
                    ))}
                    {filteredProducts.length === 0 && (
                      <div className="p-2 text-sm text-gray-500 text-center">
                        No products available in selected stock
                      </div>
                    )}
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
                        Available Stock
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
                      const stockItem = filteredStock.find(
                        (s) => s.product.id === item.productId,
                      );
                      const product =
                        stockItem?.product ||
                        products.find((p) => p.id === item.productId);
                      const price = product ? product.price : 0;
                      const unit = product ? product.unit.name : "N/A"; // Autofill unit from product
                      const availableStock = stockItem ? stockItem.quantity : 0;
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
                                filteredStock.find(
                                  (s) => s.product.id === item.productId,
                                )?.product.name ||
                                products.find((p) => p.id === item.productId)
                                  ?.name ||
                                item.productId
                              } // Ensure the input reflects the product name or typed value
                              onChange={(e) => {
                                const typedValue = e.target.value;
                                const selectedStock = filteredStock.find(
                                  (s) => s.product.name === typedValue,
                                );
                                handleItemChange(
                                  idx,
                                  "productId",
                                  selectedStock
                                    ? selectedStock.product.id
                                    : typedValue,
                                ); // Update productId or keep the typed value
                              }}
                            />
                            <datalist id={`product-list-${idx}`}>
                              {filteredStock.map((stock) => (
                                <option
                                  key={stock.product.id}
                                  value={stock.product.name}
                                />
                              ))}
                            </datalist>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                            <div className="flex flex-col">
                              <input
                                type="number"
                                min={1}
                                max={availableStock}
                                className={`w-full px-4 py-2 rounded-lg border text-sm bg-gray-50 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out hover:bg-white ${
                                  item.quantity > availableStock
                                    ? "border-red-500 text-red-600"
                                    : "border-gray-300 text-gray-700"
                                }`}
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
                              {item.quantity > availableStock && (
                                <span className="text-xs text-red-500 mt-1">
                                  Exceeds available stock ({availableStock})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                            {price}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                            {unit}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                            <span
                              className={`font-bold ${availableStock <= (stockItem?.product?.alertQuantity || 0) ? "text-red-600" : "text-green-600"}`}
                            >
                              {availableStock}
                              {availableStock <=
                                (stockItem?.product?.alertQuantity || 0) &&
                                " ⚠"}
                            </span>
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
                    creditDuration: 1,
                    creditFrequency: "monthly",
                    creditStartDate: new Date().toISOString().split("T")[0],
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

      {/* Credit Payment Modal */}
      {isCreditPaymentModalOpen && selectedCreditTransaction && (
        <Modal
          isOpen={isCreditPaymentModalOpen}
          onClose={() => {
            setIsCreditPaymentModalOpen(false);
            setCreditPaymentAmount("");
            setSelectedCreditTransaction(null);
          }}
          title="Make Credit Payment"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
              <h3 className="font-semibold mb-2">Credit Details</h3>
              <div className="space-y-1 text-sm">
                <p>Customer: {selectedCreditTransaction.creditorName}</p>
                <p>
                  Total Amount:
                  {selectedCreditTransaction.finalPrice ||
                    selectedCreditTransaction.totalPrice}{" "}
                  birr
                </p>
                <p>
                  Paid Amount:
                  {selectedCreditTransaction.creditPaidAmount || 0} birr
                </p>
                <p className="font-semibold text-lg">
                  Remaining:
                  {(selectedCreditTransaction.finalPrice ||
                    selectedCreditTransaction.totalPrice) -
                    (selectedCreditTransaction.creditPaidAmount || 0)}{" "}
                  birr
                </p>
                {selectedCreditTransaction.creditInstallmentAmount && (
                  <p>
                    Minimum pay Amount:
                    {selectedCreditTransaction.creditDuration} birr
                  </p>
                )}
                {selectedCreditTransaction.creditNextDueDate && (
                  <p>
                    Next Due Date:{" "}
                    {new Date(
                      selectedCreditTransaction.creditNextDueDate,
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={creditPaymentAmount}
                onChange={(e) => setCreditPaymentAmount(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  parseFloat(creditPaymentAmount) >
                  getRemainingAmount(selectedCreditTransaction)
                    ? "border-yellow-500 bg-yellow-50"
                    : "border-gray-300 bg-gray-50"
                } text-sm text-gray-700 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none`}
                placeholder="Enter payment amount"
              />
              {parseFloat(creditPaymentAmount) >
              getRemainingAmount(selectedCreditTransaction) ? (
                <div className="mt-1 p-2 bg-yellow-50 border border-yellow-300 rounded">
                  <p className="text-sm text-yellow-800 font-medium">
                    ⚠️ Warning: Amount exceeds remaining credit amount!
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Remaining credit amount:
                    {getRemainingAmount(selectedCreditTransaction).toFixed(
                      2,
                    )}{" "}
                    birr
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Remaining credit amount:
                  {getRemainingAmount(selectedCreditTransaction).toFixed(
                    2,
                  )}{" "}
                  birr
                </p>
              )}

              {parseFloat(creditPaymentAmount) <
                selectedCreditTransaction.creditDuration &&
              selectedCreditTransaction.creditDuration <
                getRemainingAmount(selectedCreditTransaction) ? (
                <div className="mt-1 p-2 bg-yellow-50 border border-yellow-300 rounded">
                  <p className="text-sm text-yellow-800 font-medium">
                    ⚠️ Warning: Amount below your minimum pay!
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    minimum pay amount:
                    {selectedCreditTransaction.creditDuration.toFixed(2)} birr
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  minimum pay amount:{selectedCreditTransaction.creditDuration}{" "}
                  birr
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setIsCreditPaymentModalOpen(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={processCreditPayment}
                disabled={
                  !creditPaymentAmount ||
                  parseFloat(creditPaymentAmount) <= 0 ||
                  parseFloat(creditPaymentAmount) >
                    getRemainingAmount(selectedCreditTransaction)
                }
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Make Payment
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default withPermission(SalesTransactionsPage, "sales.read");
