"use client";

import React, { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { categoryService, Category } from "@/services/category.service";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function CategoriesPage() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(14);
  const total = allCategories.length;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [name, setName] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setAllCategories(data);
      // set paged categories
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      setCategories(data.slice(start, end));
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // update paged categories when paging changes or when allCategories updates
  useEffect(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setCategories(allCategories.slice(start, end));
  }, [allCategories, page, pageSize]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    try {
      await categoryService.create({ name });
      toast.success("Category created successfully");
      setIsCreateModalOpen(false);
      setName("");
      setPage(1);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create category");
    }
  };

  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setName(category.name);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;
    try {
      await categoryService.update(selectedCategory.id, { name });
      toast.success("Category updated successfully");
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      setName("");
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!selectedCategory) return;
    try {
      await categoryService.delete(selectedCategory.id);
      toast.success("Category deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      // if deleting the last item on the page, move back a page
      const newTotal = total - 1;
      const lastPage = Math.max(1, Math.ceil(newTotal / pageSize));
      if (page > lastPage) setPage(lastPage);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">Categories</h1>
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
                <option key={size} value={size} className="bg-white text-black font-bold">
                  {size} per page
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Category
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
            {loading ? (
              <tr>
                <td colSpan={2} className="text-center py-8 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center py-8 text-gray-500">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCategory(cat);
                          setName(cat.name);
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5 cursor-pointer hover:scale-120" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5 cursor-pointer hover:scale-120" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
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
              page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
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
        title="Add Category"
      >
        <div className="p-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category Name"
            className="mb-4"
          />
          <div className="flex justify-end">
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Category"
      >
        <div className="p-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category Name"
            className="mb-4"
          />
          <div className="flex justify-end">
            <Button onClick={handleUpdate}>Update</Button>
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
          <Button
            variant="danger"
            onClick={() => handleDelete(selectedCategory?.id ?? "")}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
