import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pictograms: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  search: '',
  category: '',
};

const pictogramsSlice = createSlice({
  name: 'pictograms',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPictograms: (state, action) => {
      state.pictograms = action.payload.pictograms;
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
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    updatePictogram: (state, action) => {
      const index = state.pictograms.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.pictograms[index] = action.payload;
      }
    },
    removePictogram: (state, action) => {
      state.pictograms = state.pictograms.filter(p => p.id !== action.payload);
    },
  },
});

export const { setLoading, setPictograms, setError, setSearch, setCategory, updatePictogram, removePictogram } = pictogramsSlice.actions;
export default pictogramsSlice.reducer;
