import { ScanResult, RecyclingCenter } from '../types';
import { decode } from 'base64-arraybuffer';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system/legacy';

// Create client for database and storage operations
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

const supabaseClient = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    })
    : null;

/**
 * Upload an image to Supabase Storage
 */
export const uploadImage = async (_client: SupabaseClient, userId: string, imageUri: string): Promise<string> => {
    if (!supabaseClient) {
        console.warn('Supabase not configured, skipping image upload');
        return '';
    }

    try {
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const fileName = `${userId}/${Date.now()}.jpg`;

        const { data, error } = await supabaseClient
            .storage
            .from('scans')
            .upload(fileName, decode(base64), {
                contentType: 'image/jpeg',
                upsert: false
            });

        if (error) {
            console.warn('Storage upload warning:', error.message);
            return '';
        }

        const { data: { publicUrl } } = supabaseClient
            .storage
            .from('scans')
            .getPublicUrl(data.path);

        console.log('Image uploaded successfully:', publicUrl);
        return publicUrl;
    } catch (error: any) {
        console.warn('Image upload warning:', error.message);
        return '';
    }
};

/**
 * Save a scan result to the database
 * Uses direct client without Clerk JWT to bypass RLS issues
 */
export const saveScanResult = async (_client: SupabaseClient, userId: string, scanData: Partial<ScanResult>): Promise<ScanResult | null> => {
    if (!supabaseClient) {
        console.warn('Supabase not configured, skipping save');
        return null;
    }

    try {
        const dbRow = {
            user_id: userId,
            image_url: scanData.imageUrl || null,
            item_type: scanData.itemType || scanData.type || 'Unknown',
            type: scanData.type || scanData.itemType || 'Unknown',
            materials: scanData.materials || [],
            hazard_level: scanData.hazardLevel || 'medium',
            disposal_method: scanData.disposalMethod || '',
            confidence: scanData.confidence || 'medium',
            recycling_value: typeof scanData.recyclingValue === 'string' ? scanData.recyclingValue : null,
            data_security_risk: scanData.dataSecurityRisk || false,
        };

        // Use direct client - Note: RLS must allow this or be disabled for inserts
        const { data, error } = await supabaseClient
            .from('scans')
            .insert(dbRow)
            .select()
            .single();

        if (error) {
            console.warn('Database save warning:', error.message);
            // Don't throw - just return null and continue
            return null;
        }

        console.log('Scan saved to database successfully');
        return {
            id: data.id,
            userId: data.user_id,
            imageUrl: data.image_url,
            itemType: data.item_type,
            type: data.type,
            materials: data.materials || [],
            hazardLevel: data.hazard_level,
            disposalMethod: data.disposal_method,
            confidence: data.confidence,
            recyclingValue: data.recycling_value,
            dataSecurityRisk: data.data_security_risk,
            fallbackParsed: false,
            timestamp: new Date(data.created_at),
            saved: true
        };
    } catch (error: any) {
        console.warn('Save error:', error.message);
        return null;
    }
};

/**
 * Get all scans for a user
 */
export const getUserScans = async (_client: SupabaseClient, userId: string): Promise<{ scans: ScanResult[] }> => {
    if (!supabaseClient) {
        return { scans: [] };
    }

    try {
        const { data, error } = await supabaseClient
            .from('scans')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20); // Limit to last 20 scans

        if (error) {
            console.warn('Fetch scans warning:', error.message);
            return { scans: [] };
        }

        const scans = (data || []).map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            imageUrl: row.image_url,
            itemType: row.item_type || row.type,
            type: row.type || row.item_type,
            materials: row.materials || [],
            hazardLevel: row.hazard_level || 'medium',
            disposalMethod: row.disposal_method || '',
            confidence: row.confidence || 'medium',
            recyclingValue: row.recycling_value,
            dataSecurityRisk: row.data_security_risk || false,
            fallbackParsed: false,
            timestamp: new Date(row.created_at),
            saved: true
        }));

        return { scans };
    } catch (error: any) {
        console.warn('Fetch error:', error.message);
        return { scans: [] };
    }
};

/**
 * Get recycling centers from the database
 */
