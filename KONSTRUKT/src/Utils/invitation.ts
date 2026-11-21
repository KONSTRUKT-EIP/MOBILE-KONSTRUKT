export const extractInvitationToken = (input: string): string | null => {
  const cleaned = input.trim().split(/[?#]/)[0].replace(/\/+$/, '');
  if (!cleaned) return null;
  const segments = cleaned.split('/');
  const token = segments[segments.length - 1].trim();
  return token || null;
};
