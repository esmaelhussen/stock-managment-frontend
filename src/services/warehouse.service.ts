import { apiClient } from '../lib/api';

export async function fetchWarehouses() {
  return await apiClient.get('/warehouses');
}

export async function createWarehouse(data) {
  return await apiClient.post('/warehouses', data);
}

export async function updateWarehouse(id, data) {
  return await apiClient.put(`/warehouses/${id}`, data);
}

export async function deleteWarehouse(id) {
  return await apiClient.delete(`/warehouses/${id}`);
}
