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

export const config = {
  apiBaseUrl: getEnvironmentVariable('VITE_API_BASE_URL', 'http://localhost:5151'),
  environment: getEnvironmentVariable('VITE_ENVIRONMENT', 'development'),
  debug: getEnvironmentVariable('VITE_DEBUG', 'false') === 'true',
  nodeEnv: getEnvironmentVariable('NODE_ENV', 'development')
};

export const API_BASE_URL = config.apiBaseUrl;

if (config.debug) {
  console.log('Environment Config Loaded:', config);
}
