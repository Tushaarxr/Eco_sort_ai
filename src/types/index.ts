// User types
export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

// Authentication types
export interface AuthState {
  user: User | null;
  loading: boolean;
}

// E-waste scanning types
export interface ScanResult {
  id?: string;
  userId?: string;
  itemType: string;
  type: string;
  materials: string[];
  hazardLevel: string; // 'low' | 'medium' | 'high' | 'none' | 'n/a'
  disposalMethod: string;
  confidence: string; // 'low' | 'medium' | 'high'
  recyclingValue?: string | null;
  dataSecurityRisk: boolean;
  fallbackParsed: boolean;
  timestamp: Date;
  saved?: boolean;
  imageUrl?: string;
  isEWaste?: boolean; // false for non-electronic items
  funMessage?: string | null; // Fun/sarcastic message for non-e-waste items
}

// Disposal guidance types
export interface DisposalGuidance {
  id?: string;
  itemType?: string;
  category?: string;
  safetyPrecautions: string[];
  preparationSteps: string[];
  disposalMethods: {
    method: string;
    description: string;
    environmentalImpact: string;
    cost: string;
    availability: string;
  }[];
  environmentalImpact: string;
  regulations: string[];
  // Legacy properties for backward compatibility
  safety?: string[];
  preparation?: string[];
  legalRequirements?: string[];
}

// Recycling center types
export interface RecyclingCenter {
  id: string;
  name: string;
  address: string;
  acceptsItems: string[];
  distance?: number | string;
  location?: {
    latitude: number;
    longitude: number;
  };
  phoneNumber?: string;
  website?: string;
  operatingHours?: string;
  certifications?: string[];
  acceptsDataDevices?: boolean;
  dataWipingService?: boolean;
  pickupService?: boolean;
  fees?: string;
  active?: boolean;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// E-waste item types
export interface EWasteItem {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryId: string;
  materials: string[];
  hazardLevel: 'Low' | 'Medium' | 'High';
  disposalInstructions: string[];
  imageUrl: string;
  keywords: string[];
}

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
}
