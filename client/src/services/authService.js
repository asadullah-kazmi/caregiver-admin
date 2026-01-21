import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from './api';

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    
    // Verify admin status
    const response = await api.post('/auth/verify', { token });
    
    if (response.data.success) {
      localStorage.setItem('authToken', token);
      return { success: true, user: response.data.user };
    }
    
    throw new Error('Access denied. Admin privileges required.');
  } catch (error) {
    console.error('Login error:', error);
    
    // Provide user-friendly error messages
    let errorMessage = 'Failed to login. Please check your credentials.';
    
    // Check for network/server errors
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.message?.includes('ECONNREFUSED')) {
      errorMessage = 'Cannot connect to server. Please make sure the backend server is running on port 5000.';
    } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid email or password. Please try again.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address format.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed login attempts. Please try again later.';
    } else if (error.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};
