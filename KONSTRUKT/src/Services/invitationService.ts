import api from '../API/Api';
import { AuthResponse, User } from '../Types/Auth';

export interface InvitationInfo {
  email: string;
  role: string;
  expiresAt: string;
  organization: { name: string };
  site: { name: string; city: string };
}

export interface AcceptInvitationPayload {
  firstName: string;
  lastName: string;
  password: string;
}

export interface AcceptInvitationResult extends AuthResponse {
  user: User;
}

export type InvitationFailure = 'invalid' | 'unavailable' | 'email-taken' | 'rejected' | 'network';

export class InvitationError extends Error {
  reason: InvitationFailure;

  constructor(reason: InvitationFailure, message: string) {
    super(message);
    this.reason = reason;
  }
}

const toInvitationError = (err: any): InvitationError => {
  const status = err?.response?.status;
  const message = err?.response?.data?.message;
  const text = Array.isArray(message) ? message[0] : message;
  if (!err?.response) return new InvitationError('network', 'Impossible de joindre le serveur.');
  if (status === 404) return new InvitationError('invalid', text || 'Invitation introuvable.');
  if (status === 409) return new InvitationError('email-taken', text || 'Cette adresse est déjà utilisée.');
  if (status === 400 && typeof text === 'string' && /expired|already used/i.test(text)) {
    return new InvitationError('unavailable', text);
  }
  return new InvitationError('rejected', text || "L'invitation a été refusée.");
};

const invitationService = {
  getInvitation: async (token: string): Promise<InvitationInfo> => {
    try {
      const response = await api.get<InvitationInfo>(`/invitations/${encodeURIComponent(token)}`);
      return response.data;
    } catch (err) {
      throw toInvitationError(err);
    }
  },

  acceptInvitation: async (token: string, payload: AcceptInvitationPayload): Promise<AcceptInvitationResult> => {
    try {
      const response = await api.post<AcceptInvitationResult>(
        `/invitations/${encodeURIComponent(token)}/accept`,
        payload
      );
      return response.data;
    } catch (err) {
      throw toInvitationError(err);
    }
  },
};

export default invitationService;
