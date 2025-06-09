import { auth, db, storage } from '../../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  doc, 
  getDoc, 
  DocumentData, 
  QueryDocumentSnapshot 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import { ScanResult, RecyclingCenter, EWasteItem, Category } from '../types';

// Upload image to Firebase Storage
export const uploadImage = async (userId: string, imageUri: string): Promise<string> => {
  try {
    const blob = await uriToBlob(imageUri);
    const filename = `${userId}/${Date.now()}.jpg`;
    const storageRef = ref(storage, `scan-images/${filename}`);
    
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Save scan result to Firestore
export const saveScanResult = async (userId: string, scanData: ScanResult): Promise<string> => {
  try {
    const scanRef = collection(db, 'scans');
    const timestamp = new Date();
    
    const docRef = await addDoc(scanRef, {
      userId,
      ...scanData,
      timestamp,
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving scan result:', error);
    throw error;
  }
};

// Get user's scan history
export const getUserScans = async (userId: string): Promise<ScanResult[]> => {
  try {
    const scansRef = collection(db, 'scans');
    const q = query(
      scansRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const scans: ScanResult[] = [];
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      scans.push({
        id: doc.id,
        ...doc.data() as ScanResult,
      });
    });
    
    return scans;
  } catch (error) {
    console.error('Error getting user scans:', error);
    throw error;
  }
};

// Get recycling centers based on item type and user location
export const getRecyclingCenters = async (itemType: string): Promise<RecyclingCenter[]> => {
  try {
    // Get user's location
    let { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      // Return generic centers if location permission not granted
      return getGenericRecyclingCenters(itemType);
    }
    
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    
    // Query recycling centers collection
    const centersRef = collection(db, 'recyclingCenters');
    const q = query(
      centersRef,
      where('acceptsItems', 'array-contains', itemType)
    );
    
    const querySnapshot = await getDocs(q);
    const centers: RecyclingCenter[] = [];
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const centerData = doc.data() as Omit<RecyclingCenter, 'id'>;
      
      // Calculate distance (simplified version)
      const distance = calculateDistance(
        latitude,
        longitude,
        centerData.location?.latitude || 0,
        centerData.location?.longitude || 0
      );
      
      centers.push({
        id: doc.id,
        ...centerData,
        distance: parseFloat(distance.toFixed(2)),
      });
    });
    
    // Sort by distance
    return centers.sort((a, b) => {
      const distA = typeof a.distance === 'number' ? a.distance : Number.MAX_VALUE;
      const distB = typeof b.distance === 'number' ? b.distance : Number.MAX_VALUE;
      return distA - distB;
    });
  } catch (error) {
    console.error('Error getting recycling centers:', error);
    return getGenericRecyclingCenters(itemType);
  }
};

// Search e-waste database
export const searchEWasteDatabase = async (searchTerm: string): Promise<EWasteItem[]> => {
  try {
    const itemsRef = collection(db, 'ewasteItems');
    
    // Search by name (simple implementation)
    const nameQuery = query(
      itemsRef,
      where('keywords', 'array-contains', searchTerm.toLowerCase()),
      limit(20)
    );
    
    const querySnapshot = await getDocs(nameQuery);
    const items: EWasteItem[] = [];
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      items.push({
        id: doc.id,
        ...doc.data() as Omit<EWasteItem, 'id'>,
      });
    });
    
    return items;
  } catch (error) {
    console.error('Error searching e-waste database:', error);
    throw error;
  }
};

// Get item categories
export const getItemCategories = async (): Promise<Category[]> => {
  try {
    const categoriesRef = collection(db, 'categories');
    const querySnapshot = await getDocs(categoriesRef);
    const categories: Category[] = [];
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      categories.push({
        id: doc.id,
        ...doc.data() as Omit<Category, 'id'>,
      });
    });
    
    return categories;
  } catch (error) {
    console.error('Error getting item categories:', error);
    throw error;
  }
};

// Get items by category
export const getItemsByCategory = async (categoryId: string): Promise<EWasteItem[]> => {
  try {
    const itemsRef = collection(db, 'ewasteItems');
    const q = query(
      itemsRef,
      where('categoryId', '==', categoryId),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    const items: EWasteItem[] = [];
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      items.push({
        id: doc.id,
        ...doc.data() as Omit<EWasteItem, 'id'>,
      });
    });
    
    return items;
  } catch (error) {
    console.error('Error getting items by category:', error);
    throw error;
  }
};

// Helper functions
const uriToBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

const getGenericRecyclingCenters = (itemType: string): RecyclingCenter[] => {
  // Return some fallback data when location is not available
  return [
    {
      id: '1',
      name: 'City Recycling Center',
      address: '123 Green St, Anytown',
      acceptsItems: ['batteries', 'electronics', 'computers', itemType],
      distance: 'Unknown',
    },
    {
      id: '2',
      name: 'E-Waste Solutions',
      address: '456 Tech Blvd, Anytown',
      acceptsItems: ['phones', 'tablets', 'computers', 'monitors', itemType],
      distance: 'Unknown',
    },
    {
      id: '3',
      name: 'Electronics Disposal Facility',
      address: '789 Circuit Ave, Anytown',
      acceptsItems: ['all electronics', itemType],
      distance: 'Unknown',
    },
  ];
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};
