// Base URL configuration
export const BASE_URL = 'http://192.168.1.12:5000';

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${BASE_URL}/api/auth/login`,
  REGISTER: `${BASE_URL}/api/auth/register`,
  USER_REGISTER: `${BASE_URL}/api/auth/user/register`,
  USER_LOGIN: `${BASE_URL}/api/auth/user/login`,
  MECHANIC_REGISTER: `${BASE_URL}/api/auth/mechanic/register`,
  MECHANIC_LOGIN: `${BASE_URL}/api/auth/mechanic/login`,
  
  // Issue endpoints
  CREATE_ISSUE: `${BASE_URL}/api/issues/create`,
  GET_NEARBY_ISSUES: `${BASE_URL}/api/issues/nearby`,
  GET_ISSUE: `${BASE_URL}/api/issues`,
  GET_USER_ISSUES: `${BASE_URL}/api/issues/user`,
  UPDATE_ISSUE: `${BASE_URL}/api/issues`,
  DELETE_ISSUE: `${BASE_URL}/api/issues`,
  
  // Offer endpoints
  SUBMIT_OFFER: `${BASE_URL}/api/issues`,
  UPDATE_OFFER: `${BASE_URL}/api/issues`,
  DELETE_OFFER: `${BASE_URL}/api/issues`,
  GET_OFFERS: `${BASE_URL}/api/issues`,

  // Mechanic endpoints
  UPDATE_MECHANIC_LOCATION: `${BASE_URL}/api/mechanics/location/update`,
  UPDATE_MECHANIC_STATUS: `${BASE_URL}/api/mechanics/status/update`,
  GET_NEARBY_MECHANICS: `${BASE_URL}/api/mechanics/nearby`,
};

// Socket.IO configuration
export const SOCKET_CONFIG = {
  URL: BASE_URL,
  OPTIONS: {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
    forceNew: true,
    autoConnect: true
  }
}; 