"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  Role,
  Warehouse,
  Shop,
} from "@/types";
import { roleService } from "@/services/role.service";
import { warehouseService } from "@/services/warehouse.service";
import { shopService } from "@/services/shop.service";

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
  roleIds: yup
    .array()
    .of(yup.string())
    .min(1, "At least one role must be selected"),
  warehouseId: yup
    .string()
    .required("Warehouse is required for warehouse role"),
  shopId: yup.string().required("Shop is required for shop role"),
  // warehouseId: yup.string().when("roleIds", {
  //   is: (roleIds: string[]) => roleIds.some((role) => role === "shop"),
  //   then: (schema) => schema.required("Warehouse is required for shop role"),
  //   otherwise: (schema) => schema.nullable(),
  // }),
});

const updateSchema = yup.object({
  firstName: yup.string(),
  middleName: yup.string(),
  lastName: yup.string(),
  phoneNumber: yup.string(),
  address: yup.string(),
  isActive: yup.boolean(),
  roleIds: yup.array().of(yup.string()),
  warehouseId: yup.array().of(yup.string()),
  shopId: yup.array().of(yup.string()),
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
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [hasWarehouseRole, setHasWarehouseRole] = useState(false);
  const [hasShopRole, setHasShopRole] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");

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
              warehouseId: user.warehouseId || "",
              shopId: user.shopId || "",
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
    watch,
    formState: { errors },
  } = useForm(formConfig as any);

  const watchedRoleIds = watch("roleIds");

  useEffect(() => {
    fetchRoles();
    fetchWarehouses();
    fetchShops();
  }, []);

  useEffect(() => {
    if (watchedRoleIds && roles.length > 0) {
      const selectedRoleObjects = roles.filter((role) =>
        watchedRoleIds.includes(role.id)
      );
      const hasWarehouse = selectedRoleObjects.some((role) =>
        role.name.toLowerCase().includes("warehouse")
      );
      const hasShop = selectedRoleObjects.some((role) =>
        role.name.toLowerCase().includes("shop")
      );
      setHasWarehouseRole(hasWarehouse);
      setHasShopRole(hasShop);
      setSelectedRoles(watchedRoleIds);
    } else {
      setHasWarehouseRole(false);
      setHasShopRole(false);
      setSelectedRoles([]);
    }
  }, [watchedRoleIds, roles]);

  // useEffect(() => {
  //   if (hasShopRole && formConfig.defaultValues?.warehouseId) {
  //     fetchShops(formConfig.defaultValues.warehouseId);
  //   }
  // }, [hasShopRole, formConfig.defaultValues?.warehouseId]);

  const fetchRoles = async () => {
    try {
      const data = await roleService.getAll();
      setRoles(data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await warehouseService.getAll();
      setWarehouses(data);
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
    }
  };

  const fetchShops = async () => {
    try {
      const data = await shopService.getAll();
      setShops(data);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    }
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const onFormSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (hasWarehouseRole && !hasShopRole) {
        // Only keep warehouseId
        delete data.shopId;
      } else if (hasShopRole && !hasWarehouseRole) {
        // Only keep shopId
        delete data.warehouseId;
      } else if (!hasWarehouseRole && !hasShopRole) {
        // Remove both if neither role applies
        delete data.warehouseId;
        delete data.shopId;
      }
      await onSubmit(data);
      console.log("Form submitted successfully:", data);
    } finally {
      setLoading(false);
    }
  };

  // const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const warehouseId = e.target.value;
  //   if (warehouseId) {
  //     fetchShops(warehouseId);
  //   }
  // };

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
          Roles<span className="text-red-500">*</span>
        </label>
        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
          <div className="relative mb-4">
            <Input
              type="text"
              placeholder="Search roles..."
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
            />
            {/* <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span> */}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map((role) => (
              <label
                htmlFor={`role-${role.id}`}
                key={role.id}
                className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg shadow-md transition duration-150 ease-in-out"
              >
                {/* <div key={role.id} className="flex items-center"> */}
                <input
                  type="checkbox"
                  id={`role-${role.id}`}
                  value={role.id}
                  className="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  {...register("roleIds")}
                />

                <span className="text-sm font-medium text-gray-700">
                  {role.name}
                </span>
                {/* </div> */}
              </label>
            ))}
          </div>
        </div>
        {errors.roleIds && (
          <div className="text-red-500 text-sm mt-2">
            {"At least one role must be selected" as string}
          </div>
        )}
      </div>

      {hasWarehouseRole && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Warehouse <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-black bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
            {...register("warehouseId", {
              required: hasWarehouseRole
                ? "Warehouse is required for selected role"
                : false,
            })}
            // onChange={handleWarehouseChange}
          >
            <option value="">Select a Warehouse</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
          {errors.warehouseId && (
            <div className="text-red-500 text-sm mt-2">
              {"Warehouse name is required for warehouse role" as string}
            </div>
          )}
        </div>
      )}

      {hasShopRole && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-black bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
            {...register("shopId", {
              required: hasShopRole
                ? "Shop is required for selected role"
                : false,
            })}
          >
            <option value="">Select a Shop</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
          {errors.shopId && (
            <div className="text-red-500 text-sm mt-2">
              {errors.shopId.message as string}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="cursor-pointer"
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="cursor-pointer">
          {isEdit ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
