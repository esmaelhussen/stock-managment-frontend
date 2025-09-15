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
import withPermission from "@/hoc/withPermission";

function CategoriesPage() {
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
  const [pageSize, setPageSize] = useState(12);
  const total = allCategories.length;
  const permissions = JSON.parse(Cookies.get("permission") || "[]");
  const [filters, setFilters] = useState({
    name: "",
    identifier: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // useEffect(() => {
  //   const start = (page - 1) * pageSize;
  //   const end = start + pageSize;
  //   setCategories(allCategories.slice(start, end));
  // }, [allCategories, page, pageSize]);

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

    // Send parentCategoryId directly
    const requestData = {
      ...data,
      parentCategoryId: data.parentCategoryId || undefined,
    };

    console.log("Data sent to create category:", requestData);

    try {
      await categoryService.create(requestData);
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
      toast.success(
        selectedCategory?.parentCategoryId !== null && selectedCategory?.parentCategoryId !== undefined
          ? "Subcategory updated successfully"
          : "Category updated successfully"
      );
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update category"
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    console.log("Deleting category with ID:", selectedCategory.id);
    try {
      await categoryService.remove(selectedCategory.id);
      toast.success(
        selectedCategory.parentCategoryId
          ? "Subcategory deleted successfully"
          : "Category deleted successfully"
      );
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  };

  const filteredCategories = allCategories
    .filter((category) => !category.parentCategoryId) // Only include categories without a parentCategoryId
    .filter((category) => {
      const matchesName = category.name
        .toLowerCase()
        .includes(filters.name.toLowerCase().trim());
      const matchesIdentifier = category.identifier
        .toLowerCase()
        .includes(filters.identifier.toLowerCase().trim());
      return matchesName && matchesIdentifier;
    });

  console.log("allCategories", allCategories);
  console.log("filteredCategories", filteredCategories);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const paginated = filteredCategories.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

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
            Categories
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
          {permissions.includes("categories.create") && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Category
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
            placeholder="Search by category name"
            className="w-48 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 shadow focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-200 focus:outline-none transition duration-200 ease-in-out"
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="identifierFilter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Identifier
          </label>
          <Input
            id="identifierFilter"
            value={filters.identifier}
            onChange={(e) => handleFilterChange("identifier", e.target.value)}
            placeholder="Search by category identifier"
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
                Identifier
              </th>

              {(permissions.includes("categories.update") ||
                permissions.includes("categories.delete")) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginated.map((category) => (
              <React.Fragment key={category.id}>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {category.identifier || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex space-x-2">
                      {permissions.includes("categories.update") && (
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsEditModalOpen(true);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          <PencilIcon className="h-5 w-5 cursor-pointer hover:scale-120" />
                        </button>
                      )}

                      {permissions.includes("categories.delete") && (
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
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
                {category.subcategories && category.subcategories.length > 0 ? (
                  <>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <td colSpan={3} className="px-6 py-2">
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Subcategories:
                        </div>
                      </td>
                    </tr>
                    {category.subcategories.map((subcategory) => (
                      <tr key={subcategory.id} className="bg-blue-50 dark:bg-blue-900/20">
                        <td className="px-6 py-4 pl-12 whitespace-nowrap">
                          <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                            {subcategory.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 dark:text-blue-400">
                          {subcategory.identifier || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex space-x-2">
                            {permissions.includes("categories.update") && (
                              <button
                                onClick={() => {
                                  setSelectedCategory(subcategory);
                                  setIsEditModalOpen(true);
                                }}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                              >
                                <PencilIcon className="h-5 w-5 cursor-pointer hover:scale-120" />
                              </button>
                            )}

                            {permissions.includes("categories.delete") && (
                              <button
                                onClick={() => {
                                  setSelectedCategory(subcategory);
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
                  </>
                ) : (
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <td colSpan={3} className="px-6 py-4">
                      <div className="pl-6 italic text-sm text-gray-500 dark:text-gray-400">
                        No subcategories
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Parent Category (Optional) for Sub Categories Only
            </label>
            <select
              value={selectedCategory?.parentCategoryId || ""}
              onChange={(e) => {
                const value = e.target.value || null;
                setSelectedCategory((prev) => ({
                  ...prev,
                  parentCategoryId: value,
                }));
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 shadow focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-200 focus:outline-none transition duration-200 ease-in-out"
            >
              <option value="">None</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
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
              variant="primary"
              onClick={() => {
                const data = {
                  name: selectedCategory?.name || "",
                  identifier: selectedCategory?.identifier,
                  parentCategoryId: selectedCategory?.parentCategoryId || "",
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

export default withPermission(CategoriesPage, "categories.read");
