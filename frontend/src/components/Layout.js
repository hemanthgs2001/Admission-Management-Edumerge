import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiSettings, 
  FiUsers, 
  FiLogOut,
  FiHardDrive,
  FiCalendar,
  FiUser
} from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <MdDashboard className="text-xl" />, roles: ['admin', 'admission_officer', 'management'] },
    { path: '/masters', label: 'Masters', icon: <FiSettings className="text-xl" />, roles: ['admin'] },
    { path: '/applicants', label: 'Applicants', icon: <FiUsers className="text-xl" />, roles: ['admission_officer'] },
  ];

  const getAvailableLinks = () => {
    return navLinks.filter(link => link.roles.includes(user?.role));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Sidebar Navigation */}
      <div className="fixed inset-y-0 left-0 z-30 w-72 bg-gray-900 border-r border-gray-700 shadow-2xl transform transition-transform duration-300 ease-in-out">
        {/* Logo Section */}
        <div className="flex items-center justify-center h-20 bg-gradient-to-r from-cyan-600 to-teal-600">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">AdmissionHub</h1>
            <p className="text-xs text-cyan-200 mt-1">Enterprise Management System</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {getAvailableLinks().map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group
                ${isActive(link.path) 
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-cyan-400'
                }
              `}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
              {isActive(link.path) && (
                <div className="ml-auto w-1.5 h-8 bg-white rounded-full"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-900">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all duration-200 group"
          >
            <FiLogOut className="text-xl" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-72">
        {/* Top Header */}
        <div className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-20">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-100">
                  {getAvailableLinks().find(link => isActive(link.path))?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Welcome back! Here's your admission overview.
                </p>
              </div>
              
              {/* Right side - User Profile and Date */}
              <div className="flex items-center space-x-6">
                {/* Date Display */}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <FiCalendar className="text-cyan-400" />
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date().toLocaleTimeString()}</p>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-700"></div>

                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    <FiUser className="text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-100">{user?.username}</p>
                    <p className="text-xs text-cyan-400 capitalize">{user?.role?.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;