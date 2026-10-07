import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, Clock, ArrowLeft, Activity } from 'lucide-react';
import { formatTokenNumber, formatWaitTime } from '../../utils/helpers';

const QueueStatusPage = () => {
  const { serviceId } = useParams();
  const [queueData, setQueueData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQueueStatus = async () => {
    try {
      const res = await api.get(`/queue/${serviceId}`);
      setQueueData(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load queue status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueStatus();
  }, [serviceId]);

  useWebSocket(serviceId, (data) => {
    setQueueData(data);
  });

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
  if (!queueData) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/services" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{queueData.serviceName}</h1>
          <p className="text-gray-500 flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" /> Live Status
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-primary-600 rounded-2xl p-6 text-white text-center shadow-lg">
            <h3 className="text-primary-100 font-medium mb-2">Currently Serving</h3>
            <div className="text-6xl font-bold mb-4">
              {queueData.currentlyServing ? formatTokenNumber(queueData.currentlyServing) : '---'}
            </div>
            <div className="flex justify-center gap-4 text-sm bg-primary-700/50 py-2 rounded-lg">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> {queueData.waitingCount} waiting
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> ~{formatWaitTime(queueData.averageWaitTime)}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Waiting List</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {queueData.waitingTokens && queueData.waitingTokens.length > 0 ? (
              queueData.waitingTokens.map((token, index) => (
                <div key={token.id} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-medium text-sm">
                      {index + 1}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      Token {formatTokenNumber(token.tokenNumber)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    Est. wait: {formatWaitTime(token.estimatedWaitTime)}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No one is currently waiting in this queue.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueStatusPage;
