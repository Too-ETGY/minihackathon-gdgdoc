export interface DamageReport {
  latitude: number;
  longitude: number;
  locationDetail: string;
  damageType: DamageType;
  description?: string;
  timestamp: Date;
}

export type DamageType = "crack" | "hole" | "severe" | "other";

export interface DamageMarker {
  id: string;
  latitude: number;
  longitude: number;
  damageType: DamageType;
  status: "pending" | "verified" | "fixed";
  timestamp: Date;
}

export interface ReportFormData {
  latitude: number | null;
  longitude: number | null;
  locationDetail: string;
  damageType: DamageType | "";
  description: string;
}
