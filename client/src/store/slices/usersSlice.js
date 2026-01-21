import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  search: '',
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUsers: (state, action) => {
      state.users = action.payload.users;
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
  },
});

export const { setLoading, setUsers, setError, setSearch } = usersSlice.actions;
export default usersSlice.reducer;
