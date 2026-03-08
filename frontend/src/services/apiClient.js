import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request interceptor - attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("eventnexus_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
let isRedirecting = false;

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Check if this is a "no token" error vs "invalid token" error
      const errorMessage = error.response?.data?.error || error.response?.data?.message || '';
      const isNoTokenError = errorMessage.toLowerCase().includes('no token');
      
      // Only redirect and clear token if it's an invalid token (not missing token)
      if (!isNoTokenError && !isRedirecting) {
        isRedirecting = true;
        
        // Clear auth data
        localStorage.removeItem("eventnexus_token");
        
        // Redirect to login only if not already on login page
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/')) {
          window.location.href = '/login';
        }
        
        // Reset flag after a delay
        setTimeout(() => {
          isRedirecting = false;
        }, 1000);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
