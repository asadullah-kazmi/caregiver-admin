import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../store/thunks/statsThunks';
import { FaUsers, FaImages, FaFolder, FaUser, FaClock, FaTags, FaInbox } from 'react-icons/fa';
import { format } from 'date-fns';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, recentUsers, recentPictograms, recentRequests, loading } = useSelector((state) => state.stats);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FaUsers,
      bgColor: 'bg-primary',
      iconBg: 'bg-primary',
      barColor: 'bg-primary',
    },
    {
      title: 'Active Pictograms',
      value: stats.totalPictograms,
      icon: FaImages,
      bgColor: 'bg-primary',
      iconBg: 'bg-primary',
      barColor: 'bg-primary',
    },
    {
      title: 'Pictogram Sets',
      value: stats.totalSets,
      icon: FaFolder,
      bgColor: 'bg-primary',
      iconBg: 'bg-primary',
      barColor: 'bg-primary',
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: FaTags,
      bgColor: 'bg-primary',
      iconBg: 'bg-primary',
      barColor: 'bg-primary',
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: FaInbox,
      bgColor: 'bg-accent',
      iconBg: 'bg-accent',
      barColor: 'bg-accent',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.title} 
              className="bg-surface-white rounded-card shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-primary-light hover:border-primary group relative overflow-hidden"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex-1">
                  <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">{card.title}</p>
                  <p className="text-3xl font-semibold text-text-primary mt-2">{card.value}</p>
                  <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${card.barColor} rounded-full w-full transition-transform duration-500`}></div>
                  </div>
                </div>
                <div className={`${card.iconBg} p-4 rounded-card shadow-sm ml-4 transition-all duration-300`}>
                  <Icon className="text-white text-2xl" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="bg-surface-white rounded-card shadow-md border border-primary-light overflow-hidden">
          <div className="bg-primary p-5">
            <h2 className="text-xl font-bold text-white flex items-center drop-shadow-md">
              <FaUser className="mr-2 text-2xl" />
              Recent Users
            </h2>
          </div>
          <div className="p-6 space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-surface-white rounded-card border border-primary-light hover:shadow-md transition-all duration-200 hover:border-primary">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold shadow-md text-body-md">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 flex items-center justify-end">
                      <FaClock className="mr-1" />
                      {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FaUser className="mx-auto text-gray-300 text-4xl mb-2" />
                <p className="text-gray-500">No recent users</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Pictograms */}
        <div className="bg-surface-white rounded-card shadow-md border border-primary-light overflow-hidden">
          <div className="bg-primary p-5">
            <h2 className="text-xl font-bold text-white flex items-center drop-shadow-md">
              <FaImages className="mr-2 text-2xl" />
              Recent Pictograms
            </h2>
          </div>
          <div className="p-6 space-y-3">
            {recentPictograms.length > 0 ? (
              recentPictograms.map((pictogram) => (
                <div key={pictogram.id} className="flex items-center justify-between p-4 bg-surface-white rounded-card border border-primary-light hover:shadow-md transition-all duration-200 hover:border-primary">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg border-3 border-white ring-2 ring-green-200">
                      <img
                        src={pictogram.imageUrl}
                        alt={pictogram.keyword}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{pictogram.keyword}</p>
                      <p className="text-sm text-gray-500 capitalize">{pictogram.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 flex items-center justify-end">
                      <FaClock className="mr-1" />
                      {pictogram.uploadedAt ? format(new Date(pictogram.uploadedAt), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FaImages className="mx-auto text-gray-300 text-4xl mb-2" />
                <p className="text-gray-500">No recent pictograms</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-surface-white rounded-card shadow-md border border-primary-light overflow-hidden">
          <div className="bg-accent p-5">
            <h2 className="text-xl font-bold text-white flex items-center drop-shadow-md">
              <FaInbox className="mr-2 text-2xl" />
              Recent Requests
            </h2>
          </div>
          <div className="p-6 space-y-3">
            {recentRequests && recentRequests.length > 0 ? (
              recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-surface-white rounded-card border border-primary-light hover:shadow-md transition-all duration-200 hover:border-primary">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-semibold shadow-md text-body-md">
                      {request.keyword?.charAt(0)?.toUpperCase() || 'R'}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{request.keyword}</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {request.status || 'pending'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 flex items-center justify-end">
                      <FaClock className="mr-1" />
                      {request.createdAt ? format(new Date(request.createdAt), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FaInbox className="mx-auto text-gray-300 text-4xl mb-2" />
                <p className="text-gray-500">No recent requests</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
