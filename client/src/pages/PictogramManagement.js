import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPictograms, uploadPictogram, updatePictogram, deletePictogram } from '../store/thunks/pictogramsThunks';
import { fetchActiveCategories } from '../store/thunks/categoriesThunks';
import { setSearch, setCategory } from '../store/slices/pictogramsSlice';
import { FaSearch, FaUpload, FaEdit, FaTrash, FaCheck, FaTimes, FaClock, FaImages } from 'react-icons/fa';
import { format } from 'date-fns';

const PictogramManagement = () => {
  const dispatch = useDispatch();
  const { pictograms, loading, pagination, search, category } = useSelector((state) => state.pictograms);
  const categoriesFromStore = useSelector((state) => state.categories.categories);
  const activeCategories = useMemo(() => categoriesFromStore || [], [categoriesFromStore]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPictogram, setSelectedPictogram] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    keyword: '',
    category: '',
    description: '',
    image: null,
    preview: null,
  });
  const [editForm, setEditForm] = useState({
    keyword: '',
    category: '',
    description: '',
    isActive: true,
  });
  const [uploading, setUploading] = useState(false);
  const [categoryMap, setCategoryMap] = useState({});

  useEffect(() => {
    dispatch(fetchPictograms({ page: currentPage, search, category }));
    dispatch(fetchActiveCategories());
  }, [dispatch, currentPage, search, category]);

  // Build category map for quick lookup
  useEffect(() => {
    const map = {};
    activeCategories.forEach(cat => {
      map[cat.id] = cat.nameEn || cat.name || cat.nameNl;
    });
    setCategoryMap(map);
  }, [activeCategories]);

  const handleSearch = (e) => {
    const value = e.target.value;
    dispatch(setSearch(value));
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    dispatch(setCategory(value));
    setCurrentPage(1);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setUploadForm({
        ...uploadForm,
        image: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.keyword || !uploadForm.category || !uploadForm.image) {
      alert('Please fill in all required fields');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', uploadForm.image);
      formData.append('keyword', uploadForm.keyword);
      formData.append('category', uploadForm.category);
      formData.append('description', uploadForm.description);

      await dispatch(uploadPictogram(formData)).unwrap();
      setShowUploadModal(false);
      setUploadForm({ keyword: '', category: '', description: '', image: null, preview: null });
      dispatch(fetchPictograms({ page: currentPage, search, category }));
    } catch (error) {
      alert(error.message || 'Failed to upload pictogram');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (pictogram) => {
    setSelectedPictogram(pictogram);
    setEditForm({
      keyword: pictogram.keyword,
      category: pictogram.category,
      description: pictogram.description || '',
      isActive: pictogram.isActive,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.keyword || !editForm.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await dispatch(updatePictogram({ id: selectedPictogram.id, ...editForm })).unwrap();
      setShowEditModal(false);
      setSelectedPictogram(null);
      dispatch(fetchPictograms({ page: currentPage, search, category }));
    } catch (error) {
      alert(error.message || 'Failed to update pictogram');
    }
  };

  const handleToggleActive = async (pictogram) => {
    try {
      await dispatch(updatePictogram({ id: pictogram.id, isActive: !pictogram.isActive })).unwrap();
      dispatch(fetchPictograms({ page: currentPage, search, category }));
    } catch (error) {
      alert(error.message || 'Failed to update pictogram');
    }
  };

  const handleDelete = async (pictogram) => {
    if (!window.confirm(`Are you sure you want to delete "${pictogram.keyword}"?`)) {
      return;
    }

    try {
      await dispatch(deletePictogram(pictogram.id)).unwrap();
      dispatch(fetchPictograms({ page: currentPage, search, category }));
    } catch (error) {
      alert(error.message || 'Failed to delete pictogram');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Pictogram Management</h1>
          <p className="text-gray-500 mt-1">Upload and manage custom pictograms</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center px-6 py-3 bg-primary text-white rounded-card hover:bg-primary-dark transition-all duration-300 font-semibold shadow-sm min-h-[64px]"
        >
          <FaUpload className="mr-2 text-lg" />
          Upload Pictogram
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface-white rounded-card shadow-sm border border-primary-light p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary text-xl" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by keyword..."
              className="w-full pl-12 pr-4 py-input-v px-input-h border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-surface-white shadow-sm text-body-md"
            />
          </div>
          <select
            value={category}
            onChange={handleCategoryChange}
            className="w-full px-4 py-3 border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-surface-white shadow-sm"
          >
            <option value="">All Categories</option>
            {activeCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nameEn || cat.name || cat.nameNl}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pictograms Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pictograms.map((pictogram) => (
              <div key={pictogram.id} className="bg-surface-white rounded-card shadow-sm overflow-hidden border border-primary-light hover:border-primary hover:shadow-md transition-all duration-300 group">
                <div className="relative overflow-hidden">
                  <img
                    src={pictogram.imageUrl}
                    alt={pictogram.keyword}
                    className="w-full h-48 object-cover"
                  />
                  <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                    pictogram.isActive 
                      ? 'bg-primary text-white' 
                      : 'bg-text-secondary text-white'
                  }`}>
                    {pictogram.isActive ? '✓ Active' : '✗ Inactive'}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-text-primary mb-1">{pictogram.keyword}</h3>
                  <p className="text-sm text-gray-500 capitalize mb-2 font-medium">{categoryMap[pictogram.category] || pictogram.category || 'N/A'}</p>
                  {pictogram.description && (
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{pictogram.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mb-4 flex items-center">
                    <FaClock className="mr-1" />
                    {pictogram.uploadedAt ? format(new Date(pictogram.uploadedAt), 'MMM dd, yyyy') : 'N/A'}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(pictogram)}
                      className="flex-1 flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-card hover:bg-primary-dark transition-all duration-200 text-sm font-semibold shadow-sm"
                    >
                      <FaEdit className="mr-1.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(pictogram)}
                      className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-card text-sm font-semibold transition-all duration-200 shadow-sm ${
                        pictogram.isActive
                          ? 'bg-error text-white hover:bg-opacity-90'
                          : 'bg-accent text-white hover:bg-opacity-90'
                      }`}
                    >
                      {pictogram.isActive ? <FaTimes className="mr-1.5" /> : <FaCheck className="mr-1.5" />}
                      {pictogram.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(pictogram)}
                      className="flex-1 flex items-center justify-center px-4 py-2.5 bg-error text-white rounded-card hover:bg-opacity-90 transition-all duration-200 text-sm font-semibold shadow-sm"
                    >
                      <FaTrash className="mr-1.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pictograms.length === 0 && (
            <div className="text-center py-16 bg-surface-white rounded-card shadow-sm border border-primary-light">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-4 shadow-sm">
                <FaImages className="text-white text-4xl" />
              </div>
              <p className="text-gray-700 text-xl font-bold mb-2">No pictograms found</p>
              <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-secondary-container rounded-card shadow-sm border border-primary-light px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-700 font-bold">
                Showing <span className="text-primary">{((currentPage - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="text-primary">{Math.min(currentPage * pagination.limit, pagination.total)}</span> of{' '}
                <span className="text-primary">{pagination.total}</span> pictograms
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-text-primary">Upload Pictogram</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadForm({ keyword: '', category: '', description: '', image: null, preview: null });
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-blue transition-colors">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleImageSelect}
                    required
                    className="w-full text-sm text-gray-500"
                  />
                </div>
                {uploadForm.preview && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={uploadForm.preview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keyword <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadForm.keyword}
                  onChange={(e) => setUploadForm({ ...uploadForm, keyword: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                  placeholder="e.g., appel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                >
                  <option value="">Select category</option>
                  <option value="">Select category</option>
                  {activeCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameEn || cat.name || cat.nameNl}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-card hover:bg-primary-dark disabled:opacity-50 transition-colors font-semibold shadow-sm"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadForm({ keyword: '', category: '', description: '', image: null, preview: null });
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
      {showEditModal && selectedPictogram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-text-primary">Edit Pictogram</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPictogram(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keyword <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.keyword}
                  onChange={(e) => setEditForm({ ...editForm, keyword: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                >
                  <option value="">Select category</option>
                  {activeCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameEn || cat.name || cat.nameNl}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-primary-light rounded-input focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                  rows="3"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Active</span>
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
                    setSelectedPictogram(null);
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

export default PictogramManagement;
