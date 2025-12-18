import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { offlineCache, isOnline, addNetworkListener } from '../utils/offlineCache';
import { ScanResult, RecyclingCenter, DisposalGuidance } from '../types';

// Hook return types
interface UseOfflineCacheReturn {
  isOnline: boolean;
  isLoading: boolean;
  error: string | null;
  pendingSyncCount: number;
  lastSyncTime: number;
  cacheMetadata: {
    itemCount: number;
    totalSize: number;
    lastSync: number;
  };
  
  // Cache operations
  cacheScanResult: (result: ScanResult) => Promise<void>;
  getCachedScanResults: (userId: string, limit?: number) => Promise<ScanResult[]>;
  cacheRecyclingCenters: (centers: RecyclingCenter[], location?: { lat: number; lng: number }) => Promise<void>;
  getCachedRecyclingCenters: (location?: { lat: number; lng: number }) => Promise<RecyclingCenter[]>;
  cacheDisposalGuidance: (guidance: DisposalGuidance[]) => Promise<void>;
  getCachedDisposalGuidance: (itemType?: string) => Promise<DisposalGuidance[]>;
  
  // Sync operations
  syncPendingData: () => Promise<void>;
  clearCache: () => Promise<void>;
  refreshCacheMetadata: () => Promise<void>;
}

interface UseOfflineCacheOptions {
  autoSync?: boolean;
  syncInterval?: number;
  onSyncComplete?: () => void;
  onSyncError?: (error: Error) => void;
  onNetworkChange?: (online: boolean) => void;
}

