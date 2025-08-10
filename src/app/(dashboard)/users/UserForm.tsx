"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { User, CreateUserInput, UpdateUserInput, Role } from "@/types";
import { roleService } from "@/services/role.service";

const createSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  middleName: yup.string(),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: yup.string().required("Phone number is required"),
  address: yup.string(),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  roleIds: yup.array().of(yup.string()),
});

const updateSchema = yup.object({
  firstName: yup.string(),
  middleName: yup.string(),
  lastName: yup.string(),
  phoneNumber: yup.string(),
  address: yup.string(),
  isActive: yup.boolean(),
  roleIds: yup.array().of(yup.string()),
});

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function UserForm({
  user,
  onSubmit,
  onCancel,
  isEdit = false,
}: UserFormProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const formConfig = isEdit
    ? {
        resolver: yupResolver(updateSchema),
        defaultValues: user
          ? {
              firstName: user.firstName,
              middleName: user.middleName || "",
              lastName: user.lastName,
              phoneNumber: user.phoneNumber,
              address: user.address || "",
              isActive: user.isActive,
              roleIds: user.userRoles?.map((ur) => ur.roleId) || [],
            }
          : {},
      }
    : {
        resolver: yupResolver(createSchema),
        defaultValues: {},
      };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm(formConfig as any);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await roleService.getAll();
      setRoles(data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const onFormSubmit = async (data: any) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          error={errors.firstName?.message as string}
          {...register("firstName")}
        />
        <Input
          label="Middle Name"
          error={errors.middleName?.message as string}
          {...register("middleName")}
        />
      </div>

      <Input
        label="Last Name"
        error={errors.lastName?.message as string}
        {...register("lastName")}
      />

      {!isEdit && (
        <>
          <Input
            label="Email"
            type="email"
            error={errors.email?.message as string}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message as string}
            {...register("password")}
          />
        </>
      )}

      <Input
        label="Phone Number"
        error={errors.phoneNumber?.message as string}
        {...register("phoneNumber")}
      />

      <Input
        label="Address"
        error={errors.address?.message as string}
        {...register("address")}
      />

      {isEdit && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            {...register("isActive")}
          />
          <label
            htmlFor="isActive"
            className="ml-2 block text-sm text-gray-900"
          >
            Active
          </label>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Roles
        </label>
        <div className="space-y-2">
          {roles.map((role) => (
            <div key={role.id} className="flex items-center">
              <input
                type="checkbox"
                id={`role-${role.id}`}
                value={role.id}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...register("roleIds")}
              />
              <label
                htmlFor={`role-${role.id}`}
                className="ml-2 block text-sm text-gray-900"
              >
                {role.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
