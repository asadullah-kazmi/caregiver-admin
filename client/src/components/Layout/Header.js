import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { logout as logoutService } from '../../services/authService';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await logoutService();
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-surface-white shadow-md border-b border-primary-light">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-1.5 bg-primary rounded-full shadow-sm"></div>
          <div>
            <h2 className="text-xl font-semibold text-primary">Admin Panel</h2>
            <p className="text-xs text-text-secondary font-medium">Manage your application</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-secondary-container px-4 py-2.5 rounded-card border border-primary-light shadow-sm">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-sm">
              <FaUserCircle className="text-white text-lg" />
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-text-primary">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-text-secondary">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-error rounded-card hover:bg-opacity-90 transition-all duration-300 shadow-sm min-h-[64px]"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
