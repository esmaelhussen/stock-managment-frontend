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
  ShoppingBagIcon,
  ShoppingCartIcon,
  GiftIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import withPermission from "@/hoc/withPermission";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

function DashboardPage() {
  const { theme } = useTheme();
  const [stats, setStats] = useState([
    {
      name: "Total Users",
      value: "-",
      icon: UserGroupIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      // trend: null,
    },
    {
      name: "Active Roles",
      value: "-",
      icon: ShieldCheckIcon,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      // trend: null,
    },
    {
      name: "Permissions",
      value: "-",
      icon: KeyIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      // trend: null,
    },
    {
      name: "Warehouses",
      value: "-",
      icon: CubeIcon,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      // trend: null,
    },
    {
      name: "Categories",
      value: "-",
      icon: ArchiveBoxIcon,
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
      // trend: null,
    },
    {
      name: "Units",
      value: "-",
      icon: ScaleIcon,
      color: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-900/20",
      // trend: null,
    },
    {
      name: "Products",
      value: "-",
      icon: ShoppingBagIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      // trend: null,
    },
    {
      name: "Customers",
      value: "-",
      icon: UsersIcon,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
      // trend: null,
    },
    {
      name: "Shops",
      value: "-",
      icon: ShoppingCartIcon,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      // trend: null,
    },
    {
      name: "Brands",
      value: "-",
      icon: GiftIcon,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      // trend: null,
    },
  ]);

  useEffect(() => {
    type StatsResponse = {
      totalUsers: number;
      activeRoles: number;
      permissions: number;
      warehouses: number;
      categories: number;
      units: number;
      products: number;
      customers: number;
      shops: number;
      brands: number;
    };
    apiClient.get<StatsResponse>("dashboard/stats").then((data) => {
      setStats([
        {
          name: "Total Users",
          value: String(data.totalUsers),
          icon: UserGroupIcon,
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          // trend: 12,
        },
        {
          name: "Active Roles",
          value: String(data.activeRoles),
          icon: ShieldCheckIcon,
          color: "text-emerald-600 dark:text-emerald-400 ",
          bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
          // trend: 5,
        },
        {
          name: "Permissions",
          value: String(data.permissions),
          icon: KeyIcon,
          color: "text-purple-600 dark:text-purple-400",
          bgColor: "bg-purple-50 dark:bg-purple-900/20",
          // trend: null,
        },
        {
          name: "Warehouses",
          value: String(data.warehouses),
          icon: ArchiveBoxIcon,
          color: "text-indigo-600 dark:text-indigo-400",
          bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
          // trend: -3,
        },
        {
          name: "Categories",
          value: String(data.categories),
          icon: TagIcon,
          color: "text-pink-600 dark:text-pink-400",
          bgColor: "bg-pink-50 dark:bg-pink-900/20",
          // trend: 8,
        },
        {
          name: "Units",
          value: String(data.units),
          icon: ScaleIcon,
          color: "text-teal-600 dark:text-teal-400",
          bgColor: "bg-teal-50 dark:bg-teal-900/20",
          // trend: null,
        },
        {
          name: "Products",
          value: String(data.products),
          icon: ShoppingBagIcon,
          color: "text-orange-600 dark:text-orange-400",
          bgColor: "bg-orange-50 dark:bg-orange-900/20",
          // trend: 15,
        },
        {
          name: "Customers",
          value: String(data.customers),
          icon: UsersIcon,
          color: "text-cyan-600 dark:text-cyan-400",
          bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
          // trend: 22,
        },
        {
          name: "Shops",
          value: String(data.shops),
          icon: ShoppingCartIcon,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          // trend: -2,
        },
        {
          name: "Brands",
          value: String(data.brands),
          icon: GiftIcon,
          color: "text-yellow-600 dark:text-yellow-400",
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          // trend: 10,
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
          "rgba(59, 130, 246, 0.8)", // blue
          "rgba(16, 185, 129, 0.8)", // emerald
          "rgba(139, 92, 246, 0.8)", // purple
          "rgba(99, 102, 241, 0.8)", // indigo
          "rgba(236, 72, 153, 0.8)", // pink
          "rgba(20, 184, 166, 0.8)", // teal
          "rgba(251, 146, 60, 0.8)", // orange
          "rgba(6, 182, 212, 0.8)", // cyan
          "rgba(239, 68, 68, 0.8)", // red
          "rgba(250, 204, 21, 0.8)", // yellow
        ],
        borderColor: "rgba(255, 255, 255, 1)",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const pieOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          color: theme === "dark" ? "rgb(209, 213, 219)" : "rgb(107, 114, 128)",
          font: {
            size: 12,
            weight: 500,
            family: "'Inter', sans-serif",
          },
          boxWidth: 16,
          padding: 12,
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                return {
                  text: `${label}: ${value}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor,
                  lineWidth: data.datasets[0].borderWidth,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor:
          theme === "dark"
            ? "rgba(31, 41, 55, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
        titleColor: theme === "dark" ? "rgb(243, 244, 246)" : "rgb(17, 24, 39)",
        bodyColor: theme === "dark" ? "rgb(209, 213, 219)" : "rgb(75, 85, 99)",
        borderColor:
          theme === "dark" ? "rgb(75, 85, 99)" : "rgb(229, 231, 235)",
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          size: 14,
        },
        titleFont: {
          size: 14,
          weight: 600,
        },
      },
    },
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your inventory and business metrics in real-time
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((item) => (
          <Card
            key={item.name}
            className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 group"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {item.name}
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    {item.value}
                  </p>
                  {/*{item.trend !== null && (*/}
                  {/*  <div*/}
                  {/*    className={cn(*/}
                  {/*      "flex items-center gap-1 text-xs font-medium",*/}
                  {/*      item.trend > 0 ? "text-emerald-600" : "text-red-600",*/}
                  {/*    )}*/}
                  {/*  >*/}
                  {/*    {item.trend > 0 ? (*/}
                  {/*      <ArrowTrendingUpIcon className="h-3 w-3" />*/}
                  {/*    ) : (*/}
                  {/*      <ArrowTrendingDownIcon className="h-3 w-3" />*/}
                  {/*    )}*/}
                  {/*    <span>{Math.abs(item.trend)}%</span>*/}
                  {/*  </div>*/}
                  {/*)}*/}
                </div>
                <div
                  className={cn(
                    "rounded-lg p-3 transition-all duration-300 group-hover:scale-110",
                    item.bgColor,
                  )}
                >
                  <item.icon className={cn("h-5 w-5", item.color)} />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Welcome Card and Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Welcome Card */}
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm dark:text-gray-400">
          <CardHeader>
            <CardTitle className="text-xl ">
              Welcome to Stock Management System
            </CardTitle>
            <CardDescription>
              Enterprise-grade inventory management solution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              This comprehensive stock management system provides robust user
              management, role-based access control, and granular permission
              management. Navigate through the sidebar to manage users, roles,
              permissions and other functionalities.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats[0].value}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats[6].value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm dark:text-gray-400">
          <CardHeader>
            <CardTitle className="text-xl">System Distribution</CardTitle>
            <CardDescription>
              Visual breakdown of system components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full ">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withPermission(DashboardPage, "dashboards.read");
