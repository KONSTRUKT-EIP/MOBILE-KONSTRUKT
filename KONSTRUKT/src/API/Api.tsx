import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse } from '../Types/Auth';

const BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let onSessionExpired: (() => void) | null = null;
export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  onSessionExpired = handler;
};

let refreshPromise: Promise<void> | null = null;

const refreshSession = async (): Promise<void> => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('Aucun refresh token');
  const { data } = await axios.post<AuthResponse>(
    `${BASE_URL}/auth/refresh`,
    { refreshToken },
    { timeout: 10000 }
  );
  await AsyncStorage.multiSet([
    ['userToken', data.access_token],
    ['refreshToken', data.refresh_token],
  ]);
};

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Erreur récupération token", error);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const isAuthRoute = original?.url?.startsWith('/auth/login') || original?.url?.startsWith('/auth/refresh');

    if (error.response?.status !== 401 || !original || original._retry || isAuthRoute) {
      return Promise.reject(error);
    }
    original._retry = true;

    try {
      refreshPromise = refreshPromise ?? refreshSession().finally(() => { refreshPromise = null; });
      await refreshPromise;
    } catch (refreshError) {
      if (axios.isAxiosError(refreshError) && !refreshError.response) {
        return Promise.reject(error);
      }
      await AsyncStorage.multiRemove(['userToken', 'refreshToken']);
      onSessionExpired?.();
      return Promise.reject(error);
    }

    return api(original);
  }
);

export default api;
