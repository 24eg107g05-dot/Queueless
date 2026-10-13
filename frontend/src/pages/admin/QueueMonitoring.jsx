import React from 'react';
import CurrentlyServingList from '../../components/common/CurrentlyServingList';
import { Activity } from 'lucide-react';

const QueueMonitoring = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Queue Monitoring</h1>
          <p className="text-gray-500 mt-1">Real-time overview of active tokens being served across all counters</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <Activity className="h-4 w-4" /> Live Tracking
        </div>
      </div>

      <CurrentlyServingList title="Currently Serving Across All Services" />
    </div>
  );
};

export default QueueMonitoring;
