import { apiClient } from '../lib/api';

export async function fetchUnits() {
  return await apiClient.get('/units');
}

export async function createUnit(data) {
  return await apiClient.post('/units', data);
}

export async function updateUnit(id, data) {
  return await apiClient.put(`/units/${id}`, data);
}

export async function deleteUnit(id) {
  return await apiClient.delete(`/units/${id}`);
}
