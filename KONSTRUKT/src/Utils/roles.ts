const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  CHEF_PROJET: 'Chef de projet',
  CONDUCTEUR_TRAVAUX: 'Conducteur de travaux',
  COLLABORATEUR: 'Collaborateur',
  CLIENT: 'Client',
};

export const roleLabel = (role?: string | null): string => (role ? ROLE_LABELS[role] ?? role : '—');
