"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ProfileMenu from "./ProfileMenu";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col ">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm mb-4">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              {/* Logo for mobile */}
              <Link href="/dashboard" className="md:hidden">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  StockMe
                </span>
              </Link>

              {/* Page Title area - can be populated by pages */}
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Stock Management System
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ProfileMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          className: "",
          style: {
            background: "white",
            color: "#363636",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            borderRadius: "0.5rem",
            border: "1px solid #e5e7eb",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "white",
            },
          },
        }}
      />
    </div>
  );
};

export default DashboardLayout;
