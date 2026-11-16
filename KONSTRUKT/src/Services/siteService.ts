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

const siteService = {
  createSite: async (payload: CreateSitePayload): Promise<AccessibleSite> => {
    const response = await api.post<AccessibleSite>('/sites', payload);
    return response.data;
  },
};

export default siteService;
