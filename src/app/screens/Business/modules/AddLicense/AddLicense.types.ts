export interface FormData {
  licenseName: string;
  vendor: string;
  product: string;
  plan: string;
  seats: string;
  renewalDate: string;
  autoRenew: string;
  cost: string;
  licenseKey: string;
  notes: string;
  credentials: Credentials | null;
}

export interface Credentials {
  // [key: string]: string;
  username: string;
  password: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface FormValues {
  vendorProvider: string;
  product: string;
  plan: string;
  seats: string;
  renewalDate: string;
  autoRenew: string;
  cost: string;
  period: string;
  licenseKey: string;
  notes: string;
  username: string;
  password: string;
  /** "software", or the kind of license/permit. */
  licenseKind: string;
  licenseNumber: string;
  /** One state on edit; several on add (one license is made per state). */
  states: string[];
  jurisdiction: string;
  holderName: string;
  status: string;
  issueDate: string;
  location: string;
}