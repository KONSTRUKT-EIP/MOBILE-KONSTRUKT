export const formatAmount = (value: number): string => {
  if (!Number.isFinite(value)) return '—';
  const [integer, decimals] = (Math.round(value * 100) / 100).toFixed(2).split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${grouped}${decimals === '00' ? '' : `,${decimals}`} €`;
};
