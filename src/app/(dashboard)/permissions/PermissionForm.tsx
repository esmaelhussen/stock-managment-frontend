import React, { useState } from "react";
import { Permission, UpdatePermissionInput } from "@/types";

interface PermissionFormProps {
  initial?: Permission;
  onSubmit: (data: UpdatePermissionInput) => void;
  onCancel: () => void;
}

const PermissionForm: React.FC<PermissionFormProps> = ({
  initial,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState<UpdatePermissionInput>({
    name: initial?.name || "",
    description: initial?.description || "",
    resource: initial?.resource || "",
    action: initial?.action || "",
    isActive: initial?.isActive ?? true,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4 px-2 py-2"
    >
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">Name</label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">Description</label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">Resource</label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={form.resource}
          onChange={(e) => setForm({ ...form, resource: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">Action</label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={form.action}
          onChange={(e) => setForm({ ...form, action: e.target.value })}
          required
        />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
        />
        <label className="text-sm text-gray-700">Active</label>
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
};

export default PermissionForm;
