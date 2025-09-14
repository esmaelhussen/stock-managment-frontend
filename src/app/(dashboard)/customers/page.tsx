"use client";

import React, { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { customerService } from "@/services/customer.service";
import { Customer, CreateCustomerInput, UpdateCustomerInput } from "@/types";
import Cookies from "js-cookie";
import withPermission from "@/hoc/withPermission";

function CustomersPage() {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<{ name?: string } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const total = allCustomers.length;
  const permissions = JSON.parse(Cookies.get("permission") || "[]");
  const [filters, setFilters] = useState({
    name: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getAll();
      setAllCustomers(data);
    } catch (error) {
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateCustomerInput) => {
    const errors: { name?: string } = {};
    if (!data.name?.trim()) errors.name = "Customer name is required";
    setFormErrors(Object.keys(errors).length ? errors : null);
    if (Object.keys(errors).length) return;
    try {
      await customerService.create(data);
      toast.success("Customer created successfully");
      setIsCreateModalOpen(false);
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create customer");
    }
  };

  const handleUpdate = async (data: UpdateCustomerInput) => {
    if (!selectedCustomer) return;
    try {
      await customerService.update(selectedCustomer.id, data);
      toast.success("Customer updated successfully");
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update customer");
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    try {
      await customerService.delete(selectedCustomer.id);
      toast.success("Customer deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete customer");
    }
  };

  const filteredCustomers = allCustomers.filter((customer) => {
    const matchesName = customer.name
      .toLowerCase()
      .includes(filters.name.toLowerCase());
    return matchesName;
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const paginated = filteredCustomers.slice((page - 1) * pageSize, page * pageSize);

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
            Customers
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="">
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
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded-lg shadow-md">
        <div className="flex flex-col">
          <label
            htmlFor="nameFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Customer Name
          </label>
          <Input
            id="nameFilter"
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            placeholder="Search by customer name"
            className="w-48 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
          />
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
                Phone Number
              </th>
              {(permissions.includes("customers.update") ||
                permissions.includes("customers.delete")) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {customer.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{customer.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{customer.phoneNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    {permissions.includes("customers.update") && (
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5 cursor-pointer hover:scale-120" />
                      </button>
                    )}

                    {permissions.includes("customers.delete") && (
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
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
          className="px-2 py-1 rounded bg-gray-200 text-gray-700 font-semibold "
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
          className="px-2 py-1 rounded bg-gray-200 text-gray-700 font-semibold "
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
          setSelectedCustomer(null);
        }}
        title={isEditModalOpen ? "Edit Customer" : "Create Customer"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Customer Name"
            value={selectedCustomer?.name || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedCustomer((prev) => ({ ...prev, name: value }));
              setFormErrors((errors) => {
                if (!value.trim()) {
                  return { ...errors, name: "Customer name is required" };
                } else {
                  return { ...errors, name: undefined };
                }
              });
            }}
            error={formErrors?.name}
          />
          <Input
            label="Address"
            value={selectedCustomer?.address || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedCustomer((prev) => ({ ...prev, address: value }));
            }}
          />
          <Input
            label="Phone Number"
            value={selectedCustomer?.phoneNumber || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedCustomer((prev) => ({ ...prev, phoneNumber: value }));
            }}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedCustomer(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const data = {
                  name: selectedCustomer?.name || "",
                  address: selectedCustomer?.address || "",
                  phoneNumber: selectedCustomer?.phoneNumber || "",
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
        title="Delete Customer"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this customer? This action cannot be
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

export default withPermission(CustomersPage, "customers.read");