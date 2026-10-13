import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useServingWebSocket } from '../../hooks/useWebSocket';
import { Activity, Clock, Layers } from 'lucide-react';
import { timeAgo } from '../../utils/helpers';

/**
 * Real-time "Currently Serving" list component.
 * Displays all active tokens being served across services,
 * or for a specific service if serviceId is provided.
 */
const CurrentlyServingList = ({ serviceId = null, title = "Currently Serving", showHeader = true, className = "" }) => {
  const [servingTokens, setServingTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchServingTokens = useCallback(async () => {
    try {
      const url = serviceId ? `/queue/${serviceId}/serving` : '/queue/serving';
      const res = await api.get(url);
      if (Array.isArray(res.data)) {
        setServingTokens(res.data);
      } else {
        setServingTokens([]);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load currently serving tokens', error);
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  // Initial load
  useEffect(() => {
    fetchServingTokens();
  }, [fetchServingTokens]);

  // Real-time WebSocket updates via existing STOMP/SockJS client
  useServingWebSocket(useCallback((payload) => {
    if (Array.isArray(payload)) {
      if (serviceId) {
        const filtered = payload.filter(t => t.serviceId === Number(serviceId));
        setServingTokens(filtered);
      } else {
        setServingTokens(payload);
      }
      setLastUpdated(new Date());
    } else {
      // If server sent notification string, refetch
      fetchServingTokens();
    }
  }, [serviceId, fetchServingTokens]));

  // Polling fallback to guarantee continuous synchronization
  useEffect(() => {
    const interval = setInterval(() => {
      fetchServingTokens();
    }, 6000);
    return () => clearInterval(interval);
  }, [fetchServingTokens]);

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {showHeader && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="font-bold text-gray-900 text-lg tracking-tight flex items-center gap-2">
              {title}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Activity className="h-3.5 w-3.5 text-primary-500" />
            <span>{servingTokens.length} {servingTokens.length === 1 ? 'counter active' : 'counters active'}</span>
          </div>
        </div>
      )}

      <div className="p-5">
        {isLoading && servingTokens.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm flex flex-col items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading serving tokens...</span>
          </div>
        ) : servingTokens.length > 0 ? (
          <div className="space-y-3">
            {servingTokens.map((token) => (
              <div
                key={token.tokenId || token.tokenNumber}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200/80 rounded-xl transition-all shadow-sm gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl select-none" role="img" aria-label="Serving status">
                    🟢
                  </span>
                  <div>
                    {/* Clear text format: 🟢 Cardiology — Token C012 — Counter 2 */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-gray-900 text-base">
                        {token.serviceName}
                      </span>
                      <span className="text-gray-400 font-normal">—</span>
                      <span className="font-extrabold text-primary-700 text-base tracking-wide bg-white px-2.5 py-0.5 rounded-md border border-primary-200 shadow-2xs">
                        Token {token.tokenNumber}
                      </span>
                      <span className="text-gray-400 font-normal">—</span>
                      <span className="font-semibold text-gray-700 text-sm bg-gray-100 px-2 py-0.5 rounded-md">
                        {token.counter || 'Counter 1'}
                      </span>
                    </div>

                    {token.staffName && (
                      <p className="text-xs text-gray-500 mt-1">
                        Staff: <span className="font-medium text-gray-700">{token.staffName}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-gray-500">
                  {token.calledAt && (
                    <span className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded-md border border-gray-200 text-gray-600">
                      <Clock className="h-3 w-3 text-gray-400" />
                      {timeAgo(token.calledAt)}
                    </span>
                  )}
                  <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-2xs uppercase tracking-wider">
                    {token.status || 'SERVING'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 px-4 text-center bg-gray-50/70 rounded-xl border border-dashed border-gray-200">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2.5 text-gray-400">
              <Layers className="h-5 w-5" />
            </div>
            <p className="text-base font-semibold text-gray-800 mb-1">
              No token is currently being served.
            </p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              When staff calls the next patient or customer, the active token and counter will appear here in real time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentlyServingList;
