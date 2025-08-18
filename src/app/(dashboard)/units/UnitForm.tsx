
"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface Unit {
  id: number;
  name: string;
}

interface UpdateUnitInput {
  name: string;
}

interface UnitFormProps {
  initial?: Unit;
  onSubmit: (data: UpdateUnitInput) => void;
  onCancel: () => void;
}

export default function UnitForm({ initial, onSubmit, onCancel }: UnitFormProps) {
  const [form, setForm] = useState<UpdateUnitInput>({
    name: initial?.name || "",
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted with data:", form); // Debug log
    const errors: { name?: string } = {};
    if (!form.name.trim()) errors.name = "Name is required";
    console.log("Validation errors:", errors); // Debug log
    setFormErrors(errors);

    if (Object.values(errors).filter(Boolean).length === 0) {
      console.log("Submitting data to onSubmit:", form); // Debug log
      onSubmit(form);
    } else {
      console.log("Form submission blocked due to errors"); // Debug log
      toast.error("Please fill in all required fields");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
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
            console.log("Name input changed:", value); // Debug log
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
