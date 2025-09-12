"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal"; // Import a modal component
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
  Category,
  Unit,
  Brand,
} from "@/types";
import { categoryService } from "@/services/category.service";
import { unitService } from "@/services/unit.service";
import { brandService } from "@/services/brand.service";
import toast from "react-hot-toast";

const createSchema = yup.object({
  name: yup.string().required("Name is required"),
  description: yup.string(),

  sku: yup.string().required("SKU is required"),
  price: yup
    .number()
    .typeError("Price must be a valid number") // Updated error message
    .required("Price is required")
    .positive("Price must be positive"),
  categoryId: yup.string().required("Category is required"),
  unitId: yup.string().required("Unit is required"),
  brandId: yup.string().required("Brand is required"),
  image: yup.mixed().notRequired(),
});

const updateSchema = yup.object({
  name: yup.string(),
  description: yup.string(),
  brand: yup.string(),
  sku: yup.string(),
  price: yup
    .number()
    .typeError("Price must be a valid number") // Updated error message
    .positive("Price must be positive"),
  categoryId: yup.string(),
  unitId: yup.string(),
  image: yup.mixed().notRequired(),
});

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function ProductForm({
  product,
  onSubmit,
  onCancel,
  isEdit = false,
}: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // Modal state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);

  const formConfig = isEdit
    ? {
        resolver: yupResolver(updateSchema),
        defaultValues: product
          ? {
              name: product.name,
              description: product.description || "",

              sku: product.sku,
              price: product.price,
              categoryId: product.category?.id || "",
              unitId: product.unit?.id || "",
              brandId: product.brand?.id || "",
            }
          : {},
      }
    : {
        resolver: yupResolver(createSchema),
        defaultValues: {},
      };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm(formConfig as any);

  useEffect(() => {
    fetchCategoriesAndUnits();
  }, []);

  const fetchCategoriesAndUnits = async () => {
    try {
      const [categoriesData, unitsData, brandsData] = await Promise.all([
        categoryService.getAll(),
        unitService.getAll(),
        brandService.getAll(),
      ]);

      // Filter out parent categories and attach subcategories
      const parentCategories = categoriesData.filter(
        (category) => !category.parentCategoryId
      );

      parentCategories.forEach((parent) => {
        parent.subcategories = categoriesData.filter(
          (category) => category.parentCategoryId === parent.id
        );
      });

      setCategories(parentCategories);
      setUnits(unitsData);
      setBrands(brandsData);
    } catch (error) {
      toast.error("Failed to fetch categories or units or brands");
    }
  };

  const onSubmitHandler = (data: any) => {
    if (data.image instanceof FileList && data.image.length > 0) {
      data.image = data.image[0]; // Extract the first file from the FileList
    }

    // Determine whether to send categoryId or subcategoryId
    if (data.subcategoryId) {
      data.categoryId = data.subcategoryId; // Use subcategory ID if available
      delete data.subcategoryId; // Remove subcategoryId from the payload
    } else {
      delete data.subcategoryId; // Ensure subcategoryId is not sent if not used
    }

    console.log("Form data submitted:", data); // Log the updated form data for debugging
    onSubmit(data);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);

    // Find the selected category and update subcategories
    const category = categories.find((cat) => cat.id === categoryId);
    if (category && category.subcategories?.length > 0) {
      setSubcategories(category.subcategories);
    } else {
      setSubcategories([]); // Clear subcategories if none exist
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Name"
          {...register("name")}
          error={errors.name?.message as string}
        />
        <Input
          label="SKU"
          {...register("sku")}
          error={errors.sku?.message as string}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price"
          {...register("price")}
          error={errors.price?.message as string}
        />
        <Input
          label="Description"
          {...register("description")}
          error={errors.description?.message as string}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            {...register("categoryId", { required: "Category is required" })}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm hover:bg-blue-50 hover:border-blue-400"
            style={{ color: "#000" }}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
                style={{ color: "#000" }}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit
          </label>
          <select
            {...register("unitId")}
            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm hover:bg-blue-50 hover:border-blue-400"
            style={{ color: "#000" }}
          >
            <option value="" disabled style={{ color: "#9CA3AF" }}>
              Select a unit
            </option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id} style={{ color: "#000" }}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subcategory Dropdown */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subcategory
          </label>
          <select
            {...register("subcategoryId", {
              validate: (value) => {
                if (subcategories.length > 0 && !value) {
                  return "Subcategory is required when available";
                }
                return true;
              },
            })}
            disabled={subcategories.length === 0}
            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm hover:bg-blue-50 hover:border-blue-400"
            style={{ color: "#000" }}
          >
            <option value="">Select a subcategory</option>
            {subcategories.map((subcategory) => (
              <option
                key={subcategory.id}
                value={subcategory.id}
                style={{ color: "#000" }}
              >
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image
          </label>
          <div className="flex items-center space-x-4">
            <label
              htmlFor="image-upload"
              className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            >
              Upload Image
            </label>
            <input
              id="image-upload"
              type="file"
              {...register("image")}
              onChange={(e) => {
                handleImageChange(e);
                register("image").onChange(e);
              }}
              className="hidden"
            />
            {previewImage && (
              <>
                <img
                  src={previewImage}
                  alt="Preview"
                  className="h-16 w-16 object-cover rounded-md border cursor-pointer"
                  onClick={() => setIsImageModalOpen(true)} // Open modal on click
                />
                {isImageModalOpen && (
                  <Modal
                    isOpen={isImageModalOpen}
                    onClose={() => setIsImageModalOpen(false)}
                    title="Image Preview"
                    size="lg"
                  >
                    <img
                      src={previewImage}
                      alt="Preview Large"
                      className="max-w-full max-h-full object-contain"
                    />
                  </Modal>
                )}
              </>
            )}
          </div>
          {errors.image && (
            <p className="mt-2 text-sm text-red-600">
              {errors.image.message?.toString()}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand
          </label>
          <select
            {...register("brandId")}
            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm hover:bg-blue-50 hover:border-blue-400"
            style={{ color: "#000" }}
          >
            <option value="" disabled style={{ color: "#9CA3AF" }}>
              Select a brand
            </option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id} style={{ color: "#000" }}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="cursor-pointer"
        >
          Cancel
        </Button>
        <Button type="submit" className="cursor-pointer">
          {isEdit ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
