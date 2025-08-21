"use client";

import React, { useEffect, useState } from "react";
import { UpdatePermissionInput } from "@/types";
import {
  KeyIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PermissionForm from "./PermissionForm";
import { permissionService } from "@/services/permission.service";
import { Permission } from "@/types";
import Cookies from "js-cookie";

export default function PermissionsPage() {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(14);
  const total = allPermissions.length;
  const rolePermission = JSON.parse(Cookies.get("permission") || "[]");


  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setPermissions(allPermissions.slice(start, end));
  }, [allPermissions, page, pageSize]);

  const fetchPermissions = async () => {
    try {
      const data = await permissionService.getAll();
      setAllPermissions(data);
    } catch (error) {
      toast.error("Failed to fetch permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: UpdatePermissionInput) => {
    if (!selectedPermission) return;
    try {
      await permissionService.update(selectedPermission.id, data);
      toast.success("Permission updated successfully");
      setIsEditModalOpen(false);
      fetchPermissions();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update permission"
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedPermission) return;
    try {
      await permissionService.delete(selectedPermission.id);
      toast.success("Permission deleted successfully");
      setIsDeleteModalOpen(false);
      fetchPermissions();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete permission"
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
            Permissions
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
          {rolePermission.includes("permissions.create") && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Permission
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
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resource
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {(rolePermission.includes("permissions.update") || rolePermission.includes("permissions.delete")) && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
              )}


            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {permissions.map((permission) => (
              <tr key={permission.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {permission.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {permission.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {permission.resource}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {permission.action}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {permission.isActive ? (
                    <span className="px-2 py-1 rounded bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2">
                  {rolePermission.includes("permissions.update") && (
                      <button
                          className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                          onClick={() => {
                            setSelectedPermission(permission);
                            setIsEditModalOpen(true);
                          }}
                      >
                        <PencilIcon
                            className="h-5 w-5 cursor-pointer hover:scale-110 transition-transform duration-150"/>
                      </button>
                  )}
                  {rolePermission.includes("permissions.delete") && (
                      <button
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                          onClick={() => {
                            setSelectedPermission(permission);
                            setIsDeleteModalOpen(true);
                          }}
                      >
                        <TrashIcon
                            className="h-5 w-5 cursor-pointer hover:scale-110 transition-transform duration-150"/>
                      </button>
                  )}

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
      {/* Edit Modal */}
      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Permission"
        size="lg"
      >
        <PermissionForm
          onSubmit={async (data) => {
            // Convert UpdatePermissionInput to CreatePermissionInput
            const createData = {
              name: data.name ?? "",
              description: data.description ?? "",
              resource: data.resource ?? "",
              action: data.action ?? "",
            };
            await permissionService.create(createData);
            toast.success("Permission created successfully");
            setIsCreateModalOpen(false);
            fetchPermissions();
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Permission"
        size="lg"
      >
        {selectedPermission && (
          <PermissionForm
            initial={selectedPermission}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>
      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Permission"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span className="font-bold">{selectedPermission?.name}</span>? This
            action cannot be undone.
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
