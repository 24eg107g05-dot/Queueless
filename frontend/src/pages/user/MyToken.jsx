import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import TokenCard from '../../components/common/TokenCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Ticket, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const MyToken = () => {
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTokens = async () => {
    try {
      const res = await api.get('/tokens/my');
      setTokens(res.data.filter(t => t.status === 'WAITING' || t.status === 'SERVING'));
    } catch (err) {
      toast.error('Failed to load tokens');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
    // Poll for updates or rely on websockets if implemented at this level
    const interval = setInterval(fetchTokens, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (tokenId) => {
    if (window.confirm('Are you sure you want to cancel this token?')) {
      try {
        await api.post(`/tokens/${tokenId}/cancel`);
        toast.success('Token cancelled successfully');
        fetchTokens();
      } catch (err) {
        toast.error('Failed to cancel token');
      }
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tokens</h1>
          <p className="mt-2 text-gray-600">Track your current position in the queues.</p>
        </div>
        <Link to="/services" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
          <Ticket className="h-4 w-4" />
          Get New Token
        </Link>
      </div>

      {tokens.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Tokens</h2>
          <p className="text-gray-500 mb-6">You don't have any active tokens right now. Get a token to join a queue.</p>
          <Link to="/services" className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-6 py-3 rounded-lg hover:bg-primary-100 transition-colors font-medium">
            <Search className="h-5 w-5" />
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {tokens.map(token => (
            <div key={token.id} className="relative group">
              <TokenCard token={token} onCancel={handleCancel} />
              <Link 
                to={`/queue/${token.serviceId}`}
                className="absolute top-4 right-4 bg-white/50 hover:bg-white p-2 rounded-full backdrop-blur-sm transition-all"
                title="View Full Queue"
              >
                <Search className="h-5 w-5 text-gray-700" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyToken;
