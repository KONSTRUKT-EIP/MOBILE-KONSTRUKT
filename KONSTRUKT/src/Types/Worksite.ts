export interface SiteStats {
  total: number;
  totalEmployees: number;
  complete: number;
  enCours: number;
  retards: number;
  enAttente: number;
  annule: number;
}

export interface TeamSummary {
  id: string;
  name: string;
  leader: { id: string; firstName: string; lastName: string } | null;
  _count: { members: number };
}

export interface MemberDetail {
  id: string;
  teamId: string;
  name: string;
  specialite: string;
  status: string;
  initials: string;
  color: string;
}

export interface SiteDetail {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  budget: string | number | null;
  organization?: { id: string; name: string };
}
