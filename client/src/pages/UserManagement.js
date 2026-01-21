import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../store/thunks/usersThunks';
import { setSearch } from '../store/slices/usersSlice';
import { FaSearch, FaDownload } from 'react-icons/fa';
import { format } from 'date-fns';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, loading, pagination, search } = useSelector((state) => state.users);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchUsers({ page: currentPage, search }));
  }, [dispatch, currentPage, search]);

  const handleSearch = (e) => {
    const value = e.target.value;
    dispatch(setSearch(value));
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Client Name', 'Age Range', 'Language', 'Registration Date'];
    const rows = users.map(user => [
      user.name,
      user.email,
      user.role,
      user.clientName,
      user.ageRange,
      user.language,
      user.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd') : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">User Management</h1>
          <p className="text-gray-500 mt-1">Manage and view all registered users</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center px-6 py-3 bg-primary text-white rounded-card hover:bg-primary-dark transition-all duration-300 font-semibold shadow-md min-h-[64px]"
        >
          <FaDownload className="mr-2 text-lg" />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="bg-surface-white rounded-card shadow-md border border-primary-light p-5">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary text-xl" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search by name..."
            className="w-full pl-12 pr-4 py-input-v px-input-h border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-surface-white shadow-sm text-body-md"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-primary">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Client Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Age Range
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Registration Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-secondary-container transition-all duration-200 border-b border-primary-light">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.clientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.ageRange}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-secondary-container px-6 py-4 flex items-center justify-between border-t border-primary-light">
                <div className="text-sm text-gray-700 font-bold">
                  Showing <span className="text-primary-blue">{((currentPage - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="text-accent-purple">{Math.min(currentPage * pagination.limit, pagination.total)}</span> of{' '}
                  <span className="text-accent-pink">{pagination.total}</span> users
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-5 py-2.5 border border-primary rounded-card disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-dark transition-all duration-200 font-semibold disabled:hover:bg-primary"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-5 py-2.5 border border-primary rounded-card disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-dark transition-all duration-200 font-semibold disabled:hover:bg-primary"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
