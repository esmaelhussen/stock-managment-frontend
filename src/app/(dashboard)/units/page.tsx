
"use client";
import React, { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import UnitForm from "./UnitForm";
import {
  fetchUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from "@/services/unit.service";

interface Unit {
  id: number;
  name: string;
}

export default function UnitPage() {
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(14);
  const total = allUnits.length;

  useEffect(() => {
    fetchUnits()
      .then((data: Unit[]) => {
        console.log("Fetched units:", data); // Debug log
        setAllUnits(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch units error:", error); // Debug log
        toast.error("Failed to fetch units");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setUnits(allUnits.slice(start, end));
  }, [allUnits, page, pageSize]);

  const handleCreate = async (data: { name: string }) => {
    try {
      console.log("handleCreate called with data:", data); // Debug log
      await createUnit({ name: data.name });
      toast.success("Unit created successfully");
      setIsCreateModalOpen(false);
      const updatedData = await fetchUnits();
      setAllUnits(Array.isArray(updatedData) ? updatedData : []);
    } catch (error: any) {
      console.error("Create unit error:", error); // Debug log
      toast.error(error?.response?.data?.message || "Failed to create unit");
    }
  };

  const handleUpdate = async (data: { name: string }) => {
    if (!selectedUnit) return;
    try {
      console.log("handleUpdate called with data:", data); // Debug log
      await updateUnit(selectedUnit.id, { name: data.name });
      toast.success("Unit updated successfully");
      setIsEditModalOpen(false);
      const updatedData = await fetchUnits();
      setAllUnits(Array.isArray(updatedData) ? updatedData : []);
    } catch (error: any) {
      console.error("Update unit error:", error); // Debug log
      toast.error(error?.response?.data?.message || "Failed to update unit");
    }
  };

  const handleDelete = async () => {
    if (!selectedUnit) return;
    try {
      console.log("handleDelete called for unit:", selectedUnit.id); // Debug log
      await deleteUnit(selectedUnit.id);
      toast.success("Unit deleted successfully");
      setIsDeleteModalOpen(false);
      const updatedData = await fetchUnits();
      setAllUnits(Array.isArray(updatedData) ? updatedData : []);
    } catch (error: any) {
      console.error("Delete unit error:", error); // Debug log
      toast.error(error?.response?.data?.message || "Failed to delete unit");
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
            Units
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              className="appearance-none px-4 py-2 pr-10 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
              value={pageSize}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
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
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Unit
          </Button>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {units.map((unit: Unit) => (
              <tr key={unit.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {unit.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                  <button
                    className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                    onClick={() => {
                      setSelectedUnit(unit);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <PencilIcon className="h-5 w-5 cursor-pointer hover:scale-110 transition-transform duration-150" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900 cursor-pointer"
                    onClick={() => {
                      setSelectedUnit(unit);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <TrashIcon className="h-5 w-5 cursor-pointer hover:scale-110 transition-transform duration-150" />
                  </button>
                </td>
              </tr>
            ))}
            {units.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                >
                  No units found.
                </td>
              </tr>
            )}
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
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Unit"
        size="lg"
      >
        <UnitForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Unit"
        size="lg"
      >
        {selectedUnit && (
          <UnitForm
            initial={selectedUnit}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Unit"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span className="font-bold">{selectedUnit?.name}</span>? This
            action cannot be undone.
          </p>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
