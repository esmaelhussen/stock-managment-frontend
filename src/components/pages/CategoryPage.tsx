"use client";
import React, { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';
    import Button from '../ui/Button';
    import Input from '../ui/Input';
    import Modal from '../ui/Modal';
    import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../services/category.service';

    export default function CategoryPage() {
    const [categories, setCategories] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', identifier: '', active: true });

        useEffect(() => {
                fetchCategories().then((data) => {
                    setCategories(Array.isArray(data) ? data : []);
                });
        }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                // Only send allowed fields for update, including active
                const { name, identifier, active } = form;
                await updateCategory(editing.id, { name, identifier, active: Boolean(active) });
                toast.success('Category updated successfully');
            } else {
                // Send allowed fields for create, including active
                const { name, identifier, active } = form;
                await createCategory({ name, identifier, active: Boolean(active) });
                toast.success('Category created successfully');
            }
            setModalOpen(false);
            setEditing(null);
            setForm({ name: '', identifier: '', active: true });
            fetchCategories().then((data) => {
                setCategories(Array.isArray(data) ? data : []);
            });
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to save category. Please check required fields.');
        }
    };

    const handleEdit = (category) => {
        setEditing(category);
        setForm({
            name: category.name,
            identifier: category.identifier,
            active: typeof category.active === 'boolean' ? category.active : true
        });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        await deleteCategory(id);
        fetchCategories().then(setCategories);
    };

    return (
        <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-extrabold">Categories</h1>
                    <Button onClick={() => setModalOpen(true)} className="ml-auto">Add Category</Button>
                </div>
                <table className="w-full mt-4 border text-left">
                        <thead>
                        <tr>
                                <th className="text-sm font-medium text-gray-700 px-4 py-2">Name</th>
                                <th className="text-sm font-medium text-gray-700 px-4 py-2">Identifier</th>
                                <th className="text-sm font-medium text-gray-700 px-4 py-2">Status</th>
                                <th className="text-sm font-medium text-gray-700 px-4 py-2">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {categories.map((c) => (
                                <tr key={c.id}>
                                <td className="px-4 py-2">{c.name}</td>
                                <td className="px-4 py-2">{c.identifier}</td>
                                <td className="px-4 py-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${c.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {c.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex gap-0 items-center" style={{width: '70px'}}>
                                        <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-900">
                                            <PencilIcon className="h-5 w-5 cursor-pointer hover:scale-120" />
                                        </button>
                                        <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-900">
                                            <TrashIcon className="h-5 w-5 cursor-pointer hover:scale-120" />
                                        </button>
                                    </div>
                                </td>
                                </tr>
                        ))}
                        </tbody>
                </table>
        {modalOpen && (
            <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }}>
            <form onSubmit={handleSubmit} className="space-y-4">
                                                <Input
                                                    label={'Name *'}
                                                    className="font-bold text-lg"
                                                    value={form.name}
                                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                    required
                                                />
                                                <Input
                                                    label={'Identifier *'}
                                                    className="font-bold text-lg"
                                                    value={form.identifier}
                                                    onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                                                    required
                                                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={form.active}
                    onChange={e => setForm({ ...form, active: e.target.checked })}
                    className="form-checkbox h-4 w-4 text-green-600"
                  />
                  <label htmlFor="active" className="text-sm font-medium">Active</label>
                  <span className="text-xs text-gray-400">(Uncheck for Deactive)</span>
                </div>
                <Button type="submit" disabled={!form.name || !form.identifier}>{editing ? 'Update' : 'Create'}</Button>
            </form>
            </Modal>
        )}
        </div>
    );
    }
