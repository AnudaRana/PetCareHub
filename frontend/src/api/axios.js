import axios from 'axios';

// We export the global axios object so that interceptors added in 
// AuthContext.jsx (which uses axios.interceptors) are available 
// to any component importing this 'api' instance.
const api = axios;

export default api;
