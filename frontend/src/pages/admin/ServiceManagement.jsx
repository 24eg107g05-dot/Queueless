import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await api.delete(`/admin/services/${id}`);
        toast.success('Service deleted');
        fetchServices();
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700">
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map(service => (
              <tr key={service.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.averageServiceTime} min</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${service.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {service.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No services found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceManagement;
