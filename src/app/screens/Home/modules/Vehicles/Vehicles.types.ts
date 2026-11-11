export interface ServiceRecord {
  id: number;
  date: string;
  type: string;
  vendor: string;
  odometer: number;
  cost: number;
  notes?: string;
  createdat: string;
  updatedat: string;
  userid: number;
  vehicleid: number;
}

export interface Accident {
  id: number;
  date: string;
  claimnumber: string;
  insurancetype: string;
  damage: string;
  shop: string;
  totalrepaircost: number;
  repairdatefrom: string;
  repairdateto: string;
  attachmentbefore: string | null;
  attachmentafter: string | null;
  policereporturl: string | null;
  createdat: string;
  updatedat: string;
  userid: number;
  vehicleid: number;
}

export interface Insurance {
  id: number;
  itemname: string;
  agentemail: string;
  insurancecarrier: string;
  policynumber: string;
  annualpremium: number;
  startdate: string;
  renewaldate: string;
  enddate: string;
  dueday: number;
  agent: string;
  agentphone: string;
  uploadattachments: string;
  userid: number;
  vehicleid: number;
  businessid: number | null;
  realestateid: number | null;
}

export interface Loan {
  id: number;
  lenderprovider: string;
  lenderlocation: string;
  lenderphonenumber: string;
  lenderemail: string;
  accountnumber: string;
  bestname: string;
  monthlypayment: number;
  ratepercent: number;
  balance: number;
  estbalance: number;
  startdate: string;
  enddate: string;
  dueday: number;
  uploadattachments: string;
  userid: number;
  vehicleid: number;
  businessid: number | null;
  realestateid: number | null;
}

export interface Warranty {
  id: number;
  itemname: string;
  warrantyprovider: string;
  expiration: string;
  startdate: string;
  notes: string;
  website: string;
  uploadattachments: string;
  userid: number;
  vehicleid: number;
  businessid: number | null;
  realestateid: number | null;
  createdat: string;
  updatedat: string;
}

export interface Vehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  nickname: string;
  vin: string;
  color: string;
  condition: string;
  plate?: string;
  attachmenturl: string | null;
  carfaxrecordurl: string | null;
  issold: boolean;
  istransferred: boolean;
  userid: number;
  latesttransfer?: any;
  businessid: number | null;
  createdat: string;
  updatedat: string;
  servicerecords: ServiceRecord[];
  accidents: Accident[];
  insurances: Insurance[];
  loans: Loan[];
  warranties: Warranty[];
  accessLevel?: string;
}

export interface ShareData {
  [key: string]: any;
}

export interface VehiclesNavigationProp {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
}
