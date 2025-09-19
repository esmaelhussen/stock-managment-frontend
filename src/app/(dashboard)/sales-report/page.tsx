"use client";

import React, { useState, useEffect } from "react";
import { saleService } from "@/services/sale.service";
import toast from "react-hot-toast";
import withPermission from "@/hoc/withPermission";
import { Pie, Bar, Line, Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import Cookies from "js-cookie";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

type Period = "daily" | "weekly" | "monthly" | "yearly";

interface ProductSale {
  name: string;
  quantity: number;
  eachPrice: number;
  total: number;
  discount: number;
  source?: {
    type: string;
    name: string;
  };
}

interface ReportData {
  range?: {
    period: string;
    startDate: string;
    endDate: string;
  };
  grouped: Record<string, any>;
  summary: {
    productSales: Record<string, ProductSale>;
    paymentStatus: {
      payed: number;
      unpayed: number;
    };
    paymentMethods: Record<string, number>;
    totals: {
      totalQuantity: number;
      totalPrice: number;
      totalDiscount: number;
      totalTransactions: number;
    };
    mostUsedPaymentMethod: string;
  };
}

const chartColors = {
  primary: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"],
  secondary: ["#06B6D4", "#84CC16", "#F97316", "#DC2626", "#7C3AED", "#DB2777"],
  gradient: {
    blue: ["#3B82F6", "#1E40AF"],
    green: ["#10B981", "#059669"],
    orange: ["#F59E0B", "#D97706"],
    purple: ["#8B5CF6", "#6D28D9"],
  },
};

function SalesReportPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("daily");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [warehouseId, setWarehouseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "payments" | "trends"
  >("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"quantity" | "revenue" | "discount">(
    "revenue",
  );

  useEffect(() => {
    const savedShopId = Cookies.get("shopId");
    const savedWarehouseId = Cookies.get("warehouseId");

    if (savedShopId) {
      setShopId(savedShopId);
      setWarehouseId(null);
    } else if (savedWarehouseId) {
      setWarehouseId(savedWarehouseId);
      setShopId(null);
    } else {
      // Prompt user to select shop or warehouse
      // This can be replaced with a modal or dropdown logic
    }
  }, []);

  useEffect(() => {
    fetchReportData(period);
  }, [period]);

  const fetchReportData = async (selectedPeriod: Period) => {
    setLoading(true);
    try {
      const params: { locationId?: string; type?: "shop" | "warehouse" } = {};

      if (shopId) {
        params.locationId = shopId;
        params.type = "shop";
      } else if (warehouseId) {
        params.locationId = warehouseId;
        params.type = "warehouse";
      }

      const res = await saleService.getSalesReport(
        params.locationId || "",
        params.type as "shop" | "warehouse", // Ensure type safety
        selectedPeriod,
      );
      console.log("Full API Response:", res); // Log the full response for debugging

      if (!res) {
        console.error("API response is null or undefined");
        setReportData(null);
        return;
      }

      // Check if the data exists in a different key
      const fetchedData = res || res.body || res.result || null;
      console.log("Processed Report Data:", fetchedData); // Log the processed data

      // Extract and process the data
      const groupedData = fetchedData.grouped || {};
      const summaryData = fetchedData.summary || {};

      // Example: Combine grouped and summary data
      const processedData = {
        grouped: groupedData,
        summary: summaryData,
      };

      console.log("Processed Report Data:", processedData);
      setReportData(processedData);
      setSelectedDate(null); // Reset drill-down when period changes
    } catch (error) {
      console.error("Failed to fetch report data", error); // Log the error
      toast.error("Failed to fetch report data");
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  console.log("report data", reportData);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            if (context.dataset.label === "Revenue") {
              return `${label}: ${value.toLocaleString()} Birr`;
            }
            return `${label}: ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const summary = reportData?.summary || null;
  const grouped = reportData?.grouped;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getProductsArray = () => {
    if (!summary || !summary.productSales) return [];
    return Object.entries(summary.productSales)
      .map(([id, product]) => ({ id, ...product }))
      .filter((product: any) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a: any, b: any) => {
        if (sortBy === "quantity") return b.quantity - a.quantity;
        if (sortBy === "revenue") return b.total - a.total;
        if (sortBy === "discount") return b.discount - a.discount;
        return 0;
      });
  };

  const calculateGrowth = () => {
    if (!grouped || Object.keys(grouped).length < 2) return 0;
    const dates = Object.keys(grouped).sort();
    const latest = grouped[dates[dates.length - 1]]?.totals?.totalPrice || 0;
    const previous = grouped[dates[dates.length - 2]]?.totals?.totalPrice || 0;
    if (previous === 0) return 0;
    return (((latest - previous) / previous) * 100).toFixed(1);
  };

  const exportToExcel = () => {
    if (!reportData) return;

    const workbook = XLSX.utils.book_new();

    const summaryData = [
      ["Sales Report Summary"],
      ["Period", period],
      [
        "Date Range",
        `${reportData.range?.startDate || ""} to ${reportData.range?.endDate || ""}`,
      ],
      [],
      ["Key Metrics"],
      ["Total Transactions", summary?.totals?.totalTransactions || 0],
      ["Total Quantity Sold", summary?.totals?.totalQuantity || 0],
      [
        "Total Revenue",
        `${formatCurrency(summary?.totals?.totalPrice || 0)} Birr`,
      ],
      [
        "Total Discount",
        `${formatCurrency(summary?.totals?.totalDiscount || 0)} Birr`,
      ],
      ["Most Used Payment Method", summary?.mostUsedPaymentMethod || "-"],
    ];

    const productData = getProductsArray().map((product: any) => [
      product.name,
      product.quantity,
      formatCurrency(product.eachPrice),
      formatCurrency(product.total),
      formatCurrency(product.discount),
    ]);
    productData.unshift([
      "Product Name",
      "Quantity",
      "Unit Price",
      "Total Revenue",
      "Discount",
    ]);

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const productSheet = XLSX.utils.aoa_to_sheet(productData);

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(workbook, productSheet, "Product Sales");

    XLSX.writeFile(
      workbook,
      `Sales_Report_${period}_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    toast.success("Report exported successfully!");
  };

  const generatePDF = (title, summary, chartsData) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(title, 14, 20);

    // Summary Table
    if (summary) {
      doc.setFontSize(14);
      doc.text("Summary", 14, 30);
      autoTable(doc, {
        startY: 35,
        head: [["Metric", "Value"]],
        body: [
          ["Total Transactions", summary.totals?.totalTransactions || 0],
          ["Total Quantity", summary.totals?.totalQuantity || 0],
          ["Total Price", summary.totals?.totalPrice || 0],
          ["Most Used Payment Method", summary.mostUsedPaymentMethod || "-"],
        ],
      });
    }

    // Charts
    if (chartsData) {
      const productsSoldCanvas = document.querySelector(chartsData[0].selector);
      const paymentMethodsCanvas = document.querySelector(
        chartsData[1].selector,
      );
      const paymentStatusCanvas = document.querySelector(
        chartsData[2].selector,
      );

      let currentY = 80;

      // Products Sold and Payment Methods side by side
      if (productsSoldCanvas && paymentMethodsCanvas) {
        const productsSoldImg = productsSoldCanvas.toDataURL("image/png");
        const paymentMethodsImg = paymentMethodsCanvas.toDataURL("image/png");

        doc.addImage(productsSoldImg, "PNG", 14, currentY, 90, 90);
        doc.addImage(paymentMethodsImg, "PNG", 109, currentY, 90, 90);

        currentY += 100; // Move Y position below the side-by-side charts
      }

      // Payment Status centered below
      if (paymentStatusCanvas) {
        const paymentStatusImg = paymentStatusCanvas.toDataURL("image/png");
        doc.addImage(paymentStatusImg, "PNG", 50, currentY, 110, 90);
      }
    }

    doc.save(`${title}.pdf`);
  };

  const handlePrintSummary = () => {
    generatePDF("Sales Summary Report", summary, [
      {
        title: "Products Sold",
        selector: "#productsSoldChart",
      },
      {
        title: "Payment Methods",
        selector: "#paymentMethodsChart",
      },
      {
        title: "Payment Status",
        selector: "#paymentStatusChart",
      },
    ]);
  };

  const handlePrintDayReport = () => {
    if (!selectedDate || !grouped[selectedDate]) return;
    generatePDF(`Sales Report for ${selectedDate}`, grouped[selectedDate], [
      {
        title: "Products Sold",
        selector: "#productsSoldChartDay",
      },
      {
        title: "Payment Methods",
        selector: "#paymentMethodsChartDay",
      },
      {
        title: "Payment Status",
        selector: "#paymentStatusChartDay",
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-8 mb-8">
          <div className="flex flex-wrap justify-between items-start gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Sales Analytics Dashboard
              </h1>
              <p className="text-blue-100">
                {reportData?.range && (
                  <span>
                    Period: {reportData.range.period} |
                    {new Date(reportData.range.startDate).toLocaleDateString()}{" "}
                    -{new Date(reportData.range.endDate).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                className="px-5 py-3 rounded-lg border-0 text-sm font-semibold bg-white/90 backdrop-blur shadow-lg focus:ring-2 focus:ring-white/50 transition-all"
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <button
                onClick={exportToExcel}
                className="px-5 py-3 rounded-lg bg-white/90 backdrop-blur text-blue-600 font-semibold shadow-lg hover:bg-white transition-all flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export Excel
              </button>
              <button
                onClick={handlePrintSummary}
                className="px-5 py-3 rounded-lg bg-white/90 backdrop-blur text-purple-600 font-semibold shadow-lg hover:bg-white transition-all flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print PDF
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* No Data */}
        {!loading && !reportData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Data Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No sales data found for the selected period
            </p>
          </div>
        )}

        {/* KPI Cards */}
        {!loading && summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatCurrency(summary.totals?.totalPrice || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Birr</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                  <svg
                    className="w-8 h-8 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              {calculateGrowth() !== 0 && (
                <div className="mt-4 flex items-center">
                  <span
                    className={`text-sm font-medium ${Number(calculateGrowth()) > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {Number(calculateGrowth()) > 0 ? "↑" : "↓"}{" "}
                    {Math.abs(Number(calculateGrowth()))}%
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    vs previous period
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Transactions
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {summary.totals?.totalTransactions || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Orders</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Products Sold
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {summary.totals?.totalQuantity || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Units</p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                  <svg
                    className="w-8 h-8 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Discount
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatCurrency(summary.totals?.totalDiscount || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Birr</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                  <svg
                    className="w-8 h-8 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        {!loading && summary && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  {
                    id: "overview",
                    name: "Overview",
                    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
                  },
                  {
                    id: "products",
                    name: "Products",
                    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
                  },
                  {
                    id: "payments",
                    name: "Payments",
                    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
                  },
                  {
                    id: "trends",
                    name: "Trends",
                    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                      ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                      }
                    `}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={tab.icon}
                      />
                    </svg>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {!loading && summary && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Sales Composition Chart */}
                  <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Sales Composition
                    </h3>
                    <div className="h-80">
                      <Doughnut
                        data={{
                          labels: Object.values(summary.productSales || {}).map(
                            (p: any) => p.name,
                          ),
                          datasets: [
                            {
                              data: Object.values(
                                summary.productSales || {},
                              ).map((p: any) => p.total),
                              backgroundColor: chartColors.primary,
                              borderWidth: 2,
                              borderColor: "#fff",
                            },
                          ],
                        }}
                        options={
                          {
                            ...chartOptions,
                            cutout: "60%",
                            plugins: {
                              legend: {
                                position: "right" as const,
                                labels: {
                                  padding: 15,
                                  font: { size: 11 },
                                },
                              },
                              tooltip: chartOptions.plugins.tooltip,
                            },
                          } as any
                        }
                        id="productsSoldChart"
                      />
                    </div>
                  </div>

                  {/* Payment Methods Distribution */}
                  <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Payment Methods Distribution
                    </h3>
                    <div className="h-80">
                      <Bar
                        data={{
                          labels: Object.keys(summary.paymentMethods || {}),
                          datasets: [
                            {
                              label: "Transactions",
                              data: Object.values(summary.paymentMethods || {}),
                              backgroundColor: chartColors.gradient.blue[0],
                              borderRadius: 8,
                            },
                          ],
                        }}
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            legend: { display: false },
                          },
                        }}
                        id="paymentMethodsChart"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Status Overview */}
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Payment Status Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64">
                      <Pie
                        data={{
                          labels: ["Paid", "Unpaid"],
                          datasets: [
                            {
                              data: [
                                summary.paymentStatus?.payed || 0,
                                summary.paymentStatus?.unpayed || 0,
                              ],
                              backgroundColor: ["#10B981", "#EF4444"],
                              borderWidth: 2,
                              borderColor: "#fff",
                            },
                          ],
                        }}
                        options={chartOptions}
                        id="paymentStatusChart"
                      />
                    </div>
                    <div className="flex flex-col justify-center space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Paid Transactions
                          </span>
                        </div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {summary.paymentStatus?.payed || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Unpaid Transactions
                          </span>
                        </div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {summary.paymentStatus?.unpayed || 0}
                        </span>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Collection Rate:</strong>{" "}
                          {summary.paymentStatus?.payed &&
                          summary.totals?.totalTransactions
                            ? (
                                (summary.paymentStatus.payed /
                                  summary.totals.totalTransactions) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                  <div className="flex-1 min-w-[200px] max-w-md">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                      />
                      <svg
                        className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="revenue">Sort by Revenue</option>
                    <option value="quantity">Sort by Quantity</option>
                    <option value="discount">Sort by Discount</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Product Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Quantity Sold
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Discount Given
                        </th>
                        {/*<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">*/}
                        {/*  Source*/}
                        {/*</th>*/}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {getProductsArray().map((product: any, index: number) => (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {product.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {product.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  ID: {product.id.slice(0, 8)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white font-medium">
                              {product.quantity}
                            </div>
                            <div className="text-xs text-gray-500">units</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(product.eachPrice)} Birr
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {formatCurrency(product.total)} Birr
                            </div>
                            <div className="text-xs text-gray-500">
                              {(
                                (product.total /
                                  (summary.totals?.totalPrice || 1)) *
                                100
                              ).toFixed(1)}
                              % of total
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              {formatCurrency(product.discount)} Birr
                            </span>
                          </td>
                          {/*<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">*/}
                          {/*  {product.source*/}
                          {/*    ? `${product.source.type}: ${product.source.name}`*/}
                          {/*    : "-"}*/}
                          {/*</td>*/}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Payment Method Stats */}
                  <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Payment Methods Analysis
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(summary.paymentMethods || {}).map(
                        ([method, count]) => {
                          const percentage =
                            ((count as number) /
                              (summary.totals?.totalTransactions || 1)) *
                            100;
                          return (
                            <div
                              key={method}
                              className="bg-white dark:bg-gray-800 p-4 rounded-lg"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                  {method}
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  {count} transactions ({percentage.toFixed(1)}
                                  %)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">
                            Collection Rate
                          </p>
                          <p className="text-3xl font-bold mt-2">
                            {summary.paymentStatus?.payed &&
                            summary.totals?.totalTransactions
                              ? (
                                  (summary.paymentStatus.payed /
                                    summary.totals.totalTransactions) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </p>
                        </div>
                        <svg
                          className="w-12 h-12 text-green-200 opacity-50"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-100 text-sm">
                            Pending Payments
                          </p>
                          <p className="text-3xl font-bold mt-2">
                            {summary.paymentStatus?.unpayed || 0}
                          </p>
                        </div>
                        <svg
                          className="w-12 h-12 text-red-200 opacity-50"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Most Used Payment Method */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm uppercase tracking-wide">
                        Most Used Payment Method
                      </p>
                      <p className="text-4xl font-bold mt-2 capitalize">
                        {summary.mostUsedPaymentMethod || "N/A"}
                      </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur p-6 rounded-full">
                      <svg
                        className="w-16 h-16 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trends Tab */}
            {activeTab === "trends" &&
              grouped &&
              Object.keys(grouped).length > 1 && (
                <div className="space-y-8">
                  <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Revenue Trend
                    </h3>
                    <div className="h-80">
                      <Line
                        data={{
                          labels: Object.keys(grouped).sort(),
                          datasets: [
                            {
                              label: "Revenue",
                              data: Object.keys(grouped)
                                .sort()
                                .map(
                                  (date) =>
                                    grouped[date]?.totals?.totalPrice || 0,
                                ),
                              borderColor: chartColors.gradient.blue[0],
                              backgroundColor: `${chartColors.gradient.blue[0]}20`,
                              borderWidth: 3,
                              tension: 0.4,
                              fill: true,
                            },
                          ],
                        }}
                        options={chartOptions}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Transactions Trend
                      </h3>
                      <div className="h-64">
                        <Bar
                          data={{
                            labels: Object.keys(grouped).sort(),
                            datasets: [
                              {
                                label: "Transactions",
                                data: Object.keys(grouped)
                                  .sort()
                                  .map(
                                    (date) =>
                                      grouped[date]?.totals
                                        ?.totalTransactions || 0,
                                  ),
                                backgroundColor: chartColors.gradient.green[0],
                                borderRadius: 8,
                              },
                            ],
                          }}
                          options={{
                            ...chartOptions,
                            plugins: {
                              ...chartOptions.plugins,
                              legend: { display: false },
                            },
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Products Sold Trend
                      </h3>
                      <div className="h-64">
                        <Line
                          data={{
                            labels: Object.keys(grouped).sort(),
                            datasets: [
                              {
                                label: "Units Sold",
                                data: Object.keys(grouped)
                                  .sort()
                                  .map(
                                    (date) =>
                                      grouped[date]?.totals?.totalQuantity || 0,
                                  ),
                                borderColor: chartColors.gradient.orange[0],
                                backgroundColor: `${chartColors.gradient.orange[0]}20`,
                                borderWidth: 3,
                                tension: 0.4,
                                fill: true,
                              },
                            ],
                          }}
                          options={{
                            ...chartOptions,
                            plugins: {
                              ...chartOptions.plugins,
                              legend: { display: false },
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Drilldown for weekly/monthly/yearly */}
        {!loading && period !== "daily" && grouped && (
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Detailed Daily Breakdown
                </h2>
                <select
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                  value={selectedDate || ""}
                  onChange={(e) => setSelectedDate(e.target.value || null)}
                >
                  <option value="">Select a date to view details</option>
                  {Object.keys(grouped)
                    .sort()
                    .map((date) => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </option>
                    ))}
                </select>
              </div>

              {selectedDate && (
                <div className="space-y-6">
                  {/* Date Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <p className="text-indigo-100">Daily Performance Report</p>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Transactions
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {grouped[selectedDate]?.totals?.totalTransactions || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Units Sold
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {grouped[selectedDate]?.totals?.totalQuantity || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Revenue
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatCurrency(
                          grouped[selectedDate]?.totals?.totalPrice || 0,
                        )}
                        <span className="text-xs text-gray-500 ml-1">Birr</span>
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Unpaid
                      </p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                        {grouped[selectedDate]?.paymentStatus?.unpayed || 0}
                      </p>
                    </div>
                  </div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Product Sales */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Product Sales Distribution
                      </h4>
                      <div className="h-64">
                        <Doughnut
                          data={{
                            labels: Object.values(
                              grouped[selectedDate]?.productSales || {},
                            ).map((p: any) => p.name),
                            datasets: [
                              {
                                data: Object.values(
                                  grouped[selectedDate]?.productSales || {},
                                ).map((p: any) => p.total),
                                backgroundColor: chartColors.primary,
                                borderWidth: 2,
                                borderColor: "#fff",
                              },
                            ],
                          }}
                          options={{
                            ...chartOptions,
                            cutout: "50%",
                          }}
                          id="productsSoldChartDay"
                        />
                      </div>
                    </div>

                    {/* Payment Analysis */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Payment Analysis
                      </h4>
                      <div className="h-64">
                        <Bar
                          data={{
                            labels: ["Paid", "Unpaid"],
                            datasets: [
                              {
                                label: "Transactions",
                                data: [
                                  grouped[selectedDate]?.paymentStatus?.payed ||
                                    0,
                                  grouped[selectedDate]?.paymentStatus
                                    ?.unpayed || 0,
                                ],
                                backgroundColor: ["#10B981", "#EF4444"],
                                borderRadius: 8,
                              },
                            ],
                          }}
                          options={{
                            ...chartOptions,
                            plugins: {
                              ...chartOptions.plugins,
                              legend: { display: false },
                            },
                          }}
                          id="paymentStatusChartDay"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Products Table */}
                  {grouped[selectedDate]?.productSales && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Products Detail
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Product
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Quantity
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Price
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Revenue
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Discount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {Object.values(
                              grouped[selectedDate].productSales,
                            ).map((product: any, idx: number) => (
                              <tr
                                key={idx}
                                className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              >
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                                  {product.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                  {product.quantity}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                  {formatCurrency(product.eachPrice)} Birr
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(product.total)} Birr
                                </td>
                                <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
                                  {formatCurrency(product.discount)} Birr
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Export Button for Selected Date */}
                  <div className="flex justify-end">
                    <button
                      onClick={handlePrintDayReport}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                      Export Daily Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withPermission(SalesReportPage, "sales.read");
