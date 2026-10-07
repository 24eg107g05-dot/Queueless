import { useNotificationsContext } from '../context/NotificationContext';

export const useNotifications = () => {
  const context = useNotificationsContext();
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
