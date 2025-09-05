"use client";

import React, { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { roleService } from "@/services/role.service";
import { permissionService } from "@/services/permission.service";
import { Role, Permission, CreateRoleInput, UpdateRoleInput } from "@/types";
import Cookies from "js-cookie";
import withPermission from "@/hoc/withPermission";

function RolesPage() {
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
    permissionIds?: string;
  } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const total = allRoles.length;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<CreateRoleInput>({
    name: "",
    description: "",
    permissionIds: [],
  });
  const [permissionSearch, setPermissionSearch] = useState(""); // State for search query
  const permission = JSON.parse(Cookies.get("permission") || "[]");
  const [filters, setFilters] = useState({
    name: "",
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  useEffect(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setRoles(allRoles.slice(start, end));
  }, [allRoles, page, pageSize]);

  const fetchRoles = async () => {
    try {
      const data = await roleService.getAll();
      setAllRoles(data);
    } catch (error) {
      toast.error("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const data = await permissionService.getAll();
      setPermissions(data);
    } catch (error) {
      console.error("Failed to fetch permissions");
    }
  };

  const handleCreate = async () => {
    // Validation
    const errors: {
      name?: string;
      description?: string;
      permissionIds?: string;
    } = {};
    if (!formData.name.trim()) errors.name = "Role name is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.permissionIds || formData.permissionIds.length === 0)
      errors.permissionIds = "At least one permission must be selected";
    setFormErrors(Object.keys(errors).length ? errors : null);
    if (Object.keys(errors).length) return;
    try {
      await roleService.create(formData);
      toast.success("Role created successfully");
      setIsCreateModalOpen(false);
      setFormData({ name: "", description: "", permissionIds: [] });
      setFormErrors(null);
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create role");
    }
  };

  const handleUpdate = async () => {
    if (!selectedRole) return;
    try {
      await roleService.update(selectedRole.id, formData as UpdateRoleInput);
      toast.success("Role updated successfully");
      setIsEditModalOpen(false);
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await roleService.delete(id);
      toast.success("Role deleted successfully");
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete role");
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData((prev) => {
      const updated = prev.permissionIds?.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...(prev.permissionIds || []), permissionId];
      // Show error if none selected
      setFormErrors((errors) => {
        if (updated.length === 0) {
          return {
            ...errors,
            permissionIds: "At least one permission must be selected",
          };
        } else {
          return { ...errors, permissionIds: undefined };
        }
      });
      return { ...prev, permissionIds: updated };
    });
  };

  const filteredPermissions = permissions.filter((permission) =>
    permission.name.toLowerCase().includes(permissionSearch.toLowerCase())
  );

  const filteredRoles = allRoles.filter((role) => {
    const matchesName = role.name
      .toLowerCase()
      .includes(filters.name.toLowerCase());
    return matchesName;
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const paginated = filteredRoles.slice((page - 1) * pageSize, page * pageSize);

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
            Roles
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
              {[6, 9, 12].map((size) => (
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
          {permission.includes("roles.create") && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Role
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded-lg shadow-md">
        {/* Product Filter */}
        <div className="flex flex-col">
          <label
            htmlFor="nameFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <Input
            id="nameFilter"
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            placeholder="Search by role name"
            className="w-48 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map((role) => (
          <div key={role.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {role.name}
                </h3>
                <p className="text-sm text-gray-500">{role.description}</p>
              </div>
              <div className="flex space-x-2">
                {permission.includes("roles.update") && (
                  <button
                    onClick={() => {
                      setSelectedRole(role);
                      setFormData({
                        name: role.name,
                        description: role.description || "",
                        permissionIds:
                          role.rolePermissions?.map((rp) => rp.permissionId) ||
                          [],
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 cursor-pointer"
                  >
                    <PencilIcon className="h-5 w-5 cursor-pointer hover:scale-110 transition-transform duration-150" />
                  </button>
                )}

                {permission.includes("roles.delete") && (
                  <button
                    onClick={() => {
                      setRoleToDelete(role);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-red-600 hover:text-red-900 cursor-pointer"
                  >
                    <TrashIcon className="h-5 w-5 cursor-pointer hover:scale-110 transition-transform duration-150" />
                  </button>
                )}
                <Modal
                  isOpen={isDeleteModalOpen}
                  onClose={() => {
                    setIsDeleteModalOpen(false);
                    setRoleToDelete(null);
                  }}
                  title="Delete Role"
                >
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this role? This action
                      cannot be undone.
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsDeleteModalOpen(false);
                        setRoleToDelete(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() =>
                        roleToDelete && handleDelete(roleToDelete.id)
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </Modal>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Permissions:
              </p>
              <div className="flex flex-wrap gap-1">
                {role.rolePermissions?.slice(0, 5).map((rp) => (
                  <span
                    key={rp.id}
                    className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                  >
                    {rp.permission.name}
                  </span>
                ))}
                {role.rolePermissions && role.rolePermissions.length > 5 && (
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    +{role.rolePermissions.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
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
          setFormData({ name: "", description: "", permissionIds: [] });
        }}
        title={isEditModalOpen ? "Edit Role" : "Create Role"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Role Name"
            value={formData.name}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({ ...formData, name: value });
              setFormErrors((errors) => {
                if (!value.trim()) {
                  return { ...errors, name: "Role name is required" };
                } else {
                  return { ...errors, name: undefined };
                }
              });
            }}
            error={formErrors?.name}
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({ ...formData, description: value });
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
              <div className="relative mb-4">
                <Input
                  type="text"
                  placeholder="Search permissions..."
                  value={permissionSearch}
                  onChange={(e) => setPermissionSearch(e.target.value)}
                  className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 text-sm text-black font-bold bg-white shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
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
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPermissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg shadow-md transition duration-150 ease-in-out"
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissionIds.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {permission.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          {formErrors?.permissionIds && (
            <div className="text-red-500 text-sm mt-2">
              {formErrors.permissionIds}
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={isEditModalOpen ? handleUpdate : handleCreate}>
              {isEditModalOpen ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default withPermission(RolesPage, "roles.read");
