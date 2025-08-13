"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import toast from "react-hot-toast";

export default function ProfilePage() {
  React.useEffect(() => {
    async function fetchProfile() {
      try {
        const user = await authService.getProfile();
        setForm((prev) => ({
          ...prev,
          firstName: user.firstName || "",
          middleName: user.middleName || "",
          lastName: user.lastName || "",
          phoneNumber: user.phoneNumber || "",
          address: user.address || "",
          email: user.email || ""
        }));
      } catch {}
    }
    fetchProfile();
  }, []);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    email: "",
    password: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser?.id) throw new Error("User not found");
      await userService.update(currentUser.id, {
        firstName: form.firstName ?? "",
        middleName: form.middleName ?? "",
        lastName: form.lastName ?? "",
        phoneNumber: form.phoneNumber ?? "",
        address: form.address ?? "",
      });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser?.id) throw new Error("User not found");
      await userService.changePassword(
        currentUser.id,
        form.password,
        form.newPassword
      );
      toast.success("Password changed successfully");
      setForm({
        ...form,
        password: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">Profile Management</h1>
      <div className="flex flex-col md:flex-row gap-8 justify-between">
        <form onSubmit={handleUpdateProfile} className="space-y-4 flex-1 bg-gray-50 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Current Credentials</h2>
          <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
          <Input label="Middle Name" name="middleName" value={form.middleName} onChange={handleChange} />
          <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required />
          <Input label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
          <Input label="Address" name="address" value={form.address} onChange={handleChange} />
          <Input label="Email" name="email" type="email" value={form.email || ""} onChange={handleChange} disabled />
          <Button type="submit" loading={loading} className="w-full font-bold">Update Profile</Button>
        </form>
        <form onSubmit={handleChangePassword} className="space-y-4 flex-1 bg-gray-50 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Change Password</h2>
          <Input label="Current Password" name="password" type="password" value={form.password} onChange={handleChange} required />
          <Input label="New Password" name="newPassword" type="password" value={form.newPassword} onChange={handleChange} required />
          <Input label="Confirm New Password" name="confirmNewPassword" type="password" value={form.confirmNewPassword} onChange={handleChange} required />
          <Button type="submit" loading={loading} className="w-full font-bold bg-blue-600 text-white">Change Password</Button>
        </form>
      </div>
    </div>
  );
}
