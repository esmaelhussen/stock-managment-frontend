"use client";
import React, { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { fetchWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../../services/warehouse.service';

export default function WarehousePage() {
    const [warehouses, setWarehouses] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', address: '', description: '', active: true });

    useEffect(() => {
        fetchWarehouses().then((data) => {
            setWarehouses(Array.isArray(data) ? data : []);
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                // Only send allowed fields for update, including active
                const { name, address, description, active } = form;
                await updateWarehouse(editing.id, { name, address, description, active: Boolean(active) });
                toast.success('Warehouse updated successfully');
            } else {
                // Only send allowed fields for create
                const { name, address, description, active } = form;
                await createWarehouse({ name, address, description, active: Boolean(active) });
                toast.success('Warehouse created successfully');
            }
            setModalOpen(false);
            setEditing(null);
            setForm({ name: '', address: '', description: '', active: true });
            fetchWarehouses().then((data) => {
                setWarehouses(Array.isArray(data) ? data : []);
            });
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to save warehouse. Please check required fields.');
        }
    };

    const handleEdit = (warehouse) => {
        setEditing(warehouse);
        setForm({
            name: warehouse.name,
            address: warehouse.address,
            description: warehouse.description,
            active: typeof warehouse.active === 'boolean' ? warehouse.active : true
        });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        await deleteWarehouse(id);
        fetchWarehouses().then(setWarehouses);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-extrabold text-gray-900">Warehouses</h1>
                <Button onClick={() => setModalOpen(true)} className="ml-auto">Add Warehouse</Button>
            </div>
            <table className="w-full mt-4 border text-left">
                <thead>
                    <tr>
                        <th className="text-sm font-medium text-gray-700 px-4 py-2">Name</th>
                        <th className="text-sm font-medium text-gray-700 px-4 py-2">Address</th>
                        <th className="text-sm font-medium text-gray-700 px-4 py-2">Description</th>
                        <th className="text-sm font-medium text-gray-700 px-4 py-2">Status</th>
                        <th className="text-sm font-medium text-gray-700 px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {warehouses.map((w) => (
                        <tr key={w.id}>
                            <td className="px-4 py-2">{w.name}</td>
                            <td className="px-4 py-2">{w.address}</td>
                            <td className="px-4 py-2">{w.description}</td>
                            <td className="px-4 py-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${w.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {w.active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex gap-0 items-center" style={{ width: '70px' }}>
                                    <button onClick={() => handleEdit(w)} className="text-blue-600 hover:text-blue-900">
                                        <PencilIcon className="h-5 w-5 cursor-pointer hover:scale-120" />
                                    </button>
                                    <button onClick={() => handleDelete(w.id)} className="text-red-600 hover:text-red-900">
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
                            label={'Address *'}
                            className="font-bold text-lg"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            required
                        />
                        <Input
                            label={'Description'}
                            className="font-bold text-lg"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                        <Button type="submit" disabled={!form.name || !form.address}>{editing ? 'Update' : 'Create'}</Button>
                    </form>
                </Modal>
            )}
        </div>
    );
}
