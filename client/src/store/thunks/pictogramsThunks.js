import { createAsyncThunk } from '@reduxjs/toolkit';
import { setLoading, setPictograms, setError, updatePictogram as updatePictogramAction, removePictogram } from '../slices/pictogramsSlice';
import api from '../../services/api';

export const fetchPictograms = createAsyncThunk(
  'pictograms/fetchPictograms',
  async ({ page = 1, search = '', category = '' }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const params = { page, limit: 20 };
      if (search && search.trim()) params.search = search.trim();
      if (category && category.trim()) {
        params.category = category.trim();
        console.log('Frontend: Sending category filter:', params.category);
      } else {
        console.log('Frontend: No category filter');
      }
      
      const response = await api.get('/pictograms', { params });
      dispatch(setPictograms(response.data));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch pictograms';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const uploadPictogram = createAsyncThunk(
  'pictograms/uploadPictogram',
  async (formData, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.post('/pictograms/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to upload pictogram';
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updatePictogram = createAsyncThunk(
  'pictograms/updatePictogram',
  async ({ id, ...data }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.put(`/pictograms/${id}`, data);
      dispatch(updatePictogramAction(response.data.pictogram));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update pictogram';
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deletePictogram = createAsyncThunk(
  'pictograms/deletePictogram',
  async (id, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      await api.delete(`/pictograms/${id}`);
      dispatch(removePictogram(id));
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete pictogram';
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);
