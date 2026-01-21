import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../store/thunks/categoriesThunks';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaTags } from 'react-icons/fa';
import { format } from 'date-fns';

const CategoryManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, loading, pagination } = useSelector((state) => state.categories);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    nameNl: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    dispatch(fetchCategories({ page: currentPage, status: statusFilter, search }));
  }, [dispatch, currentPage, statusFilter, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createCategory(formData)).unwrap();
      setShowCreateModal(false);
      setFormData({ name: '', nameEn: '', nameNl: '', description: '', isActive: true });
      dispatch(fetchCategories({ page: currentPage, status: statusFilter, search }));
    } catch (error) {
      alert(error.message || 'Failed to create category');
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name || '',
      nameEn: category.nameEn || '',
      nameNl: category.nameNl || '',
      description: category.description || '',
      isActive: category.isActive !== undefined ? category.isActive : true
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateCategory({ id: selectedCategory.id, ...formData })).unwrap();
      setShowEditModal(false);
      setSelectedCategory(null);
      dispatch(fetchCategories({ page: currentPage, status: statusFilter, search }));
    } catch (error) {
      alert(error.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    try {
      await dispatch(deleteCategory(id)).unwrap();
      dispatch(fetchCategories({ page: currentPage, status: statusFilter, search }));
    } catch (error) {
      alert(error.message || 'Failed to delete category');
    }
  };

  const handleToggleActive = async (category) => {
    try {
      await dispatch(updateCategory({ id: category.id, isActive: !category.isActive })).unwrap();
      dispatch(fetchCategories({ page: currentPage, status: statusFilter, search }));
    } catch (error) {
      alert(error.message || 'Failed to update category');
    }
  };

  const handleCategoryClick = (category) => {
    // Navigate to pictograms page with category filter
    navigate(`/pictograms?category=${category.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Category Management</h1>
          <p className="text-gray-500 mt-1">Manage pictogram categories</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-card hover:bg-primary-dark transition-colors flex items-center space-x-2 font-semibold min-h-[64px]"
        >
          <FaPlus />
          <span>Create Category</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary bg-surface-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <FaTags className="mx-auto text-gray-300 text-5xl mb-4" />
            <p className="text-gray-500 text-lg">No categories found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-card hover:bg-primary-dark transition-colors font-semibold"
            >
              Create First Category
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">English</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dutch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pictograms</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td 
                        className="px-6 py-4 whitespace-nowrap cursor-pointer"
                        onClick={() => handleCategoryClick(category)}
                        title="Click to view pictograms in this category"
                      >
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        {category.description && (
                          <div className="text-sm text-gray-500">{category.description}</div>
                        )}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                        onClick={() => handleCategoryClick(category)}
                      >
                        {category.nameEn}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                        onClick={() => handleCategoryClick(category)}
                      >
                        {category.nameNl}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                        onClick={() => handleCategoryClick(category)}
                      >
                        {category.pictogramCount || 0}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap cursor-pointer"
                        onClick={() => handleCategoryClick(category)}
                      >
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            category.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                        onClick={() => handleCategoryClick(category)}
                      >
                        {category.createdAt ? format(new Date(category.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-primary hover:text-primary-dark"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleToggleActive(category)}
                            className={`${
                              category.isActive ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'
                            }`}
                          >
                            {category.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600 hover:text-red-800"
                            disabled={category.pictogramCount > 0}
                            title={category.pictogramCount > 0 ? 'Cannot delete category with pictograms' : 'Delete category'}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} categories
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Create Category</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Default) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Dutch) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameNl}
                  onChange={(e) => setFormData({ ...formData, nameNl: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-card hover:bg-primary-dark transition-colors font-semibold shadow-sm"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', nameEn: '', nameNl: '', description: '', isActive: true });
                  }}
                  className="flex-1 px-4 py-2.5 bg-primary-light text-text-primary rounded-card hover:bg-opacity-80 transition-colors font-semibold shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Edit Category</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Default) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Dutch) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameNl}
                  onChange={(e) => setFormData({ ...formData, nameNl: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                  rows="3"
                />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-primary-light text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-card hover:bg-primary-dark transition-colors font-semibold shadow-sm"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCategory(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-primary-light text-text-primary rounded-card hover:bg-opacity-80 transition-colors font-semibold shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
