import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Play, Check, SkipForward } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatTokenNumber, formatWaitTime } from '../../utils/helpers';

const ActiveQueue = () => {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  const [queueData, setQueueData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueue = async () => {
    if (!serviceId) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get(`/queue/${serviceId}`);
      setQueueData(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [serviceId]);

  useWebSocket(serviceId, (data) => {
    setQueueData(data);
  });

  const handleCallNext = async () => {
    try {
      await api.post(`/queue/${serviceId}/next`);
      toast.success('Called next token');
      fetchQueue();
    } catch (error) {
      toast.error('Failed to call next');
    }
  };

  const handleComplete = async (tokenId) => {
    try {
      await api.post(`/queue/token/${tokenId}/complete`);
      toast.success('Marked as complete');
      fetchQueue();
    } catch (error) {
      toast.error('Failed to complete token');
    }
  };

  const handleSkip = async (tokenId) => {
    try {
      await api.post(`/queue/token/${tokenId}/skip`);
      toast.success('Token skipped');
      fetchQueue();
    } catch (error) {
      toast.error('Failed to skip token');
    }
  };

  if (!serviceId) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">No service selected. Go back to Dashboard.</div>;
  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!queueData) return <div className="p-8 text-center text-gray-500">No data available</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{queueData.serviceName}</h1>
          <p className="text-sm text-gray-500">Active Queue Management</p>
        </div>
        <button
          onClick={handleCallNext}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Play className="h-5 w-5" />
          Call Next Waiting
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 text-center">
            <h2 className="text-sm font-semibold text-primary-700 uppercase tracking-wider mb-2">Currently Serving</h2>
            <div className="text-6xl font-bold text-primary-900 mb-4">
              {queueData.currentlyServing ? formatTokenNumber(queueData.currentlyServing) : '---'}
            </div>
            {queueData.currentlyServing && queueData.servingTokenId && (
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => handleComplete(queueData.servingTokenId)}
                  className="w-full bg-green-500 text-white py-2 rounded flex justify-center items-center gap-2 hover:bg-green-600"
                >
                  <Check className="h-4 w-4" /> Complete
                </button>
                <button 
                  onClick={() => handleSkip(queueData.servingTokenId)}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded flex justify-center items-center gap-2 hover:bg-gray-300"
                >
                  <SkipForward className="h-4 w-4" /> Skip
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Waiting Tokens ({queueData.waitingCount})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wait Time</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {queueData.waitingTokens && queueData.waitingTokens.length > 0 ? (
                  queueData.waitingTokens.map((token, idx) => (
                    <tr key={token.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatTokenNumber(token.tokenNumber)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ~{formatWaitTime(token.estimatedWaitTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleSkip(token.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Skip
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                      Queue is currently empty.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveQueue;
