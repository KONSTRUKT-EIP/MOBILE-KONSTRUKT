import api from '../API/Api';
import { AccessibleSite } from '../Types/Auth';

export type SiteStatus = 'PLANIFIE' | 'EN_COURS' | 'SUSPENDU' | 'TERMINE' | 'ANNULE';

export interface CreateSitePayload {
  organizationId: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  startDate: string;
  endDate?: string;
  status: SiteStatus;
  budget: number;
}

export type UpdateSitePayload = Partial<Omit<CreateSitePayload, 'organizationId'>>;

export type SiteProgressMap = Record<string, number | null>;

const siteService = {
  getProgress: async (): Promise<SiteProgressMap> => {
    const response = await api.get<{ id: string; progressPct?: number | null }[]>('/sites');
    return response.data.reduce<SiteProgressMap>((map, site) => {
      map[site.id] = site.progressPct ?? null;
      return map;
    }, {});
  },

  updateSite: async (siteId: string, payload: UpdateSitePayload): Promise<AccessibleSite> => {
    const response = await api.put<AccessibleSite>(`/sites/${siteId}`, payload);
    return response.data;
  },

  deleteSite: async (siteId: string): Promise<void> => {
    await api.delete(`/sites/${siteId}`);
  },

  createSite: async (payload: CreateSitePayload): Promise<AccessibleSite> => {
    const response = await api.post<AccessibleSite>('/sites', payload);
    return response.data;
  },
};

export default siteService;
