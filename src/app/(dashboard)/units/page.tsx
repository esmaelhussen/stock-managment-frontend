"use client";

import React, { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { unitService } from "@/services/unit.service";
import { Unit, CreateUnitInput, UpdateUnitInput } from "@/types";
import Cookies from "js-cookie";
import withPermission from "@/hoc/withPermission";

function UnitsPage() {
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<{ name?: string } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const total = allUnits.length;
  const permissions = JSON.parse(Cookies.get("permission") || "[]");
  const [filters, setFilters] = useState({
    name: "",
  });

  useEffect(() => {
    fetchUnits();
  }, []);

  // useEffect(() => {
  //   const start = (page - 1) * pageSize;
  //   const end = start + pageSize;
  //   setUnits(allUnits.slice(start, end));
  // }, [allUnits, page, pageSize]);

  const fetchUnits = async () => {
    try {
      const data = await unitService.getAll();
      setAllUnits(data);
    } catch (error) {
      toast.error("Failed to fetch units");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateUnitInput) => {
    const errors: { name?: string } = {};
    if (!data.name?.trim()) errors.name = "Unit name is required";
    setFormErrors(Object.keys(errors).length ? errors : null);
    if (Object.keys(errors).length) return;
    try {
      await unitService.create(data);
      toast.success("Unit created successfully");
      setIsCreateModalOpen(false);
      fetchUnits();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create unit");
    }
  };

  const handleUpdate = async (data: UpdateUnitInput) => {
    if (!selectedUnit) return;
    try {
      await unitService.update(selectedUnit.id, data);
      toast.success("Unit updated successfully");
      setIsEditModalOpen(false);
      setSelectedUnit(null);
      fetchUnits();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update unit");
    }
  };

  const handleDelete = async () => {
    if (!selectedUnit) return;
    try {
      await unitService.delete(selectedUnit.id);
      toast.success("Unit deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedUnit(null);
      fetchUnits();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete unit");
    }
  };

  const filteredUnits = allUnits.filter((unit) => {
    const matchesName = unit.name
      .toLowerCase()
      .includes(filters.name.toLowerCase());
    return matchesName;
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const paginated = filteredUnits.slice((page - 1) * pageSize, page * pageSize);

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
            Units
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
              {[6, 10, 14].map((size) => (
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
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Unit
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow-md">
        <div className="flex flex-col">
          <label
            htmlFor="nameFilter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            unit Name
          </label>
          <Input
            id="nameFilter"
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            placeholder="Search by unit name"
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
              {(permissions.includes("units.update") ||
                permissions.includes("units.delete")) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginated.map((unit) => (
              <tr key={unit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {unit.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex space-x-2">
                    {permissions.includes("units.update") && (
                      <button
                        onClick={() => {
                          setSelectedUnit(unit);
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        <PencilIcon className="h-5 w-5 cursor-pointer hover:scale-120" />
                      </button>
                    )}

                    {permissions.includes("units.delete") && (
                      <button
                        onClick={() => {
                          setSelectedUnit(unit);
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
          setSelectedUnit(null);
        }}
        title={isEditModalOpen ? "Edit Unit" : "Create Unit"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Unit Name"
            value={selectedUnit?.name || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedUnit((prev) => ({ ...prev, name: value }));
              setFormErrors((errors) => {
                if (!value.trim()) {
                  return { ...errors, name: "Unit name is required" };
                } else {
                  return { ...errors, name: undefined };
                }
              });
            }}
            error={formErrors?.name}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedUnit(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const data = {
                  name: selectedUnit?.name || "",
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
        title="Delete Unit"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this unit? This action cannot be
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

export default withPermission(UnitsPage, "units.read");
