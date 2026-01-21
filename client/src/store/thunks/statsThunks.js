import { createAsyncThunk } from '@reduxjs/toolkit';
import { setLoading, setStats, setError } from '../slices/statsSlice';
import api from '../../services/api';

export const fetchDashboardStats = createAsyncThunk(
  'stats/fetchDashboard',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.get('/stats/dashboard');
      dispatch(setStats(response.data));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch dashboard statistics';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
