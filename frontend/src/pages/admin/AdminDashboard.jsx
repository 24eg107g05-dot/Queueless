import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, LayoutGrid, Activity, Clock, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (error) {
        console.error(error);
        // Mock data for display if API fails or doesn't exist
        setStats({
          totalUsers: 1250,
          totalTokensToday: 450,
          activeQueues: 8,
          completedToday: 380,
          cancelledToday: 45,
          avgWaitTime: 25,
          tokensByService: [
            { name: 'Cardiology', tokens: 120 },
            { name: 'Orthopedics', tokens: 85 },
            { name: 'Cash Deposit', tokens: 150 },
            { name: 'Passport Renewal', tokens: 95 }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={Users} title="Total Users" value={stats?.totalUsers} colorVariant="blue" />
        <StatCard icon={LayoutGrid} title="Tokens Today" value={stats?.totalTokensToday} colorVariant="indigo" />
        <StatCard icon={Activity} title="Active Queues" value={stats?.activeQueues} colorVariant="amber" />
        <StatCard icon={CheckCircle} title="Completed Today" value={stats?.completedToday} colorVariant="green" />
        <StatCard icon={XCircle} title="Cancelled Today" value={stats?.cancelledToday} colorVariant="red" />
        <StatCard icon={Clock} title="Avg Wait Time" value={`${stats?.avgWaitTime} min`} colorVariant="blue" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-6">Tokens by Service Today</h2>
          <div className="h-80">
            {stats?.tokensByService && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.tokensByService}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="tokens" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-6">Quick Links</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/services" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-sm transition-all text-center">
              <LayoutGrid className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <span className="font-medium text-gray-800">Manage Services</span>
            </Link>
            <Link to="/admin/users" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-sm transition-all text-center">
              <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <span className="font-medium text-gray-800">Manage Users</span>
            </Link>
            <Link to="/admin/queues" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-sm transition-all text-center">
              <Activity className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <span className="font-medium text-gray-800">Monitor Queues</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