// Main hook for offline cache management
export const useOfflineCache = (options: UseOfflineCacheOptions = {}): UseOfflineCacheReturn => {
  const {
    autoSync = true,
    syncInterval = 30000, // 30 seconds
    onSyncComplete,
    onSyncError,
    onNetworkChange
  } = options;

  // State
  const [networkStatus, setNetworkStatus] = useState(isOnline());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(0);
  const [cacheMetadata, setCacheMetadata] = useState({
    itemCount: 0,
    totalSize: 0,
    lastSync: 0
  });

  // Refs for cleanup
  const networkListenerRef = useRef<(() => void) | null>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Helper functions
  const updatePendingSyncCount = useCallback(() => {
    setPendingSyncCount(offlineCache.getPendingSyncCount());
  }, []);

  const updateLastSyncTime = useCallback(async () => {
    try {
      const time = await offlineCache.getLastSyncTime();
      setLastSyncTime(time);
    } catch (err) {
      console.error('Failed to update last sync time:', err);
    }
  }, []);

  const refreshCacheMetadata = useCallback(async (): Promise<void> => {
    try {
      const metadata = await offlineCache.getCacheMetadata();
      setCacheMetadata({
        itemCount: metadata.itemCount,
        totalSize: metadata.totalSize,
        lastSync: metadata.lastSync
      });
    } catch (err) {
      console.error('Failed to refresh cache metadata:', err);
    }
  }, []);

  // Cache operations
  const cacheScanResult = useCallback(async (result: ScanResult): Promise<void> => {
    try {
      setError(null);
      await offlineCache.cacheScanResult(result);
      await refreshCacheMetadata();
      updatePendingSyncCount();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cache scan result';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshCacheMetadata, updatePendingSyncCount]);

  const getCachedScanResults = useCallback(async (userId: string, limit?: number): Promise<ScanResult[]> => {
    try {
      setError(null);
      return await offlineCache.getCachedScanResults(userId, limit);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get cached scan results';
      setError(errorMessage);
      return [];
    }
  }, []);

  const cacheRecyclingCenters = useCallback(async (
    centers: RecyclingCenter[], 
    location?: { lat: number; lng: number }
  ): Promise<void> => {
    try {
      setError(null);
      await offlineCache.cacheRecyclingCenters(centers, location);
      await refreshCacheMetadata();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cache recycling centers';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshCacheMetadata]);

  const getCachedRecyclingCenters = useCallback(async (
    location?: { lat: number; lng: number }
  ): Promise<RecyclingCenter[]> => {
    try {
      setError(null);
      return await offlineCache.getCachedRecyclingCenters(location);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get cached recycling centers';
      setError(errorMessage);
      return [];
    }
  }, []);

  const cacheDisposalGuidance = useCallback(async (guidance: DisposalGuidance[]): Promise<void> => {
    try {
      setError(null);
      await offlineCache.cacheDisposalGuidance(guidance);
      await refreshCacheMetadata();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cache disposal guidance';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshCacheMetadata]);

  const getCachedDisposalGuidance = useCallback(async (itemType?: string): Promise<DisposalGuidance[]> => {
    try {
      setError(null);
      return await offlineCache.getCachedDisposalGuidance(itemType);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get cached disposal guidance';
      setError(errorMessage);
      return [];
    }
  }, []);

  // Sync operations
  const handleSync = useCallback(async (): Promise<void> => {
    if (isLoading || !networkStatus) return;

    try {
      setIsLoading(true);
      setError(null);
      
      await offlineCache.syncPendingData();
      await offlineCache.updateLastSyncTime();
      
      updatePendingSyncCount();
      updateLastSyncTime();
      
      onSyncComplete?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sync failed');
      setError(error.message);
      onSyncError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, networkStatus, onSyncComplete, onSyncError, updatePendingSyncCount, updateLastSyncTime]);

  const clearAutoSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  const setupAutoSync = useCallback(() => {
    clearAutoSync();
    syncIntervalRef.current = setInterval(() => {
      if (networkStatus && !isLoading) {
        handleSync();
      }
    }, syncInterval);
  }, [networkStatus, isLoading, syncInterval, handleSync, clearAutoSync]);

  // Initialize hook
  const initializeHook = useCallback(async () => {
    try {
      networkListenerRef.current = addNetworkListener((online) => {
        setNetworkStatus(online);
        onNetworkChange?.(online);
        if (online && autoSync) {
          handleSync();
        }
      });
      await refreshCacheMetadata();
      updatePendingSyncCount();
      updateLastSyncTime();
    } catch (err) {
      console.error('Failed to initialize offline cache hook:', err);
      setError(err instanceof Error ? err.message : 'Initialization failed');
    }
  }, [autoSync, onNetworkChange, handleSync, refreshCacheMetadata, updatePendingSyncCount, updateLastSyncTime]);

  const cleanup = useCallback(() => {
    if (networkListenerRef.current) {
      networkListenerRef.current();
    }
    clearAutoSync();
  }, [clearAutoSync]);

  useEffect(() => {
    initializeHook();
    return cleanup;
  }, [initializeHook, cleanup]);

  // Auto-sync setup
  useEffect(() => {
    if (autoSync && networkStatus) {
      setupAutoSync();
    } else {
      clearAutoSync();
    }
    return clearAutoSync;
  }, [autoSync, networkStatus, syncInterval, setupAutoSync, clearAutoSync]);

  const syncPendingData = useCallback(async (): Promise<void> => {
    await handleSync();
  }, [handleSync]);

  const clearCache = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      
      await offlineCache.clearCache();
      
      // Reset state
      setPendingSyncCount(0);
      setLastSyncTime(0);
      setCacheMetadata({
        itemCount: 0,
        totalSize: 0,
        lastSync: 0
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cache';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cacheApi = useMemo(() => ({
    isOnline: networkStatus,
    isLoading,
    error,
    pendingSyncCount,
    lastSyncTime,
    cacheMetadata,
    cacheScanResult,
    getCachedScanResults,
    cacheRecyclingCenters,
    getCachedRecyclingCenters,
    cacheDisposalGuidance,
    getCachedDisposalGuidance,
    syncPendingData,
    clearCache,
    refreshCacheMetadata
  }), [
    networkStatus,
    isLoading,
    error,
    pendingSyncCount,
    lastSyncTime,
    cacheMetadata,
    cacheScanResult,
    getCachedScanResults,
    cacheRecyclingCenters,
    getCachedRecyclingCenters,
    cacheDisposalGuidance,
    getCachedDisposalGuidance,
    syncPendingData,
    clearCache,
    refreshCacheMetadata
  ]);

  return cacheApi;
};

// Specialized hooks for specific use cases
export const useScanResultsCache = (userId: string) => {
  const cache = useOfflineCache();
  
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  const loadCachedResults = useCallback(async (limit?: number) => {
    try {
      setIsLoadingResults(true);
      const results = await cache.getCachedScanResults(userId, limit);
      setScanResults(results);
    } catch (err) {
      console.error('Failed to load cached scan results:', err);
    } finally {
      setIsLoadingResults(false);
    }
  }, [cache, userId]);

  const addScanResult = useCallback(async (result: ScanResult) => {
    try {
      await cache.cacheScanResult(result);
      setScanResults(prev => [result, ...prev]);
    } catch (err) {
      console.error('Failed to add scan result:', err);
      throw err;
    }
  }, [cache]);

  useEffect(() => {
    loadCachedResults();
  }, [loadCachedResults]);

  return {
    ...cache,
    scanResults,
    isLoadingResults,
    loadCachedResults,
    addScanResult
  };
};

export const useRecyclingCentersCache = (location?: { lat: number; lng: number }) => {
  const cache = useOfflineCache();
  const lat = location?.lat;
  const lng = location?.lng;
  
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([]);
  const [isLoadingCenters, setIsLoadingCenters] = useState(false);

  const loadCachedCenters = useCallback(async () => {
    try {
      setIsLoadingCenters(true);
      const centers = await cache.getCachedRecyclingCenters(
        lat !== undefined && lng !== undefined ? { lat, lng } : undefined
      );
      setRecyclingCenters(centers);
    } catch (err) {
      console.error('Failed to load cached recycling centers:', err);
    } finally {
      setIsLoadingCenters(false);
    }
  }, [cache, lat, lng]);

  const updateCenters = useCallback(async (centers: RecyclingCenter[]) => {
    try {
      await cache.cacheRecyclingCenters(
        centers,
        lat !== undefined && lng !== undefined ? { lat, lng } : undefined
      );
      setRecyclingCenters(centers);
    } catch (err) {
      console.error('Failed to update recycling centers:', err);
      throw err;
    }
  }, [cache, lat, lng]);

  useEffect(() => {
    loadCachedCenters();
  }, [loadCachedCenters]);

  return {
    ...cache,
    recyclingCenters,
    isLoadingCenters,
    loadCachedCenters,
    updateCenters
  };
};

export const useDisposalGuidanceCache = () => {
  const cache = useOfflineCache();
  
  const [disposalGuidance, setDisposalGuidance] = useState<DisposalGuidance[]>([]);
  const [isLoadingGuidance, setIsLoadingGuidance] = useState(false);

  const loadCachedGuidance = useCallback(async (itemType?: string) => {
    try {
      setIsLoadingGuidance(true);
      const guidance = await cache.getCachedDisposalGuidance(itemType);
      setDisposalGuidance(guidance);
    } catch (err) {
      console.error('Failed to load cached disposal guidance:', err);
    } finally {
      setIsLoadingGuidance(false);
    }
  }, [cache]);

  const updateGuidance = useCallback(async (guidance: DisposalGuidance[]) => {
    try {
      await cache.cacheDisposalGuidance(guidance);
      setDisposalGuidance(guidance);
    } catch (err) {
      console.error('Failed to update disposal guidance:', err);
      throw err;
    }
  }, [cache]);

  useEffect(() => {
    loadCachedGuidance();
  }, [loadCachedGuidance]);

  return {
    ...cache,
    disposalGuidance,
    isLoadingGuidance,
    loadCachedGuidance,
    updateGuidance
  };
};
