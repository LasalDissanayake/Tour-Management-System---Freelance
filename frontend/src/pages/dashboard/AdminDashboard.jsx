import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import axios from 'axios';
import {
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { authState, logout } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    guides: 0,
    tourists: 0,
    serviceProviders: 0,
    admins: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    userToDelete: null
  });

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/stats', {
        withCredentials: true
      });
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      showError('Failed to fetch user statistics');
    }
  };

  // Fetch users list
  const fetchUsers = async (page = 1, role = 'all', search = '') => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/users?page=${page}&role=${role}&limit=10&search=${search}`, {
        withCredentials: true
      });
      if (response.data.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(response.data.pagination.currentPage);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Failed to fetch users');
    }
  };

  // Open delete confirmation modal
  const openDeleteConfirmation = (user) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete User',
      message: `Are you sure you want to delete "${user.firstName} ${user.lastName}"? This action cannot be undone and will permanently remove all user data.`,
      onConfirm: () => confirmDeleteUser(user._id),
      userToDelete: user
    });
  };

  // Confirm delete user
  const confirmDeleteUser = async (userId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        withCredentials: true
      });
      if (response.data.success) {
        // Close modal first
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, userToDelete: null });
        
        // Show success toast
        showSuccess('🗑️ User deleted successfully!', 4000);
        
        // Refresh users list and stats
        fetchUsers(currentPage, selectedRole, searchTerm);
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showError('Failed to delete user. Please try again.');
      // Close modal on error too
      setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, userToDelete: null });
    }
  };

  // Close confirmation modal
  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, userToDelete: null });
  };

  // Toggle user status
  const toggleUserStatus = async (userId) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/admin/users/${userId}/toggle-status`, {}, {
        withCredentials: true
      });
      if (response.data.success) {
        // Refresh users list and stats
        fetchUsers(currentPage, selectedRole, searchTerm);
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Failed to update user status');
    }
  };

  // Download report
  const downloadReport = async () => {
    try {
      showInfo('📄 Generating report... Please wait');
      
      // Use window.open for PDF download to avoid CORS issues
      const reportUrl = 'http://localhost:5000/api/admin/users/report';
      const newWindow = window.open(reportUrl, '_blank');
      
      // Fallback if popup is blocked
      if (!newWindow) {
        // Create a temporary link and click it
        const link = document.createElement('a');
        link.href = reportUrl;
        link.target = '_blank';
        link.download = `users-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      // Show success message after a short delay
      setTimeout(() => {
        showSuccess('📊 Report downloaded successfully!', 4000);
      }, 1000);
      
    } catch (error) {
      console.error('Error downloading report:', error);
      showError('Failed to download report. Please try again.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(1, 'all', '')]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
    setCurrentPage(1);
    fetchUsers(1, role, searchTerm);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchUsers(page, selectedRole, searchTerm);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    
    // Clear previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // Debounce search
    window.searchTimeout = setTimeout(() => {
      fetchUsers(1, selectedRole, value);
    }, 500);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Guide':
        return 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300';
      case 'Tourist':
        return 'bg-gradient-to-r from-amber-100 to-orange-200 text-orange-800 border border-orange-300';
      case 'ServiceProvider':
        return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300';
      case 'Admin':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-blue-300 opacity-20 mx-auto"></div>
          </div>
          <h2 className="mt-6 text-xl font-semibold text-gray-900">Loading Admin Dashboard</h2>
          <p className="mt-2 text-sm text-gray-600">Please wait while we fetch the latest data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header with gradient */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <CogIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-blue-100 text-sm">System Management & Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-white font-medium">
                  {authState.user?.firstName} {authState.user?.lastName}
                </p>
                <p className="text-blue-200 text-sm">Administrator</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {authState.user?.firstName?.[0]}{authState.user?.lastName?.[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="group relative overflow-hidden rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-red-600 hover:shadow-lg hover:scale-105"
              >
                <span className="relative z-10">Logout</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Enhanced Stats Cards with animations */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="group bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                  <UserGroupIcon className="h-8 w-8 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{stats.total}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full w-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </div>
          </div>

          <div className="group bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg">
                  <ChartBarIcon className="h-8 w-8 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Guides</dt>
                    <dd className="text-3xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-200">{stats.guides}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full w-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </div>
          </div>

          <div className="group bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                  <DocumentTextIcon className="h-8 w-8 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tourists</dt>
                    <dd className="text-3xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">{stats.tourists}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full w-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </div>
          </div>

          <div className="group bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
                  <CogIcon className="h-8 w-8 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Service Providers</dt>
                    <dd className="text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">{stats.serviceProviders}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full w-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced User Management Table */}
        <div className="bg-white shadow-xl overflow-hidden rounded-2xl border border-gray-100">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-8 border-b border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl leading-6 font-bold text-gray-900 flex items-center">
                  <UserGroupIcon className="h-7 w-7 text-blue-600 mr-3" />
                  User Management
                </h3>
                <p className="mt-2 max-w-2xl text-sm text-gray-600">
                  Manage all users in the system with advanced filtering and controls
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={downloadReport}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                  Download Report
                </button>
              </div>
            </div>
            
            {/* Search Bar and Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              
              {/* Role Filters */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleRoleFilter('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedRole === 'all' 
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  All Users
                </button>
                <button
                  onClick={() => handleRoleFilter('Guide')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedRole === 'Guide' 
                      ? 'bg-emerald-600 text-white shadow-lg transform scale-105' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Guides
                </button>
                <button
                  onClick={() => handleRoleFilter('Tourist')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedRole === 'Tourist' 
                      ? 'bg-orange-600 text-white shadow-lg transform scale-105' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Tourists
                </button>
                <button
                  onClick={() => handleRoleFilter('ServiceProvider')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedRole === 'ServiceProvider' 
                      ? 'bg-purple-600 text-white shadow-lg transform scale-105' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Providers
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    User Information
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Member Since
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users.map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150 group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                            <span className="text-lg font-bold text-white">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-5">
                          <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full shadow-sm ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.ceil((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))} days ago
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <button
                        onClick={() => openDeleteConfirmation(user)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 hover:scale-105 transition-all duration-200"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <span className="text-xs text-gray-500">
                    • Showing {users.length} users
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all duration-200 disabled:hover:shadow-none"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all duration-200 disabled:hover:shadow-none"
                  >
                    Next
                    <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Delete User"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default AdminDashboard;
