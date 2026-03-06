import api from '../API/Api';

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email: email, 
        password: password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;