import { apiClient } from '../lib/api';

export async function fetchCategories() {
  return await apiClient.get('/categories');
}

export async function createCategory(data) {
  return await apiClient.post('/categories', data);
}

export async function updateCategory(id, data) {
  return await apiClient.put(`/categories/${id}`, data);
}

export async function deleteCategory(id) {
  return await apiClient.delete(`/categories/${id}`);
}
