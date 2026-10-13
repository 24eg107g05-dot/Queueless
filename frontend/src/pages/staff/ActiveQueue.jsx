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

  const [counterNumber, setCounterNumber] = useState('Counter 1');

  useWebSocket(serviceId, (data) => {
    if (data === 'UPDATE' || typeof data === 'string') {
      fetchQueue();
    } else {
      setQueueData(data);
    }
  });

  const handleCallNext = async () => {
    try {
      await api.post(`/queue/${serviceId}/next`, null, {
        params: { counter: counterNumber }
      });
      toast.success(`Called next token to ${counterNumber}`);
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

  const servingTokensList = queueData.servingTokens || (queueData.servingTokenId ? [{
    tokenId: queueData.servingTokenId,
    tokenNumber: queueData.currentlyServing,
    counter: counterNumber,
    serviceName: queueData.serviceName
  }] : []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{queueData.serviceName}</h1>
          <p className="text-sm text-gray-500">Active Queue Management</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={counterNumber}
            onChange={(e) => setCounterNumber(e.target.value)}
            placeholder="Counter 1"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            title="Desk/Counter Label"
          />
          <button
            onClick={handleCallNext}
            className="flex-1 sm:flex-none bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Play className="h-4 w-4" />
            Call Next Waiting
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 text-center">
            <h2 className="text-sm font-semibold text-primary-700 uppercase tracking-wider mb-2">Currently Serving</h2>
            
            {servingTokensList.length > 0 ? (
              <div className="space-y-4">
                {servingTokensList.map((st) => (
                  <div key={st.tokenId || st.tokenNumber} className="bg-white p-4 rounded-xl border border-primary-200 shadow-2xs">
                    <div className="text-4xl font-extrabold text-primary-900 mb-1">
                      {formatTokenNumber(st.tokenNumber)}
                    </div>
                    <div className="text-xs font-semibold text-primary-700 mb-3 bg-primary-50 py-1 px-2 rounded inline-block">
                      {st.counter || 'Counter'}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleComplete(st.tokenId)}
                        className="flex-1 bg-green-500 text-white py-1.5 px-2 rounded-lg text-xs font-semibold flex justify-center items-center gap-1 hover:bg-green-600 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" /> Complete
                      </button>
                      <button 
                        onClick={() => handleSkip(st.tokenId)}
                        className="bg-gray-200 text-gray-700 py-1.5 px-2 rounded-lg text-xs font-semibold flex justify-center items-center gap-1 hover:bg-gray-300 transition-colors"
                      >
                        <SkipForward className="h-3.5 w-3.5" /> Skip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8">
                <div className="text-5xl font-bold text-gray-300 mb-2">---</div>
                <p className="text-xs text-gray-500">No token currently being served</p>
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
