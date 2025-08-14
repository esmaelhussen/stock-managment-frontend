"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { authService } from "@/services/auth.service";
import { LoginCredentials } from "@/types";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    setLoading(true);
    try {
      await authService.login(data);
      toast.success("Login successful!");
      setLoginError("");
      router.push("/dashboard");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Login failed";
      setLoginError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md md:max-w-xl md:p-17 md:min-h-[500px] animate-fade-in transition-all duration-300 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            autoComplete="email"
            {...register("email")}
            className="focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
          />

          <div className="relative group">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              error={errors.password?.message}
              autoComplete="current-password"
              {...register("password")}
              className="pr-10 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-8 text-gray-400 hover:text-indigo-500 group-hover:text-indigo-600 transition-colors"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-5.12M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.12 2.12A9.956 9.956 0 0121 12c-1.73-3.39-5.07-6-9-6-1.13 0-2.22.16-3.24.46"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.12 2.12A9.956 9.956 0 0121 12c-1.73-3.39-5.07-6-9-6-3.93 0-7.27 2.61-9 6a9.956 9.956 0 012.88 2.12"
                  />
                </svg>
              )}
            </button>
            <div className="mt-2 text-right">
              <a
                href="/forgot-password"
                className="text-sm text-indigo-600 hover:underline hover:text-indigo-800 font-medium transition-colors duration-150"
              >
                Forgot password?
              </a>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full shadow-md hover:scale-[1.04] active:scale-100 transition-transform duration-150 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold text-lg py-2 rounded-lg cursor-pointer"
            loading={loading}
          >
            Sign In
          </Button>
          {loginError && (
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
                  {loginError}
                </span>
              </div>
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-indigo-600">Email:</span>{" "}
            admin@example.com
            <br />
            <span className="font-semibold text-indigo-600">
              Password:
            </span>{" "}
            admin123
          </p>
        </div>
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
