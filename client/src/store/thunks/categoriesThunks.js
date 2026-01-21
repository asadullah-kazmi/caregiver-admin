import { createAsyncThunk } from '@reduxjs/toolkit';
import { setLoading, setCategories, setError, addCategory, updateCategory as updateCategoryAction, removeCategory } from '../slices/categoriesSlice';
import api from '../../services/api';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async ({ page = 1, limit = 50, status = '', search = '' }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const params = { page, limit };
      if (status) params.status = status;
      if (search) params.search = search;
      
      const response = await api.get('/categories', { params });
      dispatch(setCategories(response.data));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch categories';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchActiveCategories = createAsyncThunk(
  'categories/fetchActiveCategories',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.get('/categories/active/list');
      return response.data.categories;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch active categories';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.post('/categories', categoryData);
      dispatch(addCategory(response.data.category));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create category';
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, ...data }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.put(`/categories/${id}`, data);
      dispatch(updateCategoryAction(response.data.category));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update category';
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      await api.delete(`/categories/${id}`);
      dispatch(removeCategory(id));
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete category';
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);
