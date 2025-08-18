
"use client";
import React, { useState } from "react";

interface Warehouse {
  id: number;
  name: string;
  location: string;
  active: boolean;
}

interface UpdateWarehouseInput {
  name: string;
  location: string;
  active: boolean;
}

interface WarehouseFormProps {
  initial?: Warehouse;
  onSubmit: (data: UpdateWarehouseInput) => void;
  onCancel: () => void;
}

export default function WarehouseForm({ initial, onSubmit, onCancel }: WarehouseFormProps) {
  const [form, setForm] = useState<UpdateWarehouseInput>({
    name: initial?.name || "",
    location: initial?.location || "",
    active: initial?.active ?? true,
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    location?: string;
  }>({});

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const errors: { name?: string; location?: string } = {};
        if (!form.name.trim()) errors.name = "Name is required";
        if (!form.location.trim()) errors.location = "Location is required";
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
          Location
        </label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={form.location}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setForm({ ...form, location: value });
            setFormErrors((errors) => ({
              ...errors,
              location: value.trim() ? undefined : "Location is required",
            }));
          }}
        />
        {formErrors.location && (
          <div className="text-red-500 text-sm mt-1">{formErrors.location}</div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="active"
          checked={form.active}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, active: e.target.checked })
          }
        />
        <label htmlFor="active" className="text-sm text-gray-700">
          Active
        </label>
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
