/** Kinds of business license (same as the website): software, and the licenses and permits a business holds. */
export const LICENSE_KINDS = [
  'software', 'business', 'liquor', 'food', 'health', 'building', 'contractor', 'professional',
  'fire', 'signage', 'environmental', 'transport', 'other',
] as const;

export const LICENSE_STATUSES = ['active', 'pending', 'expired', 'suspended', 'inactive'] as const;

/** Renewal periods the backend accepts. */
export const LICENSE_PERIODS: { value: string; key: string }[] = [
  { value: 'Monthly', key: 'monthly' },
  { value: 'Quarterly', key: 'quarterly' },
  { value: 'Yearly', key: 'yearly' },
  { value: 'Every 2 years', key: 'twoYears' },
  { value: 'Weekly', key: 'weekly' },
  { value: 'One-Time', key: 'oneTime' },
];

/** US states, for licenses issued by a state (a contractor licensed in several states gets one license per state). */
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
  'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

export const isSoftwareLicense = (kind?: string | null): boolean => !kind || kind === 'software';
