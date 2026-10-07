import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, CheckCircle, ListPlus, Activity } from 'lucide-react';

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    totalToday: 0,
    waiting: 0,
    serving: 0,
    completed: 0
  });
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock stats fetch
      const sRes = await api.get('/services');
      setServices(sRes.data);
      // In a real app, staff might be assigned to specific services
      setStats({
        totalToday: 145,
        waiting: 24,
        serving: 5,
        completed: 116
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage queues and view daily statistics</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Select Service Area:</label>
          <select 
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2 border"
          >
            <option value="">-- Choose a service --</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={ListPlus} title="Total Tokens Today" value={stats.totalToday} colorVariant="indigo" />
        <StatCard icon={Users} title="Currently Waiting" value={stats.waiting} colorVariant="amber" />
        <StatCard icon={Activity} title="Now Serving" value={stats.serving} colorVariant="blue" />
        <StatCard icon={CheckCircle} title="Completed" value={stats.completed} colorVariant="green" />
      </div>

      {selectedService ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Ready to manage the queue?</h2>
          <Link 
            to={`/staff/queue?serviceId=${selectedService}`}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Go to Active Queue Management
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          Please select a service area from the dropdown above to manage its queue.
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
