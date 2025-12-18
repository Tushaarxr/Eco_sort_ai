# Offline Capabilities and Caching System

This document describes the comprehensive offline capabilities and caching system implemented in the E-Waste Assistant app.

## Overview

The app now features robust offline functionality that ensures users can access critical features even without an internet connection. The system intelligently caches data and provides seamless online/offline transitions.

## Key Features

### 1. Automatic Network Detection
- Real-time network status monitoring using `@react-native-netinfo/netinfo`
- Automatic switching between online and offline modes
- Visual indicators for offline status

### 2. Intelligent Data Caching
- **Scan Results**: All scan results are cached locally for offline access
- **Recycling Centers**: Location-based caching with intelligent radius management
- **Disposal Guidance**: Item-specific guidance cached for quick offline access
- **Metadata Tracking**: Cache timestamps, expiration, and sync status

### 3. Sync Queue Management
- Pending operations are queued when offline
- Automatic synchronization when connection is restored
- Conflict resolution for data consistency

## Implementation Details

### Core Components

#### 1. Offline Cache Utility (`src/utils/offlineCache.ts`)
```typescript
// Key functions:
- isOnline(): boolean
- cacheScanResult(result: ScanResult): Promise<void>
- getCachedScanResults(): Promise<ScanResult[]>
- cacheRecyclingCenters(centers: RecyclingCenter[], location: Location): Promise<void>
- getCachedRecyclingCenters(location: Location): Promise<RecyclingCenter[]>
- cacheDisposalGuidance(guidance: DisposalGuidance, itemType: string): Promise<void>
- getCachedDisposalGuidance(itemType: string): Promise<DisposalGuidance | null>
```

#### 2. React Hooks (`src/hooks/useOfflineCache.ts`)
- `useOfflineCache()`: Main hook for cache management
- `useScanResults()`: Specialized hook for scan result caching
- `useRecyclingCenters()`: Location-aware recycling center caching
- `useDisposalGuidance()`: Item-specific guidance caching

#### 3. Firebase Service Integration
All Firebase service functions now include offline capabilities:
- `scanItem()`: Immediate caching with background sync
- `getRecyclingCenters()`: Cache-first approach with fresh data updates
- `getDisposalGuidance()`: Intelligent fallback to cached guidance
- `getUserScanHistory()`: Offline-accessible scan history

### Caching Strategy

#### 1. Cache-First Approach
1. Check for cached data first
2. Return cached data if offline or if fresh data fails
3. Fetch fresh data when online
4. Update cache with fresh data
5. Return fresh data to user

#### 2. Location-Based Caching
- Recycling centers cached by geographic regions
- Intelligent radius-based cache invalidation
- Distance-aware cache optimization

#### 3. Time-Based Expiration
- Configurable cache expiration times
- Automatic cache cleanup for old data
- Smart refresh based on data age

## Usage Examples

### 1. Using Offline Cache Hooks

```typescript
// In a React component
import { useRecyclingCenters } from 'src/hooks/useOfflineCache';

function RecyclingCentersScreen() {
  const {
    data: centers,
    loading,
    error,
    refresh,
    isOffline
  } = useRecyclingCenters(userLocation, 25, ['electronics']);

  return (
    <View>
      {isOffline && <OfflineBanner />}
      {loading ? <LoadingSpinner /> : <CentersList centers={centers} />}
    </View>
  );
}
```

### 2. Manual Cache Operations

```typescript
import { offlineCache } from 'src/utils/offlineCache';

// Cache scan result
await offlineCache.cacheScanResult(scanResult);

// Get cached data
const cachedResults = await offlineCache.getCachedScanResults();

// Check online status
if (offlineCache.isOnline()) {
  // Perform online operations
}
```

## Data Storage

### Storage Keys
- `scan_results`: Array of cached scan results
- `recycling_centers_[lat]_[lng]`: Location-specific recycling centers
- `disposal_guidance_[itemType]`: Item-specific disposal guidance
- `cache_metadata`: Cache timestamps and sync status
- `sync_queue`: Pending operations for synchronization

### Storage Limits
- Maximum 1000 scan results cached
- Recycling centers cached for 24 hours
- Disposal guidance cached for 7 days
- Automatic cleanup of expired data

## Error Handling

### Graceful Degradation
1. **Network Failures**: Automatic fallback to cached data
2. **Cache Misses**: Fallback to generic/default data
3. **Storage Errors**: Graceful handling with user notifications
4. **Sync Conflicts**: Intelligent conflict resolution

### User Feedback
- Clear offline indicators
- Cache status information
- Sync progress notifications
- Error messages with retry options

## Performance Optimizations

### 1. Lazy Loading
- Cache data loaded on demand
- Background prefetching for common queries
- Memory-efficient data structures

### 2. Compression
- JSON data compression for storage efficiency
- Image caching with size optimization
- Selective data caching based on usage patterns

### 3. Background Sync
- Non-blocking synchronization
- Batch operations for efficiency
- Smart retry mechanisms with exponential backoff

## Security Considerations

### Data Protection
- No sensitive user data cached locally
- Encrypted storage for sensitive information
- Automatic cache clearing on app uninstall

### Privacy
- Location data anonymized in cache
- User consent for location-based caching
- Configurable cache retention policies

## Configuration

### Cache Settings
```typescript
const CACHE_CONFIG = {
  SCAN_RESULTS_LIMIT: 1000,
  RECYCLING_CENTERS_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  DISPOSAL_GUIDANCE_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  SYNC_RETRY_ATTEMPTS: 3,
  SYNC_RETRY_DELAY: 5000 // 5 seconds
};
```

### Network Settings
```typescript
const NETWORK_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  OFFLINE_THRESHOLD: 5000 // 5 seconds
};
```

## Monitoring and Analytics

### Cache Performance
- Cache hit/miss ratios
- Data freshness metrics
- Storage usage statistics
- Sync success rates

### User Experience
- Offline usage patterns
- Feature availability metrics
- Error frequency and types
- Performance impact measurements

## Future Enhancements

### Planned Features
1. **Selective Sync**: User-configurable sync preferences
2. **Predictive Caching**: ML-based cache preloading
3. **Peer-to-Peer Sync**: Local network data sharing
4. **Advanced Compression**: More efficient storage algorithms

### Scalability
- Cloud-based cache synchronization
- Distributed cache management
- Real-time cache invalidation
- Multi-device cache consistency

## Troubleshooting

### Common Issues
1. **Cache Not Updating**: Check network connectivity and sync queue
2. **Storage Full**: Automatic cleanup should handle this
3. **Sync Failures**: Check error logs and retry mechanisms
4. **Performance Issues**: Monitor cache size and cleanup frequency

### Debug Tools
- Cache inspection utilities
- Network status monitoring
- Sync queue visualization
- Performance profiling tools

## Best Practices

### For Developers
1. Always check online status before network operations
2. Implement proper error handling for cache operations
3. Use appropriate cache expiration times
4. Monitor cache performance and storage usage
5. Test offline scenarios thoroughly

### For Users
1. Allow location permissions for better caching
2. Regularly sync when online
3. Clear cache if experiencing issues
4. Update app regularly for cache improvements

This offline capability system ensures that the E-Waste Assistant remains functional and useful even in areas with poor connectivity, providing a seamless user experience across all network conditions.