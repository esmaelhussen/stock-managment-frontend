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
} from "@/types";
import { categoryService } from "@/services/category.service";
import { unitService } from "@/services/unit.service";
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
  image: yup.mixed().notRequired(),
});

const updateSchema = yup.object({
  name: yup.string(),
  description: yup.string(),
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
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // Modal state

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
      const [categoriesData, unitsData] = await Promise.all([
        categoryService.getAll(),
        unitService.getAll(),
      ]);
      setCategories(categoriesData);
      setUnits(unitsData);
    } catch (error) {
      toast.error("Failed to fetch categories or units");
    }
  };

  const onSubmitHandler = (data: any) => {
    if (data.image instanceof FileList && data.image.length > 0) {
      data.image = data.image[0]; // Extract the first file from the FileList
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
            {...register("categoryId")}
            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm hover:bg-blue-50 hover:border-blue-400"
            style={{ color: "#000" }}
          >
            <option value="" disabled style={{ color: "#9CA3AF" }}>
              Select a category
            </option>
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
                  <Modal onClose={() => setIsImageModalOpen(false)}>
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
