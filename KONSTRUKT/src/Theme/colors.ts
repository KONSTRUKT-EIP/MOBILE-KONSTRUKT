export interface ThemeColors {
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  muted: string;
  placeholder: string;
  primary: string;
  primarySoft: string;
  danger: string;
}

export const lightColors: ThemeColors = {
  background: '#f3f4f6',
  surface: '#ffffff',
  border: '#e5e7eb',
  text: '#111827',
  textSecondary: '#374151',
  muted: '#6b7280',
  placeholder: '#9ca3af',
  primary: '#c2410c',
  primarySoft: '#ffedd5',
  danger: '#ef4444',
};

export const darkColors: ThemeColors = {
  background: '#0f1115',
  surface: '#1a1d23',
  border: '#2b303b',
  text: '#f3f4f6',
  textSecondary: '#d1d5db',
  muted: '#9ca3af',
  placeholder: '#6b7280',
  primary: '#ea580c',
  primarySoft: '#3a1d0c',
  danger: '#f87171',
};
