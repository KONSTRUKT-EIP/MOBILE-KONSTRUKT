import api from '../API/Api';
import { OrgUser } from '../Types/Worksite';

export type TeamRole = 'WORKER' | 'CHEF_EQUIPE';

const teamService = {
  getUsers: async (): Promise<OrgUser[]> => {
    const response = await api.get<OrgUser[] | { data: OrgUser[] }>('/users');
    return Array.isArray(response.data) ? response.data : response.data.data ?? [];
  },

  addMember: async (teamId: string, userId: string, role: TeamRole): Promise<void> => {
    await api.post(`/teams/${teamId}/members`, { userId, role });
  },

  removeMember: async (teamId: string, userId: string): Promise<void> => {
    await api.delete(`/teams/${teamId}/members/${userId}`);
  },
};

export default teamService;
