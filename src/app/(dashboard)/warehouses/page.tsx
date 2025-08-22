"use client";

import React, { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { warehouseService } from "@/services/warehouse.service";
import { Warehouse, CreateWarehouseInput, UpdateWarehouseInput } from "@/types";
import Cookies from "js-cookie";
import withPermission from "@/hoc/withPermission";

function WarehousesPage() {
  const [allWarehouses, setAllWarehouses] = useState<Warehouse[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(14);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    address?: string;
    description?: string;
  } | null>(null);
  const total = allWarehouses.length;
  const permissions = JSON.parse(Cookies.get("permission") || "[]");

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setWarehouses(allWarehouses.slice(start, end));
  }, [allWarehouses, page, pageSize]);

  const fetchWarehouses = async () => {
    try {
      const data = await warehouseService.getAll();
      setAllWarehouses(data);
    } catch (error) {
      toast.error("Failed to fetch warehouses");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateWarehouseInput) => {
    // Validation
    const errors: { name?: string; address?: string; description?: string } =
      {};
    if (!data.name.trim()) errors.name = "Warehouse name is required";
    if (!data.address.trim()) errors.address = "Address is required";
    if (!data.description.trim())
      errors.description = "Description is required";
    setFormErrors(Object.keys(errors).length ? errors : null);
    if (Object.keys(errors).length) return;

    try {
      await warehouseService.create(data);
      toast.success("Warehouse created successfully");
      setIsCreateModalOpen(false);
      fetchWarehouses();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create warehouse"
      );
    }
  };

  const handleUpdate = async (data: UpdateWarehouseInput) => {
    if (!selectedWarehouse) return;
    try {
      await warehouseService.update(selectedWarehouse.id, data);
      toast.success("Warehouse updated successfully");
      setIsEditModalOpen(false);
      fetchWarehouses();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update warehouse"
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedWarehouse) return;
    try {
      await warehouseService.delete(selectedWarehouse.id);
      toast.success("Warehouse deleted successfully");
      setIsDeleteModalOpen(false);
      fetchWarehouses();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete warehouse"
      );
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
            Warehouses
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              className="appearance-none px-4 py-2 pr-10 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
              value={pageSize}
              onChange={(e) => {
                setPage(1);
                setPageSize(Number(e.target.value));
              }}
            >
              {[6, 10, 14].map((size) => (
                <option
                  key={size}
                  value={size}
                  className="bg-white text-black font-bold"
                >
                  {size} per page
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <svg
                className="h-4 w-4"
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
            </span>
          </div>
          {permissions.includes("warehouses.create") && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Warehouse
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
              {(permissions.includes("warehouses.update") ||
                permissions.includes("warehouses.delete")) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {warehouses.map((warehouse) => (
              <tr key={warehouse.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {warehouse.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {warehouse.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {warehouse.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    {permissions.includes("warehouses.update") && (
                      <button
                        onClick={() => {
                          setSelectedWarehouse(warehouse);
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5 cursor-pointer hover:scale-120" />
                      </button>
                    )}
                    {permissions.includes("warehouses.delete") && (
                      <button
                        onClick={() => {
                          setSelectedWarehouse(warehouse);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900 "
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
      {/* Pagination controls at the bottom of the page */}
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
          setSelectedWarehouse(null);
        }}
        title={isEditModalOpen ? "Edit Warehouse" : "Create Warehouse"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Warehouse Name"
            value={selectedWarehouse?.name || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedWarehouse((prev) => ({ ...prev, name: value }));
              setFormErrors((errors) => {
                if (!value.trim()) {
                  return { ...errors, name: "Warehouse name is required" };
                } else {
                  return { ...errors, name: undefined };
                }
              });
            }}
            error={formErrors?.name}
          />
          <Input
            label="Address"
            value={selectedWarehouse?.address || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedWarehouse((prev) => ({ ...prev, address: value }));
              setFormErrors((errors) => {
                if (!value.trim()) {
                  return { ...errors, address: "Address is required" };
                } else {
                  return { ...errors, address: undefined };
                }
              });
            }}
            error={formErrors?.address}
          />
          <Input
            label="Description"
            value={selectedWarehouse?.description || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedWarehouse((prev) => ({ ...prev, description: value }));
              setFormErrors((errors) => {
                if (!value.trim()) {
                  return { ...errors, description: "Description is required" };
                } else {
                  return { ...errors, description: undefined };
                }
              });
            }}
            error={formErrors?.description}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedWarehouse(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const data = {
                  name: selectedWarehouse?.name || "",
                  address: selectedWarehouse?.address || "",
                  description: selectedWarehouse?.description || "",
                };
                isEditModalOpen ? handleUpdate(data) : handleCreate(data);
              }}
            >
              {isEditModalOpen ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Warehouse"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this warehouse? This action cannot
            be undone.
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

export default withPermission(WarehousesPage, "warehouses.read");
