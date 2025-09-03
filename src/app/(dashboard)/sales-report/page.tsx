"use client";

import React, { useState, useEffect } from "react";
import { saleService } from "@/services/sale.service";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import withPermission from "@/hoc/withPermission";
import { Bar, Pie, Line } from "react-chartjs-2";
import "chart.js/auto";
import Cookies from "js-cookie";

const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const blueBackgroundColor = "#2980B9"; // Blue background color used in SalesTransactionsPage

function SalesReportPage() {
  const [reportData, setReportData] = useState<{
    productSales: Record<string, { quantity: number; total: number }>;
    paymentMethods: Record<string, number>;
    salesOverTime: Record<string, number>;
    paymentStatus: { payed: number; unpayed: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("daily");

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const shopId = Cookies.get("shopId");
      if (!shopId) {
        throw new Error("Shop ID not found in cookies");
      }
      const data = await saleService.getSalesReport(shopId);
      setReportData(data);
    } catch (error) {
      toast.error("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  const filterSalesOverTime = () => {
    const filteredData = {};
    Object.keys(reportData.salesOverTime).forEach((date) => {
      const key =
        timeRange === "daily"
          ? date
          : timeRange === "weekly"
            ? `Week ${getWeekNumber(new Date(date))}`
            : new Date(date).getFullYear();
      filteredData[key] =
        (filteredData[key] || 0) + reportData.salesOverTime[date];
    });
    return filteredData;
  };

  const salesOverTimeData = reportData ? filterSalesOverTime() : {};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  // Chart options with consistent blue color
  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: blueBackgroundColor, // Apply consistent blue color
        },
      },
    },
  };

  // Section style with blue background color
  const sectionStyle = {
    backgroundColor: blueBackgroundColor,
    color: "white", // Ensure text is readable
    padding: "10px",
    borderRadius: "5px",
  };

  return (
    <div className="p-6 rounded-lg shadow-lg">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-black flex items-center gap-2">
            Sales Report
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              className="appearance-none px-4 py-2 pr-10 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
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

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="sticky top-0 bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metric
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 text-sm text-gray-800">
                Total Products Sold
              </td>
              <td className="px-6 py-4 text-sm text-gray-800">
                {Object.values(reportData.productSales).reduce(
                  (sum: number, p: any) => sum + (p.quantity || 0),
                  0
                )}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm text-gray-800">
                Most Used Payment Method
              </td>
              <td className="px-6 py-4 text-sm text-gray-800">
                {Object.keys(reportData.paymentMethods).reduce((a, b) =>
                  reportData.paymentMethods[a] > reportData.paymentMethods[b]
                    ? a
                    : b
                )}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm text-gray-800">
                Highest Sales Period
              </td>
              <td className="px-6 py-4 text-sm text-gray-800">
                {Object.keys(salesOverTimeData).reduce((a, b) =>
                  salesOverTimeData[a] > salesOverTimeData[b] ? a : b
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Products Sold
          </h2>
          <p className="text-gray-600 mb-4 text-lg">
            Total Products Sold:{" "}
            {Object.values(reportData.productSales).reduce(
              (sum: number, p: any) => sum + (p.quantity || 0),
              0
            )}
          </p>
          <Bar
            data={{
              labels: Object.values(reportData.productSales).map(
                (p: any) => p.name
              ),
              datasets: [
                {
                  label: "Quantity Sold",
                  data: Object.values(reportData.productSales).map(
                    (p: any) => p.quantity
                  ),
                  backgroundColor: "#6366F1",
                },
              ],
            }}
            options={{
              ...chartOptions,
              plugins: {
                legend: { display: false },
              },
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Payment Methods
          </h2>
          <p className="text-gray-600 mb-4 text-lg">
            Most Used Payment Method:{" "}
            {Object.keys(reportData.paymentMethods).reduce((a, b) =>
              reportData.paymentMethods[a] > reportData.paymentMethods[b]
                ? a
                : b
            )}
          </p>
          <Pie
            data={{
              labels: Object.keys(reportData.paymentMethods),
              datasets: [
                {
                  data: Object.values(reportData.paymentMethods),
                  backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
                },
              ],
            }}
            options={{
              ...chartOptions,
              plugins: {
                legend: { position: "bottom" },
              },
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Sales Over Time
          </h2>
          <div className="flex justify-end mb-6">
            <select
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 focus:outline-none"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <p className="text-gray-600 mb-4 text-lg">
            Highest Sales Period:{" "}
            {Object.keys(salesOverTimeData).reduce((a, b) =>
              salesOverTimeData[a] > salesOverTimeData[b] ? a : b
            )}
          </p>
          <Line
            data={{
              labels: Object.keys(salesOverTimeData),
              datasets: [
                {
                  label: "Total Sales",
                  data: Object.values(salesOverTimeData),
                  borderColor: "#10B981",
                  backgroundColor: "rgba(16, 185, 129, 0.2)",
                  fill: true,
                },
              ],
            }}
            options={{
              ...chartOptions,
              plugins: {
                legend: { display: false },
              },
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Payment Status
          </h2>
          <p className="text-gray-600 mb-4 text-lg">
            Payed: {reportData.paymentStatus.payed}, Unpayed:{" "}
            {reportData.paymentStatus.unpayed}
          </p>
          <Pie
            data={{
              labels: ["Payed", "Unpayed"],
              datasets: [
                {
                  data: [
                    reportData.paymentStatus.payed,
                    reportData.paymentStatus.unpayed,
                  ],
                  backgroundColor: ["#10B981", "#EF4444"],
                },
              ],
            }}
            options={{
              ...chartOptions,
              plugins: {
                legend: { position: "bottom" },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default withPermission(SalesReportPage, "sales.read");
