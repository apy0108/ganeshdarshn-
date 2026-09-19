export type CrowdStatus = 'short' | 'moving' | 'heavy' | 'none';
export type MandalCategory = 'manache' | 'famous' | 'historic' | 'neighbourhood' | 'temple';

export interface Mandal {
  id: string;
  name: string;
  nameMarathi: string;
  lat: number | null;
  lng: number | null;
  area: string; // e.g. "Budhwar Peth"
  categories: MandalCategory[];
  established?: number;
  description: string;
  tips?: string;
  imageUrl?: string | null;
  googlePlaceId?: string;
  verified: boolean;
  distanceKm?: number;
  locationAccuracy?: "verified" | "lane" | "unverified";
  locationSource?: string;
  theme2026?: string | null;
  themeVerificationStatus?: "verified" | "unverified" | "not_verified";
  themeClaimedByUser?: string;
  imageVerificationStatus?: "verified" | "unverified" | "not_verified";
  researchSource?: string;
  category?: string;
  tags?: string[];
}

export interface CrowdReport {
  mandalId: string;
  status: CrowdStatus;
  deviceId: string;
  atMandal: boolean;
  timestamp: number;
  expiresAt: number; // timestamp + 90 minutes
  waitMinutes?: number;
}

export interface LiveCrowd {
  mandalId: string;
  status: CrowdStatus;
  waitMinutes?: number;
  reportedAt: number;
  reportCount: number;
  dwellHint?: string;
  isEstimated?: boolean;
}

export interface CuratedRoute {
  id: string;
  title: string;
  titleMarathi?: string;
  tagline: string;
  mandalCount: number;
  approxDistance: string;
  approxWalkTime: string;
  mandalIds: string[];
}
