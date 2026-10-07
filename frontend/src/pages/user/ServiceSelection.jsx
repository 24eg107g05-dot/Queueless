import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ServiceCard from '../../components/common/ServiceCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import toast from 'react-hot-toast';

const ServiceSelection = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/services');
      setServices(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load services. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetToken = async (serviceId) => {
    try {
      const res = await api.post('/tokens', { serviceId });
      toast.success(`Token ${res.data.tokenNumber} generated successfully!`);
      navigate('/my-token');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate token';
      toast.error(msg);
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={fetchServices} />;

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || 'OTHER';
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Select a Service</h1>
        <p className="mt-2 text-gray-600">Choose a service to generate your virtual token.</p>
      </div>

      {Object.entries(groupedServices).map(([category, catServices]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 capitalize">
            {category.toLowerCase()}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catServices.map(service => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                onGetToken={handleGetToken} 
              />
            ))}
          </div>
        </div>
      ))}
      
      {services.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No services available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default ServiceSelection;
