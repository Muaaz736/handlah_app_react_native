export interface IncomingVehicleTransfer {
  id: number;
  vehicleid: number;
  fromuserid: number;
  touserid: number;
  touseremail: string;
  tousername: string;
  saleprice: number;
  transferdate: string;
  ownershipdocumenturl: string[] | null;
  trackingnumber: string;
  status: number;
  notes: string;
  createdat: string;
  updatedat: string;
  vehicle: any | null;
  fromusername: string;
  touserfullname: string;
  frombusinessid: number | null;
  tobusinessid: number | null;
}

// Keep for backward compat if used elsewhere
export interface VehicleTransfer {
  vehicleName: string;
  model: string;
  plate: string;
  from: string;
}

export interface RouteParams {
  vehicleTransfer?: VehicleTransfer;
}