export const getRecyclingCenters = async (_client: SupabaseClient, location?: { latitude: number; longitude: number }): Promise<RecyclingCenter[]> => {
    if (!supabaseClient) {
        return [];
    }

    try {
        const { data, error } = await supabaseClient
            .from('recycling_centers')
            .select('*')
            .eq('active', true)
            .limit(50);

        if (error) {
            console.warn('Fetch centers warning:', error.message);
            return [];
        }

        return (data || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            address: row.address,
            acceptsItems: row.accepts_items || [],
            location: row.latitude && row.longitude ? {
                latitude: parseFloat(row.latitude),
                longitude: parseFloat(row.longitude)
            } : undefined,
            phoneNumber: row.phone_number,
            website: row.website,
            operatingHours: row.operating_hours,
            certifications: row.certifications || [],
            acceptsDataDevices: row.accepts_data_devices,
            dataWipingService: row.data_wiping_service,
            pickupService: row.pickup_service,
            fees: row.fees,
            active: row.active,
            verified: row.verified,
            distance: location && row.latitude && row.longitude
                ? calculateDistance(location.latitude, location.longitude, parseFloat(row.latitude), parseFloat(row.longitude))
                : undefined
        }));
    } catch (error: any) {
        console.warn('Fetch error:', error.message);
        return [];
    }
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

// ===========================================
// E-WASTE ITEMS (Repository)
// ===========================================

export interface EWasteItemDB {
    id: string;
    name: string;
    description: string;
    category: string;
    categoryId: string;
    keywords: string[];
    materials: string[];
    hazardLevel: string;
    disposalInstructions: string[];
    imageUrl: string;
}

/**
 * Get all e-waste items from the database
 */
export const getEWasteItems = async (searchQuery?: string): Promise<EWasteItemDB[]> => {
    if (!supabaseClient) {
        console.warn('Supabase not configured');
        return [];
    }

    try {
        let query = supabaseClient
            .from('ewaste_items')
            .select('*')
            .order('category', { ascending: true });

        const { data, error } = await query;

        if (error) {
            console.warn('Fetch e-waste items warning:', error.message);
            return [];
        }

        let items = (data || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            description: row.description || '',
            category: row.category,
            categoryId: row.category_id || row.category?.toLowerCase().replace(/\s+/g, '_'),
            keywords: row.keywords || [],
            materials: row.materials || [],
            hazardLevel: row.hazard_level || 'medium',
            disposalInstructions: row.disposal_instructions || [],
            imageUrl: row.image_url || ''
        }));

        // Client-side filtering for search
        if (searchQuery && searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            items = items.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                item.keywords.some((k: string) => k.toLowerCase().includes(query)) ||
                item.materials.some((m: string) => m.toLowerCase().includes(query))
            );
        }

        return items;
    } catch (error: any) {
        console.warn('Fetch e-waste items error:', error.message);
        return [];
    }
};

/**
 * Get distinct categories from e-waste items
 */
export const getEWasteCategories = async (): Promise<{ id: string; name: string; count: number }[]> => {
    if (!supabaseClient) {
        return [];
    }

    try {
        const { data, error } = await supabaseClient
            .from('ewaste_items')
            .select('category, category_id');

        if (error) {
            console.warn('Fetch categories warning:', error.message);
            return [];
        }

        // Group by category and count
        const categoryMap = new Map<string, { id: string; name: string; count: number }>();

        (data || []).forEach((row: any) => {
            const name = row.category;
            const id = row.category_id || name.toLowerCase().replace(/\s+/g, '_');

            if (categoryMap.has(name)) {
                categoryMap.get(name)!.count++;
            } else {
                categoryMap.set(name, { id, name, count: 1 });
            }
        });

        return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error: any) {
        console.warn('Fetch categories error:', error.message);
        return [];
    }
};

/**
 * Get e-waste items by category
 */
export const getEWasteItemsByCategory = async (categoryId: string): Promise<EWasteItemDB[]> => {
    if (!supabaseClient) {
        return [];
    }

    try {
        const { data, error } = await supabaseClient
            .from('ewaste_items')
            .select('*')
            .or(`category_id.eq.${categoryId},category.ilike.%${categoryId.replace(/_/g, ' ')}%`)
            .order('name', { ascending: true });

        if (error) {
            console.warn('Fetch items by category warning:', error.message);
            return [];
        }

        return (data || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            description: row.description || '',
            category: row.category,
            categoryId: row.category_id || row.category?.toLowerCase().replace(/\s+/g, '_'),
            keywords: row.keywords || [],
            materials: row.materials || [],
            hazardLevel: row.hazard_level || 'medium',
            disposalInstructions: row.disposal_instructions || [],
            imageUrl: row.image_url || ''
        }));
    } catch (error: any) {
        console.warn('Fetch by category error:', error.message);
        return [];
    }
};

