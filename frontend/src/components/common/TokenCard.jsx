import React from 'react';
import { formatTokenNumber, getStatusColor, formatWaitTime } from '../../utils/helpers';
import { Clock, Users, XCircle } from 'lucide-react';

const TokenCard = ({ token, onCancel }) => {
  const { id, tokenNumber, status, serviceName, position, currentlyServing, estimatedWaitTime } = token;

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
      <div className={`px-6 py-4 flex justify-between items-center ${getStatusColor(status)}`}>
        <h3 className="text-lg font-semibold">{serviceName}</h3>
        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
          {status}
        </span>
      </div>
      
      <div className="p-6">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-1">Your Token Number</p>
          <p className="text-5xl font-bold text-gray-900">{formatTokenNumber(tokenNumber)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <Users className="h-5 w-5 text-primary-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Position</p>
            <p className="text-lg font-semibold text-gray-900">
              {position > 0 ? position : '---'}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <Clock className="h-5 w-5 text-primary-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Est. Wait</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatWaitTime(estimatedWaitTime)}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 mb-6 bg-blue-50 p-3 rounded-lg">
          <span>Currently Serving:</span>
          <span className="font-bold text-blue-700">{formatTokenNumber(currentlyServing)}</span>
        </div>

        {status === 'WAITING' && onCancel && (
          <button
            onClick={() => onCancel(id)}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <XCircle className="h-5 w-5" />
            Cancel Token
          </button>
        )}
      </div>
    </div>
  );
};

export default TokenCard;
