export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  // Ajoute ici les autres champs si nécessaire
}