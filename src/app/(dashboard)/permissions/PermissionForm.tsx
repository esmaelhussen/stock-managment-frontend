import React, { useState } from "react";
import { Permission, UpdatePermissionInput } from "@/types";
import Button from "@/components/ui/Button";

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
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
    resource?: string;
    action?: string;
  }>({});

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const errors: {
          name?: string;
          description?: string;
          resource?: string;
          action?: string;
        } = {};
        if (!form.name.trim()) errors.name = "Name is required";
        if (!form.description.trim())
          errors.description = "Description is required";
        if (!form.resource.trim()) errors.resource = "Resource is required";
        if (!form.action.trim()) errors.action = "Action is required";
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
          onChange={(e) => {
            const value = e.target.value;
            setForm({ ...form, name: value });
            setFormErrors((errors) => {
              if (!value.trim()) {
                return { ...errors, name: "Name is required" };
              } else {
                return { ...errors, name: undefined };
              }
            });
          }}
        />
        {formErrors.name && (
          <div className="text-red-500 text-sm mt-1">{formErrors.name}</div>
        )}
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          Description
        </label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={form.description}
          onChange={(e) => {
            const value = e.target.value;
            setForm({ ...form, description: value });
            setFormErrors((errors) => {
              if (!value.trim()) {
                return { ...errors, description: "Description is required" };
              } else {
                return { ...errors, description: undefined };
              }
            });
          }}
        />
        {formErrors.description && (
          <div className="text-red-500 text-sm mt-1">
            {formErrors.description}
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          Resource
        </label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={form.resource}
          onChange={(e) => {
            const value = e.target.value;
            setForm({ ...form, resource: value });
            setFormErrors((errors) => {
              if (!value.trim()) {
                return { ...errors, resource: "Resource is required" };
              } else {
                return { ...errors, resource: undefined };
              }
            });
          }}
        />
        {formErrors.resource && (
          <div className="text-red-500 text-sm mt-1">{formErrors.resource}</div>
        )}
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          Action
        </label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={form.action}
          onChange={(e) => {
            const value = e.target.value;
            setForm({ ...form, action: value });
            setFormErrors((errors) => {
              if (!value.trim()) {
                return { ...errors, action: "Action is required" };
              } else {
                return { ...errors, action: undefined };
              }
            });
          }}
        />
        {formErrors.action && (
          <div className="text-red-500 text-sm mt-1">{formErrors.action}</div>
        )}
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
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          Save
        </Button>
      </div>
    </form>
  );
};

export default PermissionForm;
