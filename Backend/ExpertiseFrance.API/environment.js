const getApiUrl = () => {
  return 'https://dashboardbackend-new.azurewebsites.net';
};

export const config = {
  apiBaseUrl: getApiUrl(),
  environment: 'production',
  debug: false,
  nodeEnv: 'production'
};

export const API_BASE_URL = config.apiBaseUrl;
