import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, updateRequestStatus, deleteRequest } from '../store/thunks/requestsThunks';
import { fetchActiveCategories } from '../store/thunks/categoriesThunks';
import { FaSearch, FaFilter, FaCheck, FaTimes, FaTrash, FaEye, FaInbox } from 'react-icons/fa';
import { format } from 'date-fns';

const RequestManagement = () => {
  const dispatch = useDispatch();
  const { requests, loading, pagination } = useSelector((state) => state.requests);
  const { categories } = useSelector((state) => state.categories);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    dispatch(fetchRequests({ page: currentPage, status: statusFilter, category: categoryFilter, search }));
    dispatch(fetchActiveCategories());
  }, [dispatch, currentPage, statusFilter, categoryFilter, search]);

  const handleStatusChange = async (request, status) => {
    if (status === 'rejected' && !adminNote.trim()) {
      alert('Please provide an admin note when rejecting a request.');
      return;
    }
    try {
      await dispatch(updateRequestStatus({ id: request.id, status, adminNote: adminNote.trim() || null })).unwrap();
      setShowStatusModal(false);
      setAdminNote('');
      setNewStatus('');
      setSelectedRequest(null);
      dispatch(fetchRequests({ page: currentPage, status: statusFilter, category: categoryFilter, search }));
    } catch (error) {
      alert(error.message || 'Failed to update request status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }
    try {
      await dispatch(deleteRequest(id)).unwrap();
      dispatch(fetchRequests({ page: currentPage, status: statusFilter, category: categoryFilter, search }));
    } catch (error) {
      alert(error.message || 'Failed to delete request');
    }
  };

  const openStatusModal = (request, status) => {
    setSelectedRequest(request);
    setNewStatus(status);
    setAdminNote(request.adminNote || '');
    setShowStatusModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Pictogram Request Management</h1>
          <p className="text-gray-500 mt-1">Manage user requests for new pictograms</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameEn || cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <FaInbox className="mx-auto text-gray-300 text-5xl mb-4" />
            <p className="text-gray-500 text-lg">No requests found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.keyword}</div>
                        {request.description && (
                          <div className="text-sm text-gray-500">{request.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.categoryInfo ? (request.categoryInfo.nameEn || request.categoryInfo.name) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.user ? (request.user.name || request.user.email || 'N/A') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.createdAt ? format(new Date(request.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetailsModal(true);
                            }}
                            className="text-primary-blue hover:text-primary-blue-light"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => openStatusModal(request, 'approved')}
                                className="text-green-600 hover:text-green-800"
                                title="Approve"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => openStatusModal(request, 'rejected')}
                                className="text-red-600 hover:text-red-800"
                                title="Reject"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <button
                              onClick={() => openStatusModal(request, 'completed')}
                              className="text-blue-600 hover:text-blue-800"
                              title="Mark as Completed"
                            >
                              <FaCheck />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(request.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
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
                  Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} requests
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

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-text-primary">Request Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Keyword</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.keyword}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedRequest.categoryInfo ? (selectedRequest.categoryInfo.nameEn || selectedRequest.categoryInfo.name) : 'N/A'}
                </p>
              </div>
              {selectedRequest.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.description}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Requested By</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedRequest.user ? (selectedRequest.user.name || selectedRequest.user.email || 'N/A') : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                  {selectedRequest.status || 'pending'}
                </span>
              </div>
              {selectedRequest.adminNote && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Note</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.adminNote}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedRequest.createdAt ? format(new Date(selectedRequest.createdAt), 'PPpp') : 'N/A'}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2.5 bg-primary-light text-text-primary rounded-card hover:bg-opacity-80 transition-colors font-semibold shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              {newStatus === 'approved' && 'Approve Request'}
              {newStatus === 'rejected' && 'Reject Request'}
              {newStatus === 'completed' && 'Mark as Completed'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keyword
                </label>
                <p className="text-sm text-gray-900">{selectedRequest.keyword}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Note {newStatus === 'rejected' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  required={newStatus === 'rejected'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  rows="4"
                  placeholder={newStatus === 'rejected' ? 'Please explain why this request is being rejected...' : 'Add a note (optional)...'}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleStatusChange(selectedRequest, newStatus)}
                  className={`flex-1 px-4 py-2.5 text-white rounded-card transition-colors font-semibold shadow-sm ${
                    newStatus === 'approved' || newStatus === 'completed'
                      ? 'bg-primary hover:bg-primary-dark'
                      : 'bg-error hover:bg-opacity-90'
                  }`}
                >
                  {newStatus === 'approved' && 'Approve'}
                  {newStatus === 'rejected' && 'Reject'}
                  {newStatus === 'completed' && 'Mark as Completed'}
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setAdminNote('');
                    setNewStatus('');
                    setSelectedRequest(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-primary-light text-text-primary rounded-card hover:bg-opacity-80 transition-colors font-semibold shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestManagement;
