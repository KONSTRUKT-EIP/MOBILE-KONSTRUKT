export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  isActive?: boolean;
  organizationId?: string | null;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface AccessibleSite {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  status: string;
  membershipRole: string;
}
