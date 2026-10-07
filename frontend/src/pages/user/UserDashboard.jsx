import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import api from '../../services/api';
import TokenCard from '../../components/common/TokenCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Ticket, Search, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [activeTokens, setActiveTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveTokens();
  }, []);

  const fetchActiveTokens = async () => {
    try {
      const res = await api.get('/tokens/my');
      setActiveTokens(res.data.filter(t => t.status === 'WAITING' || t.status === 'SERVING'));
    } catch (error) {
      console.error('Failed to fetch tokens', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelToken = async (tokenId) => {
    if (window.confirm('Are you sure you want to cancel this token?')) {
      try {
        await api.post(`/tokens/${tokenId}/cancel`);
        toast.success('Token cancelled successfully');
        fetchActiveTokens();
      } catch (error) {
        toast.error('Failed to cancel token');
      }
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  const recentNotifications = notifications.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-500 mt-1">Here is what is happening with your queues today.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary-600" />
            Your Active Tokens
          </h2>
          
          {activeTokens.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {activeTokens.map(token => (
                <TokenCard key={token.id} token={token} onCancel={handleCancelToken} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300">
              <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Active Tokens</h3>
              <p className="text-gray-500 mb-4">You are not in any queues right now.</p>
              <Link 
                to="/services" 
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Search className="h-4 w-4" />
                Find a Service
              </Link>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            <Link to="/services" className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all flex items-center gap-4 group">
              <div className="p-4 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                <Search className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Get New Token</h3>
                <p className="text-sm text-gray-500">Browse available services</p>
              </div>
            </Link>
            
            <Link to="/ai-assistant" className="bg-white p-6 rounded-xl border border-gray-200 hover:border-secondary-500 hover:shadow-md transition-all flex items-center gap-4 group">
              <div className="p-4 bg-secondary-50 rounded-lg group-hover:bg-secondary-100 transition-colors">
                <Bot className="h-6 w-6 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                <p className="text-sm text-gray-500">Ask questions, get help</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900">Recent Notifications</h3>
              <Link to="/notifications" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentNotifications.length > 0 ? (
                recentNotifications.map(notification => (
                  <div key={notification.id} className={`p-4 ${!notification.read ? 'bg-blue-50/50' : ''}`}>
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <span className="text-xs text-gray-500 mt-1 block">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No recent notifications
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
