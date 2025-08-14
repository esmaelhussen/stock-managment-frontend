"use client";

import React, { use, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess("If your email exists, a reset link has been sent.");
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
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-600 mt-2">
            Enter your email to receive a reset link
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
          />
          <div className="mt-2 text-right">
            <a
              href="/login"
              className="text-sm text-indigo-600 hover:underline hover:text-indigo-800 font-medium transition-colors duration-150"
            >
              Back to login
            </a>
          </div>
          <Button
            type="submit"
            className="w-full shadow-md hover:scale-[1.04] active:scale-100 transition-transform duration-150 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold text-lg py-2 rounded-lg cursor-pointer"
            loading={loading}
          >
            Send Reset Link
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
