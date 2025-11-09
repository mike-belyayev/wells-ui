// ============================================
// DEVELOPMENT - Local API
// ============================================
const API_BASE_URL = 'http://localhost:3000';

// ============================================
// PRODUCTION - Vercel API (UNCOMMENT FOR DEPLOYMENT)
// ============================================
// const API_BASE_URL = 'https://wells-api.vercel.app';

console.log('API Base URL:', API_BASE_URL);

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH_CHECK: `${API_BASE_URL}/api/users/me`,
  LOGIN: `${API_BASE_URL}/api/users/login`,
  REGISTER: `${API_BASE_URL}/api/users/register`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/users/forgot-password`,
  RESET_PASSWORD: (token: string) => `${API_BASE_URL}/api/users/reset-password/${token}`,
  
  // Passenger endpoints
  PASSENGERS: `${API_BASE_URL}/api/passengers`,
  PASSENGER_BY_ID: (id: string) => `${API_BASE_URL}/api/passengers/${id}`,
  
  // User endpoints
  USERS: `${API_BASE_URL}/api/users`,
  USER_BY_ID: (id: string) => `${API_BASE_URL}/api/users/${id}`,
  UNVERIFIED_USERS: `${API_BASE_URL}/api/users/unverified`,
  VERIFY_USER: (id: string) => `${API_BASE_URL}/api/users/verify/${id}`,
  
  // Site endpoints
  SITES: `${API_BASE_URL}/api/sites`,
  SITE_POB: (siteName: string) => `${API_BASE_URL}/api/sites/${siteName}/pob`,
  INITIALIZE_SITES: `${API_BASE_URL}/api/sites/initialize`,
  
  // Trip endpoints
  TRIPS: `${API_BASE_URL}/api/trips`,
  TRIP_BY_ID: (id: string) => `${API_BASE_URL}/api/trips/${id}`,
};

export default API_BASE_URL;