import AsyncStorage from './asyncStorage';
import NetInfo from '@react-native-community/netinfo';
import { ScanResult, RecyclingCenter, DisposalGuidance } from '../types';

// Cache keys
const CACHE_KEYS = {
  SCAN_RESULTS: 'cache_scan_results',
  RECYCLING_CENTERS: 'cache_recycling_centers',
  DISPOSAL_GUIDANCE: 'cache_disposal_guidance',
  USER_PREFERENCES: 'cache_user_preferences',
  LAST_SYNC: 'cache_last_sync',
  NETWORK_STATUS: 'cache_network_status'
} as const;

// Cache configuration
const CACHE_CONFIG = {
  MAX_SCAN_RESULTS: 100,
  MAX_RECYCLING_CENTERS: 500,
  MAX_DISPOSAL_GUIDANCE: 200,
  CACHE_DURATION_MS: 24 * 60 * 60 * 1000, // 24 hours
  SYNC_RETRY_ATTEMPTS: 3,
  SYNC_RETRY_DELAY: 2000 // 2 seconds
} as const;

// Types
interface CacheItem<T> {
  data: T;
  timestamp: number;
  version: string;
}

interface CacheMetadata {
  lastSync: number;
  itemCount: number;
  totalSize: number;
  version: string;
}

interface SyncQueueItem {
  id: string;
  type: 'scan_result' | 'feedback' | 'analytics';
  data: any;
  timestamp: number;
  retryCount: number;
}

// Network status management
class NetworkManager {
  private static instance: NetworkManager;
  private isConnected: boolean = true;
  private listeners: ((connected: boolean) => void)[] = [];

  private constructor() {
    this.initializeNetworkListener();
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private async initializeNetworkListener(): Promise<void> {
    try {
      const state = await NetInfo.fetch();
      this.isConnected = state.isConnected ?? false;
      
      NetInfo.addEventListener(state => {
        const wasConnected = this.isConnected;
        this.isConnected = state.isConnected ?? false;
        
        if (wasConnected !== this.isConnected) {
          this.notifyListeners();
          this.updateNetworkStatus();
        }
      });
    } catch (error) {
      console.warn('Failed to initialize network listener:', error);
    }
  }

  private async updateNetworkStatus(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        CACHE_KEYS.NETWORK_STATUS,
        JSON.stringify({
          isConnected: this.isConnected,
          lastUpdate: Date.now()
        })
      );
    } catch (error) {
      console.error('Failed to update network status:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.isConnected);
      } catch (error) {
        console.error('Network listener error:', error);
      }
    });
  }

  addListener(listener: (connected: boolean) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  isOnline(): boolean {
    return this.isConnected;
  }

  async getNetworkStatus(): Promise<{ isConnected: boolean; lastUpdate: number }> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.NETWORK_STATUS);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Failed to get network status:', error);
    }
    
    return { isConnected: this.isConnected, lastUpdate: Date.now() };
  }
}

// Main cache manager
export class OfflineCache {
  private static instance: OfflineCache;
  private networkManager: NetworkManager;
  private syncQueue: SyncQueueItem[] = [];
  private isSyncing: boolean = false;

  private constructor() {
    this.networkManager = NetworkManager.getInstance();
    this.initializeCache();
    this.setupNetworkListener();
  }

  static getInstance(): OfflineCache {
    if (!OfflineCache.instance) {
      OfflineCache.instance = new OfflineCache();
    }
    return OfflineCache.instance;
  }

  private async initializeCache(): Promise<void> {
    try {
      await this.loadSyncQueue();
      await this.cleanupExpiredCache();
    } catch (error) {
      console.error('Failed to initialize cache:', error);
    }
  }

  private setupNetworkListener(): void {
    this.networkManager.addListener((connected) => {
      if (connected && !this.isSyncing) {
        this.syncPendingData();
      }
    });
  }

