import api from '../API/Api';
import { AuthResponse, User } from '../Types/Auth';

const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  getCurrentUser: async (): Promise<User | null> => {
    const response = await api.get<User | null>('/auth');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

export default authService;
