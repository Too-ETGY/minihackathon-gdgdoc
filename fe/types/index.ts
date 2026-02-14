export interface Location {
  lat: number;
  lng: number;
}

export interface Place {
  name: string;
  displayName: string;
  location: Location;
}

export interface DamageReport {
  id: string;
  lat: number;
  lng: number;
  severity: 1 | 2 | 3;
  createdAt: string;
}

export interface RouteData {
  polyline: [number, number][];
  distance: number;
  duration: number;
}

export interface RiskEvaluation {
  totalRisk: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}