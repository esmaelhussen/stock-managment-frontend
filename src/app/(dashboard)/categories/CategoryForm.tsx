
"use client";
import React, { useState } from "react";

interface Category {
  id: number;
  name: string;
  identifier: string;
}

interface UpdateCategoryInput {
  name: string;
  identifier: string;
}

interface CategoryFormProps {
  initial?: Category;
  onSubmit: (data: UpdateCategoryInput) => void;
  onCancel: () => void;
}

export default function CategoryForm({ initial, onSubmit, onCancel }: CategoryFormProps) {
  const [form, setForm] = useState<UpdateCategoryInput>({
    name: initial?.name || "",
    identifier: initial?.identifier || "",
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    identifier?: string;
  }>({});

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const errors: { name?: string; identifier?: string } = {};
        if (!form.name.trim()) errors.name = "Name is required";
        if (!form.identifier.trim()) errors.identifier = "Identifier is required";
        setFormErrors(errors);
        if (Object.keys(errors).length) return;
        onSubmit(form);
      }}
      className="space-y-4 px-2 py-2"
    >
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={form.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setForm({ ...form, name: value });
            setFormErrors((errors) => ({
              ...errors,
              name: value.trim() ? undefined : "Name is required",
            }));
          }}
        />
        {formErrors.name && (
          <div className="text-red-500 text-sm mt-1">{formErrors.name}</div>
        )}
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Identifier
        </label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={form.identifier}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setForm({ ...form, identifier: value });
            setFormErrors((errors) => ({
              ...errors,
              identifier: value.trim() ? undefined : "Identifier is required",
            }));
          }}
        />
        {formErrors.identifier && (
          <div className="text-red-500 text-sm mt-1">{formErrors.identifier}</div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          className="px-4 py-2 rounded bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  );
}
