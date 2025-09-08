"use client";

import React, { useState, useEffect } from "react";
import { saleService } from "@/services/sale.service";
import toast from "react-hot-toast";
import withPermission from "@/hoc/withPermission";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import Cookies from "js-cookie";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
          ["Unpayed Transactions", summary.paymentStatus?.unpayed || "-"],
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

      let currentY = 100;

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
    <div className="p-6 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <h1 className="text-3xl font-bold text-black">Sales Report</h1>
        <div className="relative">
          <select
            className=" appearance-none px-4 py-2 pr-10 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
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
              id="productsSoldChart"
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
              id="paymentMethodsChart"
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
              id="paymentStatusChart"
            />
          </div>
        </div>
      )}

      {/* Drilldown for weekly/monthly/yearly */}
      {!loading && period !== "daily" && grouped && (
        <div className="mt-10">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
            <h2 className="text-3xl font-bold text-black">Drilldown by Date</h2>
            <div className="relative">
              <select
                className="appearance-none px-4 py-2 pr-10 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
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
                    id="productsSoldChartDay"
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
                    id="paymentMethodsChartDay"
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
                    id="paymentStatusChartDay"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-4 mt-8 ">
        <button
          onClick={handlePrintSummary}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition cursor-pointer"
        >
          Print Summary Report
        </button>

        <button
          onClick={handlePrintDayReport}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition cursor-pointer"
        >
          Print Day Report
        </button>
      </div>
    </div>
  );
}

export default withPermission(SalesReportPage, "sales.read");
