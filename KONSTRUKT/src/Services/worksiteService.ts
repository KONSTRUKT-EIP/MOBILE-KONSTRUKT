import api from '../API/Api';
import { MemberDetail, SiteDetail, SiteStats, TeamSummary } from '../Types/Worksite';

const worksiteService = {
  getDetail: async (siteId: string): Promise<SiteDetail> => {
    const response = await api.get<SiteDetail>(`/sites/${siteId}`);
    return response.data;
  },

  getStats: async (siteId: string): Promise<SiteStats> => {
    const response = await api.get<SiteStats>(`/teams/site/${siteId}/stats`);
    return response.data;
  },

  getTeams: async (siteId: string): Promise<TeamSummary[]> => {
    const response = await api.get<TeamSummary[]>('/teams', { params: { siteId } });
    return response.data;
  },

  getMembers: async (siteId: string): Promise<MemberDetail[]> => {
    const response = await api.get<MemberDetail[]>(`/teams/site/${siteId}/members-details`);
    return response.data;
  },
};

export default worksiteService;
