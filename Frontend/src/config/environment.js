const getEnvironmentVariable = (name, defaultValue) => {
  if (defaultValue === undefined) defaultValue = '';
  try {
    if (import.meta && import.meta.env && import.meta.env[name]) {
      return import.meta.env[name];
    }
    return defaultValue;
  } catch (error) {
    console.warn('Environment variable not accessible, using default:', defaultValue);
    return defaultValue;
  }
};

// Check for multiple possible environment variable names
const getApiUrl = () => {
  // Try VITE_API_URL (what we set in Azure)
  const viteApiUrl = getEnvironmentVariable('VITE_API_URL', '');
  if (viteApiUrl) return viteApiUrl;
  
  // Try VITE_API_BASE_URL (what was originally expected)
  const viteApiBaseUrl = getEnvironmentVariable('VITE_API_BASE_URL', '');
  if (viteApiBaseUrl) return viteApiBaseUrl;
  
  // Production fallback
  if (import.meta.env.MODE === 'production') {
    return 'https://dashboardbackend-gqatdbhef0gqbdea.eastus2-01.azurewebsites.net';
  }
  
  // Development fallback
  return 'http://localhost:5151';
};

export const config = {
  apiBaseUrl: getApiUrl(),
  environment: getEnvironmentVariable('VITE_ENVIRONMENT', 'development'),
  debug: getEnvironmentVariable('VITE_DEBUG', 'false') === 'true',
  nodeEnv: getEnvironmentVariable('NODE_ENV', 'development')
};

export const API_BASE_URL = config.apiBaseUrl;

if (config.debug) {
  console.log('Environment Config Loaded:', config);
}
