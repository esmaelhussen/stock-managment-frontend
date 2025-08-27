"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  KeyIcon,
  ArrowLeftOnRectangleIcon,
  ArchiveBoxIcon,
  TagIcon,
  CubeIcon,
  ScaleIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { authService } from "@/services/auth.service";
import { cn } from "@/utils/cn";
import Cookies from "js-cookie";

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const user = authService.getCurrentUser();
  const permission = JSON.parse(Cookies.get("permission"));
  console.log("permission", permission);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Users", href: "/users", icon: UserGroupIcon },
    { name: "Roles", href: "/roles", icon: ShieldCheckIcon },
    { name: "Permissions", href: "/permissions", icon: KeyIcon },
    { name: "Warehouses", href: "/warehouses", icon: ArchiveBoxIcon },
    { name: "Shops", href: "/shops", icon: ShoppingCartIcon },
    { name: "Categories", href: "/categories", icon: TagIcon },
    {
      name: "Units",
      href: "/units",
      icon: ScaleIcon, // Updated to use ScaleIcon for units
    },
    { name: "Products", href: "/products", icon: ShoppingBagIcon },
    {
      name: "Stock Transactions",
      href: "/stock-transactions",
      icon: ArchiveBoxIcon,
    },
    { name: "Stock", href: "/stock", icon: CubeIcon },
  ];

  const handleLogout = () => {
    authService.logout();
  };

  const [menuOpen, setMenuOpen] = useState(false);

  // Listen for custom event from header hamburger
  React.useEffect(() => {
    const handler = (e) => {
      setMenuOpen(e.detail ? true : false);
    };
    window.addEventListener("openSidebarMenu", handler);
    return () => window.removeEventListener("openSidebarMenu", handler);
  }, []);

  // Sync hamburger icon in header when sidebar closes
  React.useEffect(() => {
    if (!menuOpen) {
      window.dispatchEvent(
        new CustomEvent("openSidebarMenu", { detail: false })
      );
    }
  }, [menuOpen]);

  return (
    <aside className="w-full md:w-96 flex-shrink-0 bg-white flex flex-row md:flex-col md:h-auto h-16 relative">
      {/* Hamburger removed from sidebar for mobile. Only header hamburger is shown. */}

      {/* Mobile menu */}
      <nav
        className={cn(
          "absolute top-16 left-0 w-full bg-white z-20 flex flex-col md:hidden shadow-2xl rounded-b-2xl border-t border-gray-200 transition-all duration-300",
          menuOpen
            ? "max-h-96 opacity-100 scale-100"
            : "max-h-0 opacity-0 scale-95 overflow-hidden"
        )}
      >
        {navigation.map((item, idx) => {
          if (item.name === "Users" && !permission.includes("users.read"))
            return null;

          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-6 py-4 text-lg font-semibold rounded-xl transition-all duration-200 mb-2 mx-2",
                isActive
                  ? "bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 text-white shadow-lg scale-105"
                  : "text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 hover:scale-105 hover:shadow-md"
              )}
              onClick={() => setMenuOpen(false)}
            >
              {/* Only show icon once at top, not in each menu item */}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-1 flex-col space-y-1 px-2 py-4 overflow-hidden bg-white sticky top-16">
        {navigation.map((item) => {
          if (item.name === "Users" && !permission.includes("users.read"))
            return null;
          if (item.name === "Roles" && !permission.includes("roles.read"))
            return null;
          if (
            item.name === "Permissions" &&
            !permission.includes("permissions.read")
          )
            return null;
          if (
            item.name === "Warehouses" &&
            !permission.includes("warehouses.read")
          )
            return null;
          if (
            item.name === "Categories" &&
            !permission.includes("categories.read")
          )
            return null;
          if (item.name === "Units" && !permission.includes("units.read"))
            return null;
          if (item.name === "Products" && !permission.includes("products.read"))
            return null;
          if (item.name === "Stock" && !permission.includes("stock.read"))
            return null;
          if (
            item.name === "Dashboard" &&
            !permission.includes("dashboards.read")
          )
            return null;
          if (item.name === "Shops" && !permission.includes("shops.read"))
            return null;

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 text-white shadow-lg scale-105"
                  : "text-black hover:bg-indigo-100 hover:text-indigo-700 hover:scale-105 hover:shadow-md"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-6 w-6 flex-shrink-0",
                  isActive
                    ? "text-white drop-shadow"
                    : "text-gray-400 group-hover:text-indigo-700 group-hover:scale-110"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User info and logout for desktop */}
      <div className="hidden md:block border-t border-gray-700 p-4 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-md font-bold text-black capitalize">
                {user?.firstName}
              </p>
              <p className="text-sm text-black">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-black transition-colors hover:cursor-pointer"
          >
            <ArrowLeftOnRectangleIcon className="h-8 w-9 " title="Logout" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
