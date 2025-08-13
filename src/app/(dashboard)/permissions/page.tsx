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

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const data = await permissionService.getAll();
      setPermissions(data);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          Permissions
        </h1>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
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
                  <button
                    className="text-indigo-600 hover:text-indigo-900"
                    onClick={() => {
                      setSelectedPermission(permission);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => {
                      setSelectedPermission(permission);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Edit Modal */}
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
