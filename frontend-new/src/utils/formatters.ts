export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value);
};

export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value);
};
