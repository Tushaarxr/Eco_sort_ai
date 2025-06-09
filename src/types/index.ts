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
    itemType?: string;
    type?: string;
    materials?: string | string[];
    hazardLevel?: 'Low' | 'Medium' | 'High' | string;
    disposalMethod?: string;
    imageUrl?: string;
    timestamp?: any; // Firebase Timestamp
    userId?: string;
  }
  
  // Disposal guidance types
  export interface DisposalGuidance {
    safety: string[];
    preparation: string[];
    disposalMethods: string[];
    environmentalImpact: string[];
    legalRequirements: string[];
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
  