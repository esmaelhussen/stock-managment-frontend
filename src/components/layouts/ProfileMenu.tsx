import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

interface ProfileMenuProps {
  user?: { name: string; avatarUrl?: string };
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ user }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    avatarUrl?: string;
  } | null>(null);

  useEffect(() => {
    // Fetch full profile for middleName
    authService.getProfile().then((user) => {
      if (user) {
        setCurrentUser({
          name: user.firstName + (user.middleName ? " " + user.middleName : ""),
        });
      }
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          className="flex items-center gap-3 focus:outline-none cursor-pointer"
          onClick={() => setOpen((v) => !v)}
          aria-label="Open profile menu"
        >
          {/* Beautiful profile icon */}
          <svg
            className="w-10 h-10 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.657 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span className="hidden md:inline text-lg font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm capitalize">
            {currentUser?.name || "Profile"}
          </span>
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border z-50 transition-all duration-300 ease-out transform opacity-0 translate-y-2 animate-profile-menu">
            <button
              className="w-full text-left px-6 py-4 hover:bg-indigo-50 transition-colors font-semibold text-indigo-700 flex items-center gap-3 rounded-b-xl"
              onClick={() => {
                setOpen(false);
                router.push("/profile");
              }}
            >
              <svg
                className="w-6 h-6 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.657 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Profile Management
            </button>
            <button
              className="w-full text-left px-6 py-4 hover:bg-red-50 transition-colors font-semibold text-red-600 flex items-center gap-3 rounded-b-xl"
              onClick={() => {
                setOpen(false);
                authService.logout();
              }}
            >
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileMenu;
