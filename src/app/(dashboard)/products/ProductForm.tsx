"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
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
    .typeError("Price must be a number")
    .required("Price is required")
    .positive("Price must be positive"),
  categoryId: yup.string().required("Category is required"),
  unitId: yup.string().required("Unit is required"),
});

const updateSchema = yup.object({
  name: yup.string(),
  description: yup.string(),
  sku: yup.string(),
  price: yup.number(),
  categoryId: yup.string(),
  unitId: yup.string(),
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
    onSubmit(data);
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
