"use client";

import React from "react";
import {
  UserGroupIcon,
  ShieldCheckIcon,
  KeyIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const stats = [
    {
      name: "Total Users",
      value: "0",
      icon: UserGroupIcon,
      color: "bg-blue-500",
    },
    {
      name: "Active Roles",
      value: "3",
      icon: ShieldCheckIcon,
      color: "bg-green-500",
    },
    { name: "Permissions", value: "16", icon: KeyIcon, color: "bg-purple-500" },
    { name: "Stock Items", value: "0", icon: CubeIcon, color: "bg-yellow-500" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

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
    </div>
  );
}
