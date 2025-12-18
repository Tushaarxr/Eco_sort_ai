// Platform-agnostic AsyncStorage wrapper
import { Platform } from 'react-native';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

let AsyncStorage: any;

if (Platform.OS === 'web' && isBrowser) {
  // Web implementation using localStorage
  AsyncStorage = {
    async getItem(key: string): Promise<string | null> {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('AsyncStorage getItem error:', error);
        return null;
      }
    },

    async setItem(key: string, value: string): Promise<void> {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('AsyncStorage setItem error:', error);
        throw error;
      }
    },

    async removeItem(key: string): Promise<void> {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('AsyncStorage removeItem error:', error);
        throw error;
      }
    },

    async multiRemove(keys: string[]): Promise<void> {
      try {
        keys.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.error('AsyncStorage multiRemove error:', error);
        throw error;
      }
    },

    async clear(): Promise<void> {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('AsyncStorage clear error:', error);
        throw error;
      }
    },

    async getAllKeys(): Promise<string[]> {
      try {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) keys.push(key);
        }
        return keys;
      } catch (error) {
        console.error('AsyncStorage getAllKeys error:', error);
        return [];
      }
    }
  };
} else if (Platform.OS === 'web' && !isBrowser) {
  // Server-side rendering fallback - no-op implementation
  AsyncStorage = {
    async getItem(key: string): Promise<string | null> {
      return null;
    },
    async setItem(key: string, value: string): Promise<void> {
      // No-op for SSR
    },
    async removeItem(key: string): Promise<void> {
      // No-op for SSR
    },
    async multiRemove(keys: string[]): Promise<void> {
      // No-op for SSR
    },
    async clear(): Promise<void> {
      // No-op for SSR
    },
    async getAllKeys(): Promise<string[]> {
      return [];
    }
  };
} else {
  // React Native implementation
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

export default AsyncStorage;