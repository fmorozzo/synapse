export const RECORD_CONDITIONS = [
  { value: 'mint', label: 'Mint (M)' },
  { value: 'near_mint', label: 'Near Mint (NM)' },
  { value: 'very_good_plus', label: 'Very Good Plus (VG+)' },
  { value: 'very_good', label: 'Very Good (VG)' },
  { value: 'good_plus', label: 'Good Plus (G+)' },
  { value: 'good', label: 'Good (G)' },
  { value: 'fair', label: 'Fair (F)' },
  { value: 'poor', label: 'Poor (P)' },
] as const;

export const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
] as const;

export const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const;

export const API_ENDPOINTS = {
  DISCOGS_SEARCH: '/api/discogs/search',
  DISCOGS_RELEASE: '/api/discogs/release',
  RECORDS: '/api/records',
  AI_ANALYZE: '/api/ai/analyze',
  AI_RECOMMEND: '/api/ai/recommend',
} as const;

