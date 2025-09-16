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

// Use environment variable for API URL
const getApiUrl = () => {
    return import.meta.env.VITE_API_BASE_URL || 'https://dashboardbackend-gqatdbhef0gqbdea.eastus2-01.azurewebsites.net';
};

export const config = {
    apiBaseUrl: getApiUrl(),
    environment: getEnvironmentVariable('VITE_ENVIRONMENT', 'production'),
    debug: getEnvironmentVariable('VITE_DEBUG', 'false') === 'true',
    nodeEnv: getEnvironmentVariable('NODE_ENV', 'production')
};

export const API_BASE_URL = config.apiBaseUrl;

if (config.debug) {
    console.log('Environment Config Loaded:', config);
}
