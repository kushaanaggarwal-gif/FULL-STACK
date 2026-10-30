import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authEventHandlers = [];
export const subscribeToAuthEvents = (handler) => {
  authEventHandlers.push(handler);
  return () => {
    authEventHandlers = authEventHandlers.filter((h) => h !== handler);
  };
};

const notifyAuthEvent = (event, data) => {
  authEventHandlers.forEach((handler) => {
    try {
      handler({ event, data, timestamp: new Date().toLocaleTimeString() });
    } catch (e) {
      console.error('Error in auth event subscriber:', e);
    }
  });
};

/**
 * Request Interceptor: Attach Bearer Access Token
 */
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    const isExpiredFlag = localStorage.getItem('isTokenExpired') === 'true';

    if (isExpiredFlag) {
      // Intentionally attach expired token to force server 401 rejection
      config.headers['Authorization'] = `Bearer EXPIRED_TOKEN_BLOCKED`;
    } else if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    notifyAuthEvent('REQUEST_SENT', { url: config.url, method: config.method.toUpperCase() });
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor: Block task performance on 401 Token Expiry
 * Does NOT perform silent retry; rejects task immediately so user cannot perform actions with expired token.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.setItem('isTokenExpired', 'true');
      notifyAuthEvent('TOKEN_EXPIRED_BLOCKED', {
        message: 'Token Expired: Task execution blocked by security policy!',
      });
      window.dispatchEvent(new Event('auth:token-expired'));
    }
    return Promise.reject(error);
  }
);

/**
 * Explicit manual token refresh call when user clicks "Renew Token"
 */
export const refreshTokenCall = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token found. Please log in again.');
  }

  const response = await axios.post(`${API_BASE_URL}/refresh-token`, { refreshToken });
  const { accessToken: newAccessToken } = response.data;

  localStorage.setItem('accessToken', newAccessToken);
  localStorage.removeItem('isTokenExpired');
  notifyAuthEvent('TOKEN_RENEWED', { message: 'Token renewed! Task access restored.' });

  return newAccessToken;
};

export default api;
