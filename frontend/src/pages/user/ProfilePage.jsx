import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', formData);
      toast.success('Profile updated successfully (mocked)');
      setIsEditing(false);
      // Ideally update auth context user here
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
          <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="h-10 w-10 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
            <span className="inline-block mt-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase">
              {user?.role}
            </span>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address (Cannot change)</label>
              <input
                type="email"
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm p-2 border text-gray-500"
                value={user?.email}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="h-5 w-5 text-gray-400" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="h-5 w-5 text-gray-400" />
              <span>{user?.phone || 'Not provided'}</span>
            </div>
            
            <div className="pt-6 border-t border-gray-100">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
