"use client";

import React, { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { shopService } from "@/services/shop.service";
// import { warehouseService } from "@/services/warehouse.service";
import { Shop, CreateShopInput, UpdateShopInput } from "@/types";
import Cookies from "js-cookie";
import withPermission from "@/hoc/withPermission";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const createShopSchema = yup.object({
  name: yup.string().required("Shop name is required"),
  address: yup.string().required("Address is required"),
  description: yup.string(),
  // warehouseId: yup.string().required("Warehouse is required"),
});

const updateShopSchema = yup.object({
  name: yup.string().required("Shop name is required"),
  address: yup.string().required("Address is required"),
  description: yup.string(),
  // warehouseId: yup.string().required("Warehouse is required"),
});

export default function ShopsPage() {
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  // const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(14);
  const total = allShops.length;
  const permissions = JSON.parse(Cookies.get("permission") || "[]");

  useEffect(() => {
    fetchShops();
    // fetchWarehouses();
  }, []);

  useEffect(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setShops(allShops.slice(start, end));
  }, [allShops, page, pageSize]);

  const fetchShops = async () => {
    try {
      const data = await shopService.getAll();
      setAllShops(data);
    } catch (error) {
      toast.error("Failed to fetch shops");
    } finally {
      setLoading(false);
    }
  };

  // const fetchWarehouses = async () => {
  //   try {
  //     const data = await warehouseService.getAll();
  //     setWarehouses(data);
  //   } catch (error) {
  //     toast.error("Failed to fetch warehouses");
  //   }
  // };

  const handleCreate = async (data: CreateShopInput) => {
    try {
      await shopService.create(data);
      toast.success("Shop created successfully");
      setIsCreateModalOpen(false);
      fetchShops();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create shop");
    }
  };

  const handleUpdate = async (data: UpdateShopInput) => {
    if (!selectedShop) return;
    try {
      await shopService.update(selectedShop.id, data);
      toast.success("Shop updated successfully");
      setIsEditModalOpen(false);
      fetchShops();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update shop");
    }
  };

  const handleDelete = async () => {
    if (!selectedShop) return;
    try {
      await shopService.delete(selectedShop.id);
      toast.success("Shop deleted successfully");
      setIsDeleteModalOpen(false);
      fetchShops();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete shop");
    }
  };

  const formConfig = isEditModalOpen
    ? {
        resolver: yupResolver(updateShopSchema as any),
        defaultValues: {
          name: selectedShop?.name || "",
          address: selectedShop?.address || "",
          description: selectedShop?.description || "",
          // warehouseId: selectedShop?.warehouse?.id || "",
        },
      }
    : {
        resolver: yupResolver(createShopSchema as any),
        defaultValues: {
          name: "",
          address: "",
          description: "",
          // warehouseId: "",
        },
      };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateShopInput>({
    ...formConfig,
    resolver: formConfig.resolver as any,
  });

  const onSubmitHandler: SubmitHandler<CreateShopInput> = (data) => {
    if (isEditModalOpen) {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Shops
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {permissions.includes("shops.create") && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Shop
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              {(permissions.includes("shops.update") ||
                permissions.includes("shops.delete")) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shops.map((shop) => (
              <tr key={shop.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {shop.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {shop.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {shop.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    {permissions.includes("shops.update") && (
                      <button
                        onClick={() => {
                          setSelectedShop(shop);
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5 cursor-pointer hover:scale-120" />
                      </button>
                    )}
                    {permissions.includes("shops.delete") && (
                      <button
                        onClick={() => {
                          setSelectedShop(shop);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5 cursor-pointer hover:scale-120" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-center gap-2 py-4">
        <button
          className="px-2 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>
        {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => (
          <button
            key={i + 1}
            className={`px-2 py-1 rounded font-semibold ${
              page === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="px-2 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
          disabled={page === Math.ceil(total / pageSize) || total === 0}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedShop(null);
        }}
        title={isEditModalOpen ? "Edit Shop" : "Create Shop"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Shop Name"
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
            label="Address"
            {...register("address")}
            error={errors.address?.message}
          />
          <Input
            label="Description"
            {...register("description")}
            error={errors.description?.message}
          />
          {/* <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Warehouse
            </label>
            <select
              {...register("warehouseId")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              style={{
                color: selectedShop?.warehouse?.id ? "#000" : "#9CA3AF",
              }}
            >
              <option value="" disabled>
                Select a warehouse
              </option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
            {errors.warehouseId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.warehouseId.message}
              </p>
            )}
          </div> */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedShop(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmitHandler)}>
              {isEditModalOpen ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Shop"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this shop? This action cannot be
            undone.
          </p>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <Button
            variant="secondary"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
