"use client";

import React, { useState, useEffect } from "react";
import { saleService } from "@/services/sale.service";
import toast from "react-hot-toast";
import withPermission from "@/hoc/withPermission";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import Cookies from "js-cookie";

type Period = "daily" | "weekly" | "monthly" | "yearly";

const blueBackgroundColor = "#2980B9";

function SalesReportPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("daily");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData(period);
  }, [period]);

  const fetchReportData = async (selectedPeriod: Period) => {
    setLoading(true);
    try {
      const shopId = Cookies.get("shopId");
      if (!shopId) throw new Error("Shop ID not found in cookies");

      const res = await saleService.getSalesReport(shopId, selectedPeriod);
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

  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: blueBackgroundColor,
        },
      },
    },
  };

  const summary = reportData?.summary || reportData; // backend may return grouped+summary
  const grouped = reportData?.grouped;

  return (
    <div className="p-6 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <h1 className="text-3xl font-bold text-black">Sales Report</h1>
        <select
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow"
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-64">Loading...</div>
      )}

      {/* No Data */}
      {!loading && !reportData && (
        <div className="text-center text-gray-500 italic mb-8">
          No report found for this period
        </div>
      )}

      {/* Summary Section */}
      {!loading && summary && (
        <div className="overflow-x-auto mb-8">
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
                  Total Transactions
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {summary.totals?.totalTransactions || 0}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-800">
                  Total Quantity
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {summary.totals?.totalQuantity || 0}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-800">Total Price</td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {summary.totals?.totalPrice || 0} Birr
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-800">
                  Most Used Payment Method
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {summary.mostUsedPaymentMethod || "-"}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-800">
                  Unpayed Transactions
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {summary.paymentStatus.unpayed || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Charts */}
      {!loading && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Product Sales */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-black">
              Products Sold
            </h2>
            <Pie
              data={{
                labels: Object.values(summary.productSales || {}).map(
                  (p: any) => p.name,
                ),
                datasets: [
                  {
                    data: Object.values(summary.productSales || {}).map(
                      (p: any) => p.quantity,
                    ),
                    backgroundColor: [
                      "#FF6384",
                      "#36A2EB",
                      "#FFCE56",
                      "#4BC0C0",
                      "#9966FF",
                      "#FF9F40",
                      "#de4321",
                      "#21de43",
                      "#2143de",
                      "#de2143",
                      "#43de21",
                      "#a834cd",
                      "#cd34a8",
                      "#34cda8",
                      "#a8cd34",
                      "#cd8a34",
                      "#348acd",
                    ],
                  },
                ],
              }}
              options={{
                ...chartOptions,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-black">
              Payment Methods
            </h2>
            <Pie
              data={{
                labels: Object.keys(summary.paymentMethods || {}),
                datasets: [
                  {
                    data: Object.values(summary.paymentMethods || {}),
                    backgroundColor: [
                      "#FF6384",
                      "#36A2EB",
                      "#FFCE56",
                      "#4BC0C0",
                      "#9966FF",
                      "#FF9F40",
                      "#de4321",
                      "#21de43",
                      "#2143de",
                      "#de2143",
                      "#43de21",
                    ],
                  },
                ],
              }}
              options={{
                ...chartOptions,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>

          {/* Payment Status */}
          <div className="bg-white p-6 rounded-lg shadow-lg ">
            <h2 className="text-2xl font-bold  text-black">Payment Status</h2>
            <Bar
              data={{
                labels: ["Payed", "Unpayed"],
                datasets: [
                  {
                    label: "Count",
                    data: [
                      summary.paymentStatus?.payed || 0,
                      summary.paymentStatus?.unpayed || 0,
                    ],
                    backgroundColor: ["#10B981", "#EF4444"],
                  },
                ],
              }}
              options={{
                ...chartOptions,
                plugins: { legend: { display: false } },
              }}
              className="mt-28"
            />
          </div>
        </div>
      )}

      {/* Drilldown for weekly/monthly/yearly */}
      {!loading && period !== "daily" && grouped && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4 text-black">
            Drilldown by Date
          </h2>
          <select
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow mb-6"
            value={selectedDate || ""}
            onChange={(e) => setSelectedDate(e.target.value || null)}
          >
            <option value="">Select a date</option>
            {Object.keys(grouped).map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>

          {selectedDate && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold mb-4 text-black">
                Report for {selectedDate}
              </h3>

              {/* Summary Section */}
              <div className="overflow-x-auto mb-8">
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
                        Total Transactions
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {grouped[selectedDate]?.totals?.totalTransactions || 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        Total Quantity
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {grouped[selectedDate]?.totals?.totalQuantity || 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        Total Price
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {grouped[selectedDate]?.totals?.totalPrice || 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        Most Used Payment Method
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {grouped[selectedDate]?.mostUsedPaymentMethod || ""}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        Unpayed Transactions
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {grouped[selectedDate]?.paymentStatus.unpayed || 0}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {/* Product Sales */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold mb-4 text-black">
                    Products Sold
                  </h2>
                  <Pie
                    data={{
                      labels: Object.values(
                        grouped[selectedDate]?.productSales || {},
                      ).map((p: any) => p.name),
                      datasets: [
                        {
                          data: Object.values(
                            grouped[selectedDate]?.productSales || {},
                          ).map((p: any) => p.quantity),
                          backgroundColor: [
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                            "#FF9F40",
                          ],
                        },
                      ],
                    }}
                    options={{
                      ...chartOptions,
                      plugins: { legend: { position: "bottom" } },
                    }}
                  />
                </div>

                {/* Payment Methods */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold mb-4 text-black">
                    Payment Methods
                  </h2>
                  <Pie
                    data={{
                      labels: Object.keys(
                        grouped[selectedDate]?.paymentMethods || {},
                      ),
                      datasets: [
                        {
                          data: Object.values(
                            grouped[selectedDate]?.paymentMethods || {},
                          ),
                          backgroundColor: [
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                            "#FF9F40",
                          ],
                        },
                      ],
                    }}
                    options={{
                      ...chartOptions,
                      plugins: { legend: { position: "bottom" } },
                    }}
                  />
                </div>

                {/* Payment Status */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold mb-4 text-black">
                    Payment Status
                  </h2>
                  <Bar
                    data={{
                      labels: ["Payed", "Unpayed"],
                      datasets: [
                        {
                          label: "Count",
                          data: [
                            grouped[selectedDate]?.paymentStatus?.payed || 0,
                            grouped[selectedDate]?.paymentStatus?.unpayed || 0,
                          ],
                          backgroundColor: ["#10B981", "#EF4444"],
                        },
                      ],
                    }}
                    options={{
                      ...chartOptions,
                      plugins: { legend: { display: false } },
                    }}
                    className="mt-28"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default withPermission(SalesReportPage, "sales.read");