  // Generic cache operations
  private async setCache<T>(key: string, data: T, version: string = '1.0.0'): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        version
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error(`Failed to set cache for ${key}:`, error);
      throw error;
    }
  }

  private async getCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() - cacheItem.timestamp > CACHE_CONFIG.CACHE_DURATION_MS) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error(`Failed to get cache for ${key}:`, error);
      return null;
    }
  }

  private async isCacheValid(key: string): Promise<boolean> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return false;

      const cacheItem: CacheItem<any> = JSON.parse(cached);
      return Date.now() - cacheItem.timestamp <= CACHE_CONFIG.CACHE_DURATION_MS;
    } catch (error) {
      return false;
    }
  }

  // Scan results caching
  async cacheScanResult(scanResult: ScanResult): Promise<void> {
    try {
      const cached = await this.getCache<ScanResult[]>(CACHE_KEYS.SCAN_RESULTS) || [];
      
      // Add new result at the beginning
      cached.unshift(scanResult);
      
      // Limit cache size
      if (cached.length > CACHE_CONFIG.MAX_SCAN_RESULTS) {
        cached.splice(CACHE_CONFIG.MAX_SCAN_RESULTS);
      }
      
      await this.setCache(CACHE_KEYS.SCAN_RESULTS, cached);
      
      // Add to sync queue if offline
      if (!this.networkManager.isOnline()) {
        await this.addToSyncQueue({
          id: scanResult.id || `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'scan_result',
          data: scanResult,
          timestamp: Date.now(),
          retryCount: 0
        });
      }
    } catch (error) {
      console.error('Failed to cache scan result:', error);
      throw error;
    }
  }

  async getCachedScanResults(userId: string, limit: number = 20): Promise<ScanResult[]> {
    try {
      const cached = await this.getCache<ScanResult[]>(CACHE_KEYS.SCAN_RESULTS) || [];
      
      return cached
        .filter(result => result.userId === userId)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get cached scan results:', error);
      return [];
    }
  }

  // Recycling centers caching
  async cacheRecyclingCenters(centers: RecyclingCenter[], location?: { lat: number; lng: number }): Promise<void> {
    try {
      const cacheKey = location 
        ? `${CACHE_KEYS.RECYCLING_CENTERS}_${location.lat.toFixed(2)}_${location.lng.toFixed(2)}`
        : CACHE_KEYS.RECYCLING_CENTERS;
      
      // Limit cache size
      const limitedCenters = centers.slice(0, CACHE_CONFIG.MAX_RECYCLING_CENTERS);
      
      await this.setCache(cacheKey, limitedCenters);
    } catch (error) {
      console.error('Failed to cache recycling centers:', error);
      throw error;
    }
  }

  async getCachedRecyclingCenters(location?: { lat: number; lng: number }): Promise<RecyclingCenter[]> {
    try {
      const cacheKey = location 
        ? `${CACHE_KEYS.RECYCLING_CENTERS}_${location.lat.toFixed(2)}_${location.lng.toFixed(2)}`
        : CACHE_KEYS.RECYCLING_CENTERS;
      
      const cached = await this.getCache<RecyclingCenter[]>(cacheKey);
      return cached || [];
    } catch (error) {
      console.error('Failed to get cached recycling centers:', error);
      return [];
    }
  }

  // Disposal guidance caching
  async cacheDisposalGuidance(guidance: DisposalGuidance[]): Promise<void> {
    try {
      // Limit cache size
      const limitedGuidance = guidance.slice(0, CACHE_CONFIG.MAX_DISPOSAL_GUIDANCE);
      
      await this.setCache(CACHE_KEYS.DISPOSAL_GUIDANCE, limitedGuidance);
    } catch (error) {
      console.error('Failed to cache disposal guidance:', error);
      throw error;
    }
  }

  async getCachedDisposalGuidance(itemType?: string): Promise<DisposalGuidance[]> {
    try {
      const cached = await this.getCache<DisposalGuidance[]>(CACHE_KEYS.DISPOSAL_GUIDANCE) || [];
      
      if (itemType) {
        return cached.filter(guide => 
          (guide as any).itemType?.toLowerCase().includes(itemType.toLowerCase()) ||
          (guide as any).category?.toLowerCase().includes(itemType.toLowerCase())
        );
      }
      
      return cached;
    } catch (error) {
      console.error('Failed to get cached disposal guidance:', error);
      return [];
    }
  }

  // Sync queue management
  private async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    try {
      this.syncQueue.push(item);
      await this.saveSyncQueue();
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  }

  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  private async loadSyncQueue(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem('sync_queue');
      if (cached) {
        this.syncQueue = JSON.parse(cached);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  // Sync pending data when online
  async syncPendingData(): Promise<void> {
    if (this.isSyncing || !this.networkManager.isOnline() || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    
    try {
      console.log(`Syncing ${this.syncQueue.length} pending items...`);
      
      const itemsToSync = [...this.syncQueue];
      const syncedItems: string[] = [];
      
      for (const item of itemsToSync) {
        try {
          await this.syncItem(item);
          syncedItems.push(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          
          // Increment retry count
          item.retryCount++;
          
          // Remove from queue if max retries reached
          if (item.retryCount >= CACHE_CONFIG.SYNC_RETRY_ATTEMPTS) {
            console.warn(`Removing item ${item.id} after ${item.retryCount} failed attempts`);
            syncedItems.push(item.id);
          }
        }
      }
      
      // Remove synced items from queue
      this.syncQueue = this.syncQueue.filter(item => !syncedItems.includes(item.id));
      await this.saveSyncQueue();
      
      console.log(`Sync completed. ${syncedItems.length} items processed.`);
      
    } catch (error) {
      console.error('Sync process failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    // This would integrate with your Firebase service
    // For now, we'll simulate the sync
    await new Promise(resolve => setTimeout(resolve, 100));
    
    switch (item.type) {
      case 'scan_result':
        // await firebaseService.syncScanResult(item.data);
        break;
      case 'feedback':
        // await firebaseService.syncFeedback(item.data);
        break;
      case 'analytics':
        // await firebaseService.syncAnalytics(item.data);
        break;
    }
  }

  // Cache management
  async getCacheMetadata(): Promise<CacheMetadata> {
    try {
      const keys = Object.values(CACHE_KEYS);
      let totalSize = 0;
      let itemCount = 0;
      
      for (const key of keys) {
        try {
          const cached = await AsyncStorage.getItem(key);
          if (cached) {
            totalSize += cached.length;
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed.data)) {
              itemCount += parsed.data.length;
            } else {
              itemCount += 1;
            }
          }
        } catch (error) {
          // Skip invalid cache entries
        }
      }
      
      const lastSync = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
      
      return {
        lastSync: lastSync ? parseInt(lastSync) : 0,
        itemCount,
        totalSize,
        version: '1.0.0'
      };
    } catch (error) {
      console.error('Failed to get cache metadata:', error);
      return {
        lastSync: 0,
        itemCount: 0,
        totalSize: 0,
        version: '1.0.0'
      };
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = Object.values(CACHE_KEYS);
      await AsyncStorage.multiRemove(keys);
      this.syncQueue = [];
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  private async cleanupExpiredCache(): Promise<void> {
    try {
      const keys = Object.values(CACHE_KEYS);
      
      for (const key of keys) {
        const isValid = await this.isCacheValid(key);
        if (!isValid) {
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup expired cache:', error);
    }
  }

  // Utility methods
  isOnline(): boolean {
    return this.networkManager.isOnline();
  }

  addNetworkListener(listener: (connected: boolean) => void): () => void {
    return this.networkManager.addListener(listener);
  }

  getPendingSyncCount(): number {
    return this.syncQueue.length;
  }

  async getLastSyncTime(): Promise<number> {
    try {
      const lastSync = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
      return lastSync ? parseInt(lastSync) : 0;
    } catch (error) {
      return 0;
    }
  }

  async updateLastSyncTime(): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());
    } catch (error) {
      console.error('Failed to update last sync time:', error);
    }
  }
}

// Export singleton instance
export const offlineCache = OfflineCache.getInstance();

// Export utility functions
export const isOnline = () => offlineCache.isOnline();
export const addNetworkListener = (listener: (connected: boolean) => void) => 
  offlineCache.addNetworkListener(listener);
export const syncPendingData = () => offlineCache.syncPendingData();
export const getCacheMetadata = () => offlineCache.getCacheMetadata();
export const clearCache = () => offlineCache.clearCache();