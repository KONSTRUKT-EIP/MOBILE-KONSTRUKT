export interface TokenPayload {
  userId?: string;
  organizationId?: string | null;
  role?: string;
}

export const decodeTokenPayload = (token: string | null): TokenPayload | null => {
  if (!token) return null;
  const part = token.split('.')[1];
  if (!part) return null;
  try {
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as TokenPayload;
  } catch {
    return null;
  }
};
