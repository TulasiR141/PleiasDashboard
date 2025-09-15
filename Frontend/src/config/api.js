// Simple API Base URL Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:5151';

// You can build endpoints dynamically in your components
export const buildEndpoint = (path) => ${API_BASE_URL};
