import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { setUser, logout } from './store/slices/authSlice';
import api from './services/api';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import CategoryManagement from './pages/CategoryManagement';
import PictogramManagement from './pages/PictogramManagement';
import RequestManagement from './pages/RequestManagement';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await api.post('/auth/verify', { token });
          
          if (response.data.success) {
            dispatch(setUser(response.data.user));
            localStorage.setItem('authToken', token);
          } else {
            dispatch(logout());
          }
        } catch (error) {
          console.error('Auth verification error:', error);
          dispatch(logout());
        }
      } else {
        dispatch(logout());
        localStorage.removeItem('authToken');
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="pictograms" element={<PictogramManagement />} />
        <Route path="requests" element={<RequestManagement />} />
      </Route>
    </Routes>
  );
}

export default App;
