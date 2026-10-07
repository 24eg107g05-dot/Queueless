import { Clock, Building2, Landmark, Stethoscope } from 'lucide-react';

export const formatWaitTime = (minutes) => {
  if (!minutes) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`;
};

export const formatTokenNumber = (token) => {
  if (!token) return '---';
  return token.toString().padStart(3, '0');
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'WAITING': return 'bg-warning text-white';
    case 'SERVING': return 'bg-primary-500 text-white';
    case 'COMPLETED': return 'bg-success text-white';
    case 'CANCELLED': return 'bg-danger text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export const getServiceIcon = (category) => {
  switch (category) {
    case 'HOSPITAL': return Stethoscope;
    case 'BANK': return Landmark;
    case 'GOVERNMENT': return Building2;
    default: return Clock;
  }
};

export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + " years ago";
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + " months ago";
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + " days ago";
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + " hours ago";
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};
