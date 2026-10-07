import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { Bell, User, LogOut, Menu, ListChecks } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderNavLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <Link to="/login" className="text-gray-600 hover:text-primary-600 px-3 py-2">Login</Link>
          <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Get Started</Link>
        </>
      );
    }

    if (user?.role === 'ADMIN') {
      return (
        <>
          <Link to="/admin" className="text-gray-600 hover:text-primary-600 px-3 py-2">Dashboard</Link>
          <Link to="/admin/services" className="text-gray-600 hover:text-primary-600 px-3 py-2">Services</Link>
          <Link to="/admin/users" className="text-gray-600 hover:text-primary-600 px-3 py-2">Users</Link>
        </>
      );
    }

    if (user?.role === 'STAFF') {
      return (
        <>
          <Link to="/staff" className="text-gray-600 hover:text-primary-600 px-3 py-2">Dashboard</Link>
          <Link to="/staff/queue" className="text-gray-600 hover:text-primary-600 px-3 py-2">Queue Management</Link>
        </>
      );
    }

    return (
      <>
        <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 px-3 py-2">Dashboard</Link>
        <Link to="/services" className="text-gray-600 hover:text-primary-600 px-3 py-2">Services</Link>
        <Link to="/my-token" className="text-gray-600 hover:text-primary-600 px-3 py-2">My Token</Link>
        <Link to="/ai-assistant" className="text-gray-600 hover:text-primary-600 px-3 py-2">AI Assistant</Link>
      </>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={isAuthenticated ? (user?.role === 'ADMIN' ? '/admin' : user?.role === 'STAFF' ? '/staff' : '/dashboard') : '/'} className="flex items-center gap-2">
              <ListChecks className="h-8 w-8 text-primary-600" />
              <span className="font-bold text-xl text-gray-900">QueueLess</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {renderNavLinks()}
            {isAuthenticated && (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l">
                <Link to="/notifications" className="relative text-gray-500 hover:text-gray-700">
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                    <User className="h-5 w-5" />
                    <span>{user?.name || 'Profile'}</span>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500 hover:text-gray-700">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            {renderNavLinks()}
            {isAuthenticated && (
              <>
                <Link to="/notifications" className="text-gray-600 hover:text-primary-600 px-3 py-2 flex items-center justify-between">
                  Notifications
                  {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>}
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-primary-600 px-3 py-2">Profile</Link>
                <button onClick={handleLogout} className="text-left text-red-600 hover:bg-gray-100 px-3 py-2">Logout</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
