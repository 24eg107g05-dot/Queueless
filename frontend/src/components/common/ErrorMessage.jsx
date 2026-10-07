import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="rounded-md bg-red-50 p-4 my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-red-700">{message || 'An error occurred'}</p>
          {onRetry && (
            <p className="mt-3 text-sm md:mt-0 md:ml-6">
              <button
                onClick={onRetry}
                className="whitespace-nowrap font-medium text-red-700 hover:text-red-600"
              >
                Try again <span aria-hidden="true">&rarr;</span>
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
