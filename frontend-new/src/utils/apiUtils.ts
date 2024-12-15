import api from '../services/api';

export const handleResponse = async (response: AxiosResponse) => {
  try {
    return response.data;
  } catch (error) {
    console.error('API Error Details:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    throw error;
  }
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await api.get(url, options);
    return handleResponse(response);
  } catch (error: any) {
    console.error('API Error Details:', {
      url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};
