import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false }) => {
  const containerClass = fullScreen 
    ? "min-h-screen flex items-center justify-center bg-gray-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClass}>
      <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
    </div>
  );
};

export default LoadingSpinner;
