import NetInfo from '@react-native-community/netinfo';
import { db } from '../../firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import axios from 'axios';

export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Try to fetch a single document from any collection
    const testQuery = query(collection(db, 'categories'), limit(1));
    await getDocs(testQuery);
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};

export const testGeminiConnection = async (apiKey: string): Promise<boolean> => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    await axios.get(url);
    return true;
  } catch (error) {
    console.error('Gemini API connection test failed:', error);
    return false;
  }
};

export const checkNetworkConnectivity = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected || false;
};