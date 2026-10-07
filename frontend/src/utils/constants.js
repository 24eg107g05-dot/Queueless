export const TOKEN_STATUS = {
  WAITING: 'WAITING',
  SERVING: 'SERVING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const ROLE = {
  USER: 'USER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN'
};

export const SERVICE_CATEGORIES = {
  HOSPITAL: 'HOSPITAL',
  BANK: 'BANK',
  GOVERNMENT: 'GOVERNMENT',
  OTHER: 'OTHER'
};

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  SERVICES: '/services',
  TOKENS: '/tokens',
  MY_TOKENS: '/tokens/my',
  QUEUE: '/queue',
  NOTIFICATIONS: '/notifications',
  AI_CHAT: '/ai/chat'
};
