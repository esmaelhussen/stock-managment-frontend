"use client";

import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ProductForm from "./ProductForm";
import { productService } from "@/services/product.service";
import { Product, CreateProductInput, UpdateProductInput } from "@/types";
import Cookies from "js-cookie";
import withPermission from "@/hoc/withPermission";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types";

function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const total = allProducts.length;
  const permissions = JSON.parse(Cookies.get("permission") || "[]");
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // useEffect(() => {
  //   const start = (page - 1) * pageSize;
  //   const end = start + pageSize;
  //   setProducts(allProducts.slice(start, end));
  // }, [allProducts, page, pageSize]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      console.log("Raw API Response:", data); // Log raw API response for debugging
      const baseUrl = "http://localhost:3008"; // Replace with your backend URL
      const updatedData = data.map((product) => {
        let image = null;
        if (product.image && typeof product.image === "string") {
          image = `${baseUrl}${product.image}`;
        } else if (product.image && typeof product.image === "object") {
          console.warn("Unexpected image format:", product.image);
        }
        return {
          ...product,
          image,
        };
      });
      console.log("Updated Products Data:", updatedData); // Debugging log
      setAllProducts(updatedData);
    } catch (error) {
      console.error("Error fetching products:", error); // Log error details
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateProductInput) => {
    try {
      await productService.create(data);
      toast.success("Product created successfully");
      setIsCreateModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create product");
    }
  };

  const handleUpdate = async (data: UpdateProductInput) => {
    if (!selectedProduct) return;
    try {
      await productService.update(selectedProduct.id, data);
      toast.success("Product updated successfully");
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await productService.delete(selectedProduct.id);
      toast.success("Product deleted successfully");
      setIsDeleteModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  const fetchCategories = async () => {
    try {
      const [categoriesData] = await Promise.all([categoryService.getAll()]);
      setCategories(categoriesData);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredProducts = allProducts.filter((product) => {
    const matchesName = product.name
      .toLowerCase()
      .includes(filters.name.toLowerCase());
    const matchesSKU = product.sku
      .toLowerCase()
      .includes(filters.sku.toLowerCase());
    const matchesCategory = filters.category
      ? product.category?.name.toLowerCase() === filters.category.toLowerCase()
      : true;
    const matchesPrice = product.price
      .toString()
      .toLowerCase()
      .includes(filters.price.toLowerCase());
    return matchesName && matchesSKU && matchesCategory && matchesPrice;
  });

  const handlefilteredChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const paginated = filteredProducts.slice(
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Products
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
              {[5, 10, 15].map((size) => (
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
          {permissions.includes("products.create") && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Product
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded-lg shadow-md">
        <div className="flex flex-col">
          <label
            htmlFor="nameFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Product Name
          </label>
          <input
            id="nameFilter"
            value={filters.name}
            onChange={(e) => handlefilteredChange("name", e.target.value)}
            placeholder="Filter by name"
            className="w-48 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="skuFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            SKU
          </label>
          <input
            id="skuFilter"
            value={filters.sku}
            onChange={(e) => handlefilteredChange("sku", e.target.value)}
            placeholder="Filter by SKU"
            className="w-48 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="categoryFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <select
            id="categoryFilter"
            value={filters.category}
            onChange={(e) => handlefilteredChange("category", e.target.value)}
            className="w-48 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="priceFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Price
          </label>
          <input
            id="priceFilter"
            value={filters.price}
            onChange={(e) => handlefilteredChange("price", e.target.value)}
            placeholder="Filter by Price"
            className="w-48 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200 ease-in-out"
          />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit
              </th>

              {(permissions.includes("products.update") ||
                permissions.includes("products.delete")) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.map((product) => {
              console.log("Product Image URL:", product.image); // Debugging log for image URL
              return (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.image ? (
                      <>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 object-cover rounded-full cursor-pointer"
                          onClick={() => {
                            setModalImage(product.image);
                            setIsImageModalOpen(true);
                          }}
                        />
                        {isImageModalOpen && modalImage === product.image && (
                          <Modal
                            isOpen={isImageModalOpen}
                            onClose={() => setIsImageModalOpen(false)}
                            title="Image Preview"
                            size="lg"
                          >
                            <img
                              src={modalImage}
                              alt="Product Large"
                              className="max-w-full max-h-full object-contain"
                            />
                          </Modal>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-500">No Image</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.unit.name}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {permissions.includes("products.update") && (
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsEditModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-5 w-5 cursor-pointer hover:scale-120" />
                        </button>
                      )}

                      {permissions.includes("products.delete") && (
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-900 "
                        >
                          <TrashIcon className="h-5 w-5 cursor-pointer hover:scale-120" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
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
        title="Create Product"
        size="lg"
      >
        <ProductForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product"
        size="lg"
      >
        <ProductForm
          product={selectedProduct}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          isEdit
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Product"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this product? This action cannot be
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

export default withPermission(ProductsPage, "products.read");
