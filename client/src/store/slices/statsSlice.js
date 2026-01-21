import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: {
    totalUsers: 0,
    totalPictograms: 0,
    totalSets: 0,
    totalCategories: 0,
    pendingRequests: 0,
  },
  recentUsers: [],
  recentPictograms: [],
  recentRequests: [],
  loading: false,
  error: null,
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload.stats;
      state.recentUsers = action.payload.recentUsers;
      state.recentPictograms = action.payload.recentPictograms;
      state.recentRequests = action.payload.recentRequests || [];
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLoading, setStats, setError } = statsSlice.actions;
export default statsSlice.reducer;
