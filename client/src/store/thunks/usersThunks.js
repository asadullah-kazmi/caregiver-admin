import { createAsyncThunk } from '@reduxjs/toolkit';
import { setLoading, setUsers, setError } from '../slices/usersSlice';
import api from '../../services/api';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ page = 1, search = '' }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const params = { page, limit: 20 };
      if (search) params.search = search;
      
      const response = await api.get('/users', { params });
      dispatch(setUsers(response.data));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch users';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
