"use client";

import React from "react";
import Sidebar from "./Sidebar";
import ProfileMenu from "./ProfileMenu";
import { Toaster } from "react-hot-toast";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [hamburgerOpen, setHamburgerOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e) => {
      setHamburgerOpen(e.detail ? true : false);
    };
    window.addEventListener('openSidebarMenu', handler);
    return () => window.removeEventListener('openSidebarMenu', handler);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header always at top */}
      <header className="w-full flex items-center justify-between px-4 sm:px-6 py-4 bg-white shadow-sm border-b">
        {/* Hamburger for mobile at top left, hidden on desktop */}
        <div className="flex items-center">
          <button
            className="sm:hidden flex flex-col justify-center items-center w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 mr-2"
            aria-label="Open menu"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("openSidebarMenu", { detail: !hamburgerOpen }));
            }}
          >
            <span
              className={`block w-6 h-1 rounded bg-white mb-1 transition-all duration-300 ${hamburgerOpen ? "rotate-45 translate-y-2" : ""}`}
            ></span>
            <span
              className={`block w-6 h-1 rounded bg-white mb-1 transition-all duration-300 ${hamburgerOpen ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`block w-6 h-1 rounded bg-white transition-all duration-300 ${hamburgerOpen ? "-rotate-45 -translate-y-2" : ""}`}
            ></span>
          </button>
          {/* Hide stockme on mobile, show on desktop */}
          <Link
            href="/dashboard"
            className="focus:outline-none hidden sm:block"
          >
            <span className="text-xl font-bold text-gradient bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-wide cursor-pointer">
              stockme
            </span>
          </Link>
        </div>
        <ProfileMenu />
      </header>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="w-full  px-4 sm:px-6 md:px-8 py-4 md:py-8">
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default DashboardLayout;
