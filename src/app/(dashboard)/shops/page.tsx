"use client";

import React, { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { shopService } from "@/services/shop.service";
import { Shop, CreateShopInput, UpdateShopInput } from "@/types";
import Cookies from "js-cookie";
import withPermission from "@/hoc/withPermission";
// import { useForm, SubmitHandler } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";

// const createShopSchema = yup.object({
//   name: yup.string().required("Shop name is required"),
//   address: yup.string().required("Address is required"),
//   description: yup.string(),
//   // warehouseId: yup.string().required("Warehouse is required"),
// });
//
// const updateShopSchema = yup.object({
//   name: yup.string().required("Shop name is required"),
//   address: yup.string().required("Address is required"),
//   description: yup.string(),
//   // warehouseId: yup.string().required("Warehouse is required"),
// });

function ShopsPage() {
  const [allShops, setAllShops] = useState<Shop[]>([]);
  // const [shops, setShops] = useState<Shop[]>([]);
  // const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    address?: string;
    description?: string;
  } | null>(null);
  const total = allShops.length;
  const permissions = JSON.parse(Cookies.get("permission") || "[]");
  const [filters, setFilters] = useState({
    name: "",
    address: "",
  });

  useEffect(() => {
    fetchShops();
    // fetchWarehouses();
  }, []);

  // useEffect(() => {
  //   const start = (page - 1) * pageSize;
  //   const end = start + pageSize;
  //   setShops(allShops.slice(start, end));
  // }, [allShops, page, pageSize]);

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
    const errors: { name?: string; address?: string; description?: string } =
      {};
    if (!data.name.trim()) errors.name = "Warehouse name is required";
    if (!data.address.trim()) errors.address = "Address is required";

    setFormErrors(Object.keys(errors).length ? errors : null);
    if (Object.keys(errors).length) return;

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

  // const formConfig = isEditModalOpen
  //   ? {
  //       resolver: yupResolver(updateShopSchema as any),
  //       defaultValues: {
  //         name: selectedShop?.name || "",
  //         address: selectedShop?.address || "",
  //         description: selectedShop?.description || "",
  //         // warehouseId: selectedShop?.warehouse?.id || "",
  //       },
  //     }
  //   : {
  //       resolver: yupResolver(createShopSchema as any),
  //       defaultValues: {
  //         name: "",
  //         address: "",
  //         description: "",
  //         // warehouseId: "",
  //       },
  //     };
  //
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  // } = useForm<CreateShopInput>({
  //   ...formConfig,
  //   resolver: formConfig.resolver as any,
  // });

  // const onSubmitHandler: SubmitHandler<CreateShopInput> = (data) => {
  //   if (isEditModalOpen) {
  //     handleUpdate(data);
  //   } else {
  //     handleCreate(data);
  //   }
  // };

  const filteredShops = allShops.filter((shop) => {
    const matchesName = shop.name
      .toLowerCase()
      .includes(filters.name.toLowerCase().trim());
    const matchesAddress = shop.address
      .toLowerCase()
      .includes(filters.address.toLowerCase().trim());
    return matchesName && matchesAddress;
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const paginated = filteredShops.slice((page - 1) * pageSize, page * pageSize);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Shops
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="">
            <select
              className="appearance-none px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-black dark:text-gray-200 font-bold bg-white dark:bg-gray-800 shadow focus:border-blue-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
              value={pageSize}
              onChange={(e) => {
                setPage(1);
                setPageSize(Number(e.target.value));
              }}
            >
              {[6, 12, 16].map((size) => (
                <option
                  key={size}
                  value={size}
                  className="bg-white dark:bg-gray-800 text-black dark:text-gray-200 font-bold"
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
          {permissions.includes("shops.create") && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Shop
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow-md">
        <div className="flex flex-col">
          <label
            htmlFor="nameFilter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Name
          </label>
          <Input
            id="nameFilter"
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            placeholder="Search by shops name"
            className="w-48 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 shadow focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-200 focus:outline-none transition duration-200 ease-in-out"
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="addressFilter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Address
          </label>
          <Input
            id="addressFilter"
            value={filters.address}
            onChange={(e) => handleFilterChange("address", e.target.value)}
            placeholder="Search by shops address"
            className="w-48 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 shadow focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-200 focus:outline-none transition duration-200 ease-in-out"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Description
              </th>
              {(permissions.includes("shops.update") ||
                permissions.includes("shops.delete")) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginated.map((shop) => (
              <tr key={shop.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {shop.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {shop.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {shop.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex space-x-2">
                    {permissions.includes("shops.update") && (
                      <button
                        onClick={() => {
                          setSelectedShop(shop);
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
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
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
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
          className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold"
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
                ? "bg-blue-600 dark:bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold"
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
          {/*<Input*/}
          {/*  label="Shop Name"*/}
          {/*  value={selectedShop?.name || ""}*/}
          {/*  /!*{...register("name")}*!/*/}
          {/*  /!*error={errors.name?.message}*!/*/}
          {/*/>*/}
          <Input
            label="Shop Name"
            value={selectedShop?.name || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedShop((prev) => ({ ...prev, name: value }));
              setFormErrors((errors) => {
                if (!value.trim()) {
                  return { ...errors, name: "Shop name is required" };
                } else {
                  return { ...errors, name: undefined };
                }
              });
            }}
            error={formErrors?.name}
          />
          {/*<Input*/}
          {/*  label="Address"*/}
          {/*  {...register("address")}*/}
          {/*  error={errors.address?.message}*/}
          {/*/>*/}

          <Input
            label="Address"
            value={selectedShop?.address || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedShop((prev) => ({ ...prev, address: value }));
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
          {/*<Input*/}
          {/*  label="Description"*/}
          {/*  {...register("description")}*/}
          {/*  error={errors.description?.message}*/}
          {/*/>*/}

          <Input
            label="Description"
            value={selectedShop?.description || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedShop((prev) => ({ ...prev, description: value }));
              // setFormErrors((errors) => {
              //   if (!value.trim()) {
              //     return { ...errors, description: "Description is required" };
              //   } else {
              //     return { ...errors, description: undefined };
              //   }
              // });
            }}
            // error={formErrors?.description}
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
            <Button
              variant="primary"
              onClick={() => {
                const data = {
                  name: selectedShop?.name || "",
                  address: selectedShop?.address || "",
                  description: selectedShop?.description || "",
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

export default withPermission(ShopsPage, "shops.read");
