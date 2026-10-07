import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { History, CheckCircle, XCircle } from 'lucide-react';
import { formatTokenNumber } from '../../utils/helpers';

const AppointmentHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Assume backend returns all tokens, we filter COMPLETED and CANCELLED
        const res = await api.get('/tokens/my');
        const pastTokens = res.data.filter(t => t.status === 'COMPLETED' || t.status === 'CANCELLED');
        setHistory(pastTokens.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="p-3 bg-gray-100 rounded-lg">
          <History className="h-6 w-6 text-gray-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment History</h1>
          <p className="text-sm text-gray-500">Your past visits and cancelled tokens.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {history.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No history found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map(token => (
              <div key={token.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{token.serviceName}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Token: <span className="font-medium text-gray-700">{formatTokenNumber(token.tokenNumber)}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Date: {new Date(token.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  {token.status === 'COMPLETED' ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                      <CheckCircle className="h-4 w-4" /> Completed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                      <XCircle className="h-4 w-4" /> Cancelled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentHistory;
