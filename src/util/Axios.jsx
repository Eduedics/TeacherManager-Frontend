import axios from "axios";
// creating connection to the backend api that automatically adds login token to every request

const api = axios.create({
  baseURL: "https://teachersdutyattendancemanager.onrender.com/",
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('token/refresh/', {refresh: refreshToken});
          const { access } = response.data;
          localStorage.setItem('token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
// if refresh fails logout user
        console.log("Token refresh failed:",refreshError)
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; //api.get() to be used now