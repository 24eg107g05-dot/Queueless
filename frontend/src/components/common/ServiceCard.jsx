import React from 'react';
import { getServiceIcon, formatWaitTime } from '../../utils/helpers';
import { Users, Clock } from 'lucide-react';

const ServiceCard = ({ service, onGetToken }) => {
  const { id, name, description, category, averageServiceTime, currentQueueLength, currentlyServing } = service;
  const Icon = getServiceIcon(category);

  return (
    <div className="bg-white shadow rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-50 text-primary-600 rounded-lg">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
              {category}
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-6 h-10 overflow-hidden">{description}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4 text-gray-400" />
          <span>Queue: <strong>{currentQueueLength}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>Avg: <strong>{formatWaitTime(averageServiceTime)}</strong></span>
        </div>
      </div>

      <button
        onClick={() => onGetToken(id)}
        className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        Get Token
      </button>
    </div>
  );
};

export default ServiceCard;
