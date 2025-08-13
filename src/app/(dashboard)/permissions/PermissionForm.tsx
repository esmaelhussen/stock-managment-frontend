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
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <input
          type="text"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Resource
        </label>
        <input
          type="text"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          value={form.resource}
          onChange={(e) => setForm({ ...form, resource: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Action
        </label>
        <input
          type="text"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          value={form.action}
          onChange={(e) => setForm({ ...form, action: e.target.value })}
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
        />
        <label className="text-sm">Active</label>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="px-4 py-2 rounded bg-gray-200"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default PermissionForm;
