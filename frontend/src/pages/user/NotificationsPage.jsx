import React, { useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { Bell, Check, CheckCircle2 } from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, refresh } = useNotifications();

  useEffect(() => {
    refresh();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-50 rounded-lg">
            <Bell className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">Stay updated on your queue status</p>
          </div>
        </div>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium px-4 py-2 bg-primary-50 rounded-lg transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>You have no notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-6 flex justify-between gap-4 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex-1">
                  <p className={`text-gray-800 ${!notification.read ? 'font-medium' : ''}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full h-fit transition-colors"
                    title="Mark as read"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
