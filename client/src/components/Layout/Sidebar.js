import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaImages, FaTags, FaInbox } from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: FaHome, color: 'bg-primary' },
    { path: '/users', label: 'User Management', icon: FaUsers, color: 'bg-primary' },
    { path: '/categories', label: 'Category Management', icon: FaTags, color: 'bg-primary' },
    { path: '/pictograms', label: 'Pictogram Management', icon: FaImages, color: 'bg-primary' },
    { path: '/requests', label: 'Request Management', icon: FaInbox, color: 'bg-primary' },
  ];

  return (
    <aside className="w-64 bg-surface-white shadow-lg border-r border-primary-light">
      <div className="p-6 border-b border-primary-light bg-primary">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-surface-white rounded-card flex items-center justify-center shadow-md">
            <span className="text-primary font-bold text-xl">D</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white drop-shadow-lg">Dag in beeld</h1>
            <p className="text-xs text-white/90 mt-0.5 font-medium">Admin Panel</p>
          </div>
        </div>
      </div>
      <nav className="mt-6 px-3 pb-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mb-2 rounded-card transition-all duration-300 ${
                isActive
                  ? `${item.color} text-white shadow-md`
                  : 'text-text-primary hover:bg-primary-light hover:text-white hover:shadow-sm'
              }`}
            >
              <Icon className={`mr-3 text-lg ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span className="font-semibold">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2.5 h-2.5 bg-white rounded-full shadow-sm animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
