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
  CreditCardIcon,
  DocumentTextIcon,
  BellIcon,
  GiftIcon,
  UsersIcon,
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
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Warehouses", href: "/warehouses", icon: ArchiveBoxIcon },
    { name: "Shops", href: "/shops", icon: ShoppingCartIcon },
    { name: "Categories", href: "/categories", icon: TagIcon },
    {
      name: "Units",
      href: "/units",
      icon: ScaleIcon, // Updated to use ScaleIcon for units
    },
    { name: "Brands", href: "/brands", icon: GiftIcon },
    { name: "Products", href: "/products", icon: ShoppingBagIcon },
    { name: "Customers", href: "/customers", icon: UsersIcon },
    {
      name: "Stock Transactions",
      href: "/stock-transactions",
      icon: ArchiveBoxIcon,
    },
    { name: "Stock", href: "/stock", icon: CubeIcon },
    {
      name: "Sales-Transactions",
      href: "/sales-transactions",
      icon: CreditCardIcon,
    },
    {
      name: "Sales-Report",
      href: "/sales-report",
      icon: DocumentTextIcon,
    },
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

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const toggleAccountMenu = () => {
    setAccountMenuOpen((prev) => !prev);
  };

  const accountLinks = [
    { name: "Users", href: "/users", icon: UserGroupIcon },
    { name: "Roles", href: "/roles", icon: ShieldCheckIcon },
    { name: "Permissions", href: "/permissions", icon: KeyIcon },
  ];

  return (
    <aside className="w-full md:w-96 flex-shrink-0 bg-white flex flex-row md:flex-col md:h-screen   md:fixed md:top-0  md:z-30 fixed">
      {/* Hamburger removed from sidebar for mobile. Only header hamburger is shown. */}

      {/* Mobile menu */}
      <nav
        className={cn(
          " absolute top-2  w-20 bg-white z-20 flex flex-col md:hidden shadow-2xl rounded-b-2xl border-t border-gray-200 transition-all duration-300",
          menuOpen
            ? "w-full h-screen opacity-100 scale-100 z-50 "
            : "max-h-0 opacity-50 scale-95 overflow-hidden "
        )}
      >
        {navigation.map((item, index) => {
          if (index === 1) {
            return (
              <div key="account-group">
                <button
                  onClick={toggleAccountMenu}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 w-full text-left text-black hover:bg-indigo-100 hover:text-indigo-700 hover:scale-105 hover:shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-indigo-700 group-hover:scale-110"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 11c1.656 0 3-1.344 3-3s-1.344-3-3-3-3 1.344-3 3 1.344 3 3 3zm0 2c-2.672 0-8 1.344-8 4v1h16v-1c0-2.656-5.328-4-8-4z"
                    />
                  </svg>
                  Account
                  <span className="ml-auto">
                    {accountMenuOpen ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-400 group-hover:text-indigo-700"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 9l6 6 6-6"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-400 group-hover:text-indigo-700"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 6l6 6-6 6"
                        />
                      </svg>
                    )}
                  </span>
                </button>
                {accountMenuOpen && (
                  <div className="ml-6 space-y-1">
                    {accountLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className={cn(
                          "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
                          pathname === link.href
                            ? "bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 text-white shadow-lg scale-105"
                            : "text-black hover:bg-indigo-100 hover:text-indigo-700 hover:scale-105 hover:shadow-md"
                        )}
                        onClick={() => setMenuOpen(false)}
                      >
                        <link.icon className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-indigo-700 group-hover:scale-110" />
                        {link.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          if (item.name === "Users" && !permission.includes("users.read"))
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
              onClick={() => setMenuOpen(false)}
            >
              {/* Only show icon once at top, not in each menu item */}
              <item.icon className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-indigo-700 group-hover:scale-110" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-1 flex-col space-y-1 px-2 py-4 overflow-hidden bg-white sticky top-16">
        {navigation.map((item, index) => {
          if (index === 1) {
            return (
              <div key="account-group">
                <button
                  onClick={toggleAccountMenu}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 w-full text-left text-black hover:bg-indigo-100 hover:text-indigo-700 hover:scale-105 hover:shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-indigo-700 group-hover:scale-110"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 11c1.656 0 3-1.344 3-3s-1.344-3-3-3-3 1.344-3 3 1.344 3 3 3zm0 2c-2.672 0-8 1.344-8 4v1h16v-1c0-2.656-5.328-4-8-4z"
                    />
                  </svg>
                  Account
                  <span className="ml-auto">
                    {accountMenuOpen ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-400 group-hover:text-indigo-700"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 9l6 6 6-6"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-400 group-hover:text-indigo-700"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 6l6 6-6 6"
                        />
                      </svg>
                    )}
                  </span>
                </button>
                {accountMenuOpen && (
                  <div className="ml-6 space-y-1">
                    {accountLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className={cn(
                          "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
                          pathname === link.href
                            ? "bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 text-white shadow-lg scale-105"
                            : "text-black hover:bg-indigo-100 hover:text-indigo-700 hover:scale-105 hover:shadow-md"
                        )}
                      >
                        <link.icon className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-indigo-700 group-hover:scale-110" />
                        {link.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          if (
            item.name === "Users" ||
            item.name === "Roles" ||
            item.name === "Permissions"
          ) {
            return null; // Skip these links as they are now under Account
          }
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
          if (
            item.name === "Customers" &&
            !permission.includes("customers.read")
          )
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
          if (
            item.name === "Sales-Transactions" &&
            !permission.includes("sales.read")
          )
            return null;
          if (
            item.name === "Sales-Report" &&
            !permission.includes("sales.read")
          )
            return null;
          if (item.name === "Brands" && !permission.includes("brands.read"))
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
