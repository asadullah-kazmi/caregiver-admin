import { createAsyncThunk } from '@reduxjs/toolkit';
import { setLoading, setRequests, setError, updateRequest, removeRequest } from '../slices/requestsSlice';
import api from '../../services/api';

export const fetchRequests = createAsyncThunk(
  'requests/fetchRequests',
  async ({ page = 1, limit = 20, status = '', category = '', search = '' }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const params = { page, limit };
      if (status) params.status = status;
      if (category) params.category = category;
      if (search) params.search = search;
      
      const response = await api.get('/requests', { params });
      dispatch(setRequests(response.data));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch requests';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateRequestStatus = createAsyncThunk(
  'requests/updateRequestStatus',
  async ({ id, status, adminNote }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.put(`/requests/${id}/status`, { status, adminNote });
      dispatch(updateRequest(response.data.request));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update request status';
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteRequest = createAsyncThunk(
  'requests/deleteRequest',
  async (id, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      await api.delete(`/requests/${id}`);
      dispatch(removeRequest(id));
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete request';
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);
