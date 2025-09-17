"use client";

import React, { useState, useEffect, useRef } from "react";
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
  GiftIcon,
  UsersIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import { authService } from "@/services/auth.service";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeContext";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const pathname = usePathname();
  const user = authService.getCurrentUser();
  const permission = JSON.parse(Cookies.get("permission"));
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(isCollapsed);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const productsDropdownRef = useRef<HTMLDivElement>(null);

  // Close account dropdown when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
  //       setAccountMenuOpen(false);
  //     }
  //   };
  //
  //   if (accountMenuOpen) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   }
  //
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [accountMenuOpen]);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: HomeIcon,
      permission: "dashboards.read",
    },
    {
      name: "Warehouses",
      href: "/warehouses",
      icon: ArchiveBoxIcon,
      permission: "warehouses.read",
    },
    {
      name: "Shops",
      href: "/shops",
      icon: ShoppingCartIcon,
      permission: "shops.read",
    },
    {
      name: "Customers",
      href: "/customers",
      icon: UsersIcon,
      permission: "customers.read",
    },
    {
      name: "Stock Transactions",
      href: "/stock-transactions",
      icon: ArchiveBoxIcon,
      permission: "stock.read",
    },
    { name: "Stock", href: "/stock", icon: CubeIcon, permission: "stock.read" },
    {
      name: "Sales Transactions",
      href: "/sales-transactions",
      icon: CreditCardIcon,
      permission: "sales.read",
    },
    {
      name: "Sales Report",
      href: "/sales-report",
      icon: DocumentTextIcon,
      permission: "sales.read",
    },
  ];

  const productsLinks = [
    {
      name: "Categories",
      href: "/categories",
      icon: TagIcon,
      permission: "categories.read",
    },
    {
      name: "Units",
      href: "/units",
      icon: ScaleIcon,
      permission: "units.read",
    },
    {
      name: "Brands",
      href: "/brands",
      icon: GiftIcon,
      permission: "brands.read",
    },
    {
      name: "Products",
      href: "/products",
      icon: ShoppingBagIcon,
      permission: "products.read",
    },
  ];

  const accountLinks = [
    {
      name: "Users",
      href: "/users",
      icon: UserGroupIcon,
      permission: "users.read",
    },
    {
      name: "Roles",
      href: "/roles",
      icon: ShieldCheckIcon,
      permission: "roles.read",
    },
    {
      name: "Permissions",
      href: "/permissions",
      icon: KeyIcon,
      permission: "permissions.read",
    },
  ];

  const handleLogout = () => {
    authService.logout();
  };

  const filteredNavigation = navigation.filter(
    (item) => !item.permission || permission?.includes(item.permission),
  );

  const filteredProductsLinks = productsLinks.filter(
    (item) => !item.permission || permission?.includes(item.permission),
  );

  const filteredAccountLinks = accountLinks.filter(
    (item) => !item.permission || permission?.includes(item.permission),
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-white shadow-md hover:shadow-lg"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out",
          desktopCollapsed ? "md:w-20" : "md:w-72",
          "w-72",
          "md:translate-x-0",
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            {!desktopCollapsed ? (
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Stock Management
              </h2>
            ) : (
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                SM
              </h2>
            )}
            <div className="flex items-center gap-1">
              {!desktopCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                >
                  {theme === "light" ? (
                    <MoonIcon className="h-5 w-5" />
                  ) : (
                    <SunIcon className="h-5 w-5" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setDesktopCollapsed(!desktopCollapsed);
                  onToggleCollapse?.();
                }}
                className="hidden md:flex hover:bg-gray-100 dark:hover:bg-gray-800"
                title={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {desktopCollapsed ? (
                  <ChevronRightIcon className="h-5 w-5" />
                ) : (
                  <ChevronLeftIcon className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-1">
              {/* Dashboard Link - First */}
              {filteredNavigation
                .filter((item) => item.name === "Dashboard")
                .map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 border-l-4 border-transparent",
                        desktopCollapsed && "md:justify-center md:px-2",
                      )}
                      title={desktopCollapsed ? item.name : ""}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className={cn(desktopCollapsed && "md:hidden")}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}

              {/* Products Dropdown - Second */}
              {filteredProductsLinks.length > 0 && (
                <div className="relative" ref={productsDropdownRef}>
                  <button
                    onClick={() => setProductsMenuOpen(!productsMenuOpen)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                      productsMenuOpen && "bg-accent",
                      desktopCollapsed && "md:justify-center md:px-2",
                    )}
                    title={desktopCollapsed ? "Products" : ""}
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBagIcon className="h-5 w-5" />
                      {!desktopCollapsed && <span>Products</span>}
                    </div>
                    {!desktopCollapsed &&
                      (productsMenuOpen ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      ))}
                  </button>
                  {productsMenuOpen && (
                    <div
                      className={cn(
                        desktopCollapsed
                          ? "md:absolute md:left-full md:top-0 md:ml-2 md:w-48 md:bg-white md:dark:bg-gray-900 md:border md:border-gray-200 md:dark:border-gray-700 md:rounded-lg md:shadow-lg md:p-2 ml-8 mt-1 space-y-1"
                          : "ml-8 mt-1 space-y-1",
                      )}
                    >
                      {filteredProductsLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                          <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => {
                              setMobileMenuOpen(false);
                            }}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                              isActive
                                ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 border-l-4 border-transparent",
                            )}
                          >
                            <link.icon className="h-4 w-4" />
                            <span>{link.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Account Dropdown - Third */}
              {filteredAccountLinks.length > 0 && (
                <div className="relative" ref={accountDropdownRef}>
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                      accountMenuOpen && "bg-accent",
                      desktopCollapsed && "md:justify-center md:px-2",
                    )}
                    title={desktopCollapsed ? "Account" : ""}
                  >
                    <div className="flex items-center gap-3">
                      <UserGroupIcon className="h-5 w-5" />
                      {!desktopCollapsed && <span>Account</span>}
                    </div>
                    {!desktopCollapsed &&
                      (accountMenuOpen ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      ))}
                  </button>
                  {accountMenuOpen && (
                    <div
                      className={cn(
                        desktopCollapsed
                          ? "md:absolute md:left-full md:top-0 md:ml-2 md:w-48 md:bg-white md:dark:bg-gray-900 md:border md:border-gray-200 md:dark:border-gray-700 md:rounded-lg md:shadow-lg md:p-2 ml-8 mt-1 space-y-1"
                          : "ml-8 mt-1 space-y-1",
                      )}
                    >
                      {filteredAccountLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                          <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => {
                              setMobileMenuOpen(false);
                            }}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                              isActive
                                ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 border-l-4 border-transparent",
                            )}
                          >
                            <link.icon className="h-4 w-4" />
                            <span>{link.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Rest of Main Navigation */}
              {filteredNavigation
                .filter((item) => item.name !== "Dashboard")
                .map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 border-l-4 border-transparent",
                        desktopCollapsed && "md:justify-center md:px-2",
                      )}
                      title={desktopCollapsed ? item.name : ""}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className={cn(desktopCollapsed && "md:hidden")}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
            </div>
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div
              className={cn(
                "flex items-center",
                desktopCollapsed ? "md:justify-center" : "justify-between",
              )}
            >
              {!desktopCollapsed ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {user?.firstName?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate capitalize text-gray-900 dark:text-gray-100">
                        {user?.firstName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="hover:bg-destructive/10 hover:text-destructive"
                    title="Logout"
                  >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="hover:bg-destructive/10 hover:text-destructive"
                  title="Logout"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Content Spacer for Desktop */}
      <div
        className={cn(
          "hidden md:block flex-shrink-0 transition-all duration-300",
          desktopCollapsed ? "w-20" : "w-72",
        )}
      />
    </>
  );
};

export default Sidebar;
