"use client";

import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);
import { apiClient } from "@/lib/api";
import {
  UserGroupIcon,
  ShieldCheckIcon,
  KeyIcon,
  CubeIcon,
  ArchiveBoxIcon,
  TagIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const [stats, setStats] = useState([
    {
      name: "Total Users",
      value: "-",
      icon: UserGroupIcon,
      color: "bg-blue-500",
    },
    {
      name: "Active Roles",
      value: "-",
      icon: ShieldCheckIcon,
      color: "bg-green-500",
    },
    { name: "Permissions", value: "-", icon: KeyIcon, color: "bg-purple-500" },
    { name: "Stock Items", value: "-", icon: CubeIcon, color: "bg-yellow-500" },
    {
      name: "Warehouses",
      value: "-",
      icon: CubeIcon,
      color: "bg-indigo-500",
    },
    {
      name: "Categories",
      value: "-",
      icon: ArchiveBoxIcon,
      color: "bg-pink-500",
    },
    {
      name: "Units",
      value: "-",
      icon: ScaleIcon,
      color: "bg-teal-500",
    },
  ]);

  useEffect(() => {
    type StatsResponse = {
      totalUsers: number;
      activeRoles: number;
      permissions: number;
      stockItems: number;
      warehouses: number;
      categories: number;
      units: number;
    };
    apiClient.get<StatsResponse>("dashboard/stats").then((data) => {
      setStats([
        {
          name: "Total Users",
          value: String(data.totalUsers),
          icon: UserGroupIcon,
          color: "bg-blue-500",
        },
        {
          name: "Active Roles",
          value: String(data.activeRoles),
          icon: ShieldCheckIcon,
          color: "bg-green-500",
        },
        {
          name: "Permissions",
          value: String(data.permissions),
          icon: KeyIcon,
          color: "bg-purple-500",
        },
        {
          name: "Warehouses",
          value: String(data.warehouses),
          icon: ArchiveBoxIcon,
          color: "bg-indigo-500",
        },
        {
          name: "Categories",
          value: String(data.categories),
          icon: TagIcon,
          color: "bg-pink-500",
        },
        {
          name: "Units",
          value: String(data.units),
          icon: ScaleIcon,
          color: "bg-teal-500",
        },
        {
          name: "Stock Items",
          value: String(data.stockItems),
          icon: CubeIcon,
          color: "bg-yellow-500",
        },
      ]);
    });
  }, []);

  // Prepare pie chart data
  const pieData = {
    labels: stats.map((item) => item.name),
    datasets: [
      {
        label: "Count",
        data: stats.map((item) => Number(item.value) || 0),
        backgroundColor: [
          "#3b82f6", // blue
          "#22c55e", // green
          "#a21caf", // purple
          "#6366f1",
          "#ec4899", // pink for categories
          "#14b8a6", // teal for units
          "#eab308", // yellow
          // indigo for warehouses
        ],
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "right" as const,
        labels: {
          color: "#334155",
          font: { size: 14, weight: "bold" as const },
          boxWidth: 18,
          padding: 18,
        },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#334155",
        bodyColor: "#334155",
        borderColor: "#3b82f6",
        borderWidth: 1,
      },
    },
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-gradient bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-wide drop-shadow-lg mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="bg-white overflow-hidden rounded-lg shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${item.color} rounded-md p-3`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {item.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Welcome to Stock Management System
        </h2>
        <p className="text-gray-600">
          This is a comprehensive stock management system with user management,
          role-based access control, and permission management. Navigate through
          the sidebar to manage users, roles, and permissions.
        </p>
      </div>

      {/* Interactive Pie Chart */}
      <div className="mt-16 w-full">
        <div className="bg-white shadow rounded-lg p-8 flex flex-col  w-full">
          <div className="w-full flex justify-center">
            <h3 className="text-lg font-bold text-gray-800 mb-4 ">
              System Overview
            </h3>
          </div>
          <div
            className="w-full pl-20"
            style={{
              minHeight: 220,
              height: "30vw",
              maxHeight: "40vh",
              overflow: "hidden",
              alignItems: "center",
            }}
          >
            <Pie
              data={pieData}
              options={{ ...pieOptions, maintainAspectRatio: false }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
