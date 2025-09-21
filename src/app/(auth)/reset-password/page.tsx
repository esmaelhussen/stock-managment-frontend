"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { cn } from "@/utils/cn";
import { authService } from "@/services/auth.service";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  React.useEffect(() => {
    const urlToken = searchParams.get("token");
    if (typeof window !== "undefined" && urlToken) {
      setToken(urlToken);
      const url = window.location.pathname;
      window.history.replaceState({}, "", url);
    }
  }, [searchParams]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!token || typeof token !== "string" || token.trim() === "") {
      setError(
        "Invalid or missing reset token. Please use the link from your email."
      );
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setSuccess("Password has been reset successfully.");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md md:max-w-xl md:p-17 md:min-h-[500px] animate-fade-in transition-all duration-300 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">Enter your new password below</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="New Password"
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
          />
          <Button
            type="submit"
            className="w-full shadow-md hover:scale-[1.04] active:scale-100 transition-transform duration-150 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold text-lg py-2 rounded-lg cursor-pointer"
            loading={loading}
          >
            Reset Password
          </Button>
          {error && (
            <div className="mt-6 flex justify-center">
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 shadow-sm animate-fade-in">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                  />
                </svg>
                <span className="text-red-700 font-semibold text-base">
                  {error}
                </span>
              </div>
            </div>
          )}
          {success && (
            <div className="mt-6 flex justify-center">
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 shadow-sm animate-fade-in">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-green-700 font-semibold text-base">
                  {success}
                </span>
              </div>
            </div>
          )}
        </form>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
