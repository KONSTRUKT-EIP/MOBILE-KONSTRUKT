import api from '../API/Api';
import { AuthResponse, RegisterData } from '../Types/Auth';

const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email, 
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;