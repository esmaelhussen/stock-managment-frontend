"use client";

import React, { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { categoryService } from "@/services/category.service";
import { Category, CreateCategoryInput, UpdateCategoryInput } from "@/types";
import Cookies from "js-cookie";

export default function CategoriesPage() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    identifier?: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const total = allCategories.length;
  const permissions = JSON.parse(Cookies.get("permission") || "[]");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setCategories(allCategories.slice(start, end));
  }, [allCategories, page, pageSize]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setAllCategories(data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateCategoryInput) => {
    const errors: { name?: string; identifier?: string } = {};

    if (!data.name?.trim()) errors.name = "Category name is required";
    if (!data.identifier?.trim()) errors.identifier = "Identifier is required";
    setFormErrors(Object.keys(errors).length ? errors : null);
    if (Object.keys(errors).length) return;
    try {
      await categoryService.create(data);
      toast.success("Category created successfully");
      setIsCreateModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create category");
    }
  };

  const handleUpdate = async (data: UpdateCategoryInput) => {
    if (!selectedCategory) return;
    try {
      await categoryService.update(selectedCategory.id, data);
      toast.success("Category updated successfully");
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await categoryService.remove(selectedCategory.id);
      toast.success("Category deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete category");
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
            Categories
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {permissions.includes("categories.create") && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Category
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
                Identifier
              </th>
              {(permissions.includes("categories.update") || permissions.includes("categories.delete")) && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
              )}

            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {category.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {category.identifier || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    {permissions.includes("categories.update") && (
                        <button
                            onClick={() => {
                              setSelectedCategory(category);
                              setIsEditModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-5 w-5 cursor-pointer hover:scale-120"/>
                        </button>
                    )}

                    {permissions.includes("categories.delete") && (
                        <button
                            onClick={() => {
                              setSelectedCategory(category);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5 cursor-pointer hover:scale-120"/>
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
          setSelectedCategory(null);
        }}
        title={isEditModalOpen ? "Edit Category" : "Create Category"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={selectedCategory?.name || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedCategory((prev) => ({ ...prev, name: value }));
              setFormErrors((errors) => {
                if (!value.trim()) {
                  return { ...errors, name: "Category name is required" };
                } else {
                  return { ...errors, name: undefined };
                }
              });
            }}
            error={formErrors?.name}
          />
          <Input
            label="Identifier"
            value={selectedCategory?.identifier || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedCategory((prev) => ({ ...prev, identifier: value }));
              setFormErrors((errors) => {
                if (!value.trim()) {
                  return {
                    ...errors,
                    identifier: "Category identifier is required",
                  };
                } else {
                  return { ...errors, identifier: undefined };
                }
              });
            }}
            error={formErrors?.identifier}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedCategory(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const data = {
                  name: selectedCategory?.name || "",
                  identifier: selectedCategory?.identifier,
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
        title="Delete Category"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this category? This action cannot be
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
