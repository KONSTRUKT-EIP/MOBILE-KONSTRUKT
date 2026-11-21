export const SITE_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  PLANIFIE: { label: 'Planifié', bg: '#e0e7ff', text: '#4f46e5' },
  EN_COURS: { label: 'En cours', bg: '#e8f5e9', text: '#2e7d32' },
  SUSPENDU: { label: 'Suspendu', bg: '#fff3e0', text: '#ef6c00' },
  TERMINE: { label: 'Terminé', bg: '#e3f2fd', text: '#1976d2' },
  ANNULE: { label: 'Annulé', bg: '#ffebee', text: '#c62828' },
};

export const siteStatus = (status?: string | null) =>
  (status && SITE_STATUS[status]) || { label: status ?? '—', bg: '#f3f4f6', text: '#6b7280' };

export const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};

export const formatBudget = (value?: string | number | null): string => {
  if (value === null || value === undefined || value === '') return '—';
  const amount = Number(value);
  if (Number.isNaN(amount)) return '—';
  return `${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} €`;
};
