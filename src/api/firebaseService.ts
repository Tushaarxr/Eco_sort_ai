// Stub file - Firebase service has been replaced by Supabase
// This file provides empty exports to prevent import errors during migration
// TODO: Remove this file after all components are migrated to Supabase

import { ScanResult, RecyclingCenter } from '../types';

export const getUserScans = async (userId: string): Promise<{ scans: ScanResult[] }> => {
    console.warn('firebaseService.getUserScans is deprecated. Use supabaseService instead.');
    return { scans: [] };
};

export const uploadImage = async (userId: string, imageUri: string): Promise<string> => {
    console.warn('firebaseService.uploadImage is deprecated. Use supabaseService instead.');
    throw new Error('Firebase service is no longer available. Please use Supabase.');
};

export const saveScanResult = async (userId: string, scanData: ScanResult): Promise<void> => {
    console.warn('firebaseService.saveScanResult is deprecated. Use supabaseService instead.');
    throw new Error('Firebase service is no longer available. Please use Supabase.');
};

export const getRecyclingCenters = async (location?: { latitude: number; longitude: number }): Promise<RecyclingCenter[]> => {
    console.warn('firebaseService.getRecyclingCenters is deprecated. Use supabaseService instead.');
    return [];
};

export const getCurrentUserLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
    console.warn('firebaseService.getCurrentUserLocation is deprecated.');
    return null;
};
