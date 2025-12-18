import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Linking, Platform, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip, Divider, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS } from '../../../src/styles/colors';
import { RecyclingCenter } from '../../../src/types';
import { getRecyclingCenters } from '../../../src/api/supabaseService';
import { useSupabase } from '../../../src/hooks/useSupabase';
import { useRecyclingCentersCache } from '../../../src/hooks/useOfflineCache';

export default function RecyclingCentersScreen() {
  const [filteredCenters, setFilteredCenters] = useState<RecyclingCenter[]>([]);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const supabaseClient = useSupabase();

  // Use offline cache hook for recycling centers
  const {
    recyclingCenters: centers,
    isLoadingCenters: loading,
    error,
    loadCachedCenters: refreshCenters,
    isOnline
  } = useRecyclingCentersCache(userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : undefined);

  useEffect(() => {
    checkLocationPermission();
    refreshCenters();
  }, []);

  useEffect(() => {
    setFilteredCenters(centers);
  }, [centers]);

  const checkLocationPermission = async (): Promise<void> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    } catch (error) {
      console.error('Error checking location permission:', error);
      setLocationPermission(false);
    }
  };

  const loadRecyclingCenters = async (): Promise<void> => {
    try {
      let location = null;
      if (locationPermission) {
        try {
          const loc = await Location.getCurrentPositionAsync({});
          location = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setUserLocation(location);
        } catch (e) {
          console.log("Could not get location", e);
        }
      }

      const centersData = await getRecyclingCenters(supabaseClient, location || undefined);
      setFilteredCenters(centersData);
    } catch (error) {
      console.error('Error loading recycling centers:', error);
      Alert.alert('Error', 'Failed to load recycling centers. Please try again.');
    }
  };



  const openMaps = (address: string): void => {
    const formattedAddress = encodeURIComponent(address);
    const mapsUrl = Platform.select({
      ios: `maps:0,0?q=${formattedAddress}`,
      android: `geo:0,0?q=${formattedAddress}`,
    });

    if (!mapsUrl) return;

    Linking.canOpenURL(mapsUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(mapsUrl);
        } else {
          // Fallback to Google Maps web URL
          return Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${formattedAddress}`);
        }
      })
      .catch((error) => console.error('Error opening maps:', error));
  };

  const callCenter = (phoneNumber: string): void => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const visitWebsite = (website: string): void => {
    Linking.openURL(website);
  };

  const onChangeSearch = (query: string): void => {
    setSearchQuery(query);
    filterCenters(query, selectedFilter);
  };

  const filterByType = (type: string): void => {
    setSelectedFilter(type);
    filterCenters(searchQuery, type);
  };

  const filterCenters = (query: string, type: string): void => {
    let filtered = centers;

    // Filter by search query
    if (query) {
      filtered = filtered.filter(center =>
        center.name.toLowerCase().includes(query.toLowerCase()) ||
        center.address.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by type
    if (type !== 'All') {
      filtered = filtered.filter(center =>
        center.acceptsItems.some(item => item.toLowerCase() === type.toLowerCase())
      );
    }

    setFilteredCenters(filtered);
  };

  const renderCenterItem = ({ item }: { item: RecyclingCenter }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.centerName}>{item.name}</Text>
        <Text style={styles.address}>{item.address}</Text>

        {item.distance && (
          <View style={styles.distanceContainer}>
            <MaterialCommunityIcons name="map-marker-distance" size={16} color={COLORS.primary} />
            <Text style={styles.distance}>
              {typeof item.distance === 'number' ? `${item.distance} km away` : item.distance}
            </Text>
          </View>
        )}

        <Divider style={styles.divider} />

        <Text style={styles.acceptsTitle}>Accepts:</Text>
        <View style={styles.chipsContainer}>
          {item.acceptsItems.map((acceptedItem, index) => (
            <Chip key={index} style={styles.chip} textStyle={styles.chipText}>
              {acceptedItem}
            </Chip>
          ))}
        </View>

        {item.operatingHours && (
          <Text style={styles.hours}>Hours: {item.operatingHours}</Text>
        )}
      </Card.Content>

      <Card.Actions style={styles.actions}>
        <Button
          mode="contained"
          icon="directions"
          onPress={() => openMaps(item.address)}
          style={styles.actionButton}
        >
          Directions
        </Button>

        {item.phoneNumber && (
          <Button
            mode="outlined"
            icon="phone"
            onPress={() => item.phoneNumber && callCenter(item.phoneNumber)}
            style={styles.actionButton}
          >
            Call
          </Button>
        )}

        {item.website && (
          <Button
            mode="outlined"
            icon="web"
            onPress={() => item.website && visitWebsite(item.website)}
            style={styles.actionButton}
          >
            Website
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by name or location"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by type:</Text>
        <FlatList
          horizontal
          data={['All', 'Batteries', 'Electronics', 'Computers', 'Phones', 'Appliances']}
          renderItem={({ item }) => (
            <Chip
              selected={selectedFilter === item}
              onPress={() => filterByType(item)}
              style={[styles.filterChip, selectedFilter === item && styles.selectedFilterChip]}
              textStyle={[styles.filterChipText, selectedFilter === item && styles.selectedFilterChipText]}
            >
              {item}
            </Chip>
          )}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {!locationPermission && (
        <Card style={styles.warningCard}>
          <Card.Content>
            <Text style={styles.warningText}>
              Location permission not granted. Showing all recycling centers without distance calculation.
            </Text>
            <Button
              mode="contained"
              onPress={async () => {
                await checkLocationPermission();
                loadRecyclingCenters();
              }}
              style={styles.permissionButton}
            >
              Grant Permission
            </Button>
          </Card.Content>
        </Card>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding recycling centers near you...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCenters}
          renderItem={renderCenterItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No recycling centers found matching your criteria.
              </Text>
              <Button
                mode="outlined"
                onPress={() => {
                  setSearchQuery('');
                  setSelectedFilter('All');
                  setFilteredCenters(centers);
                }}
                style={styles.resetButton}
              >
                Reset Filters
              </Button>
            </View>
          )}
        />
      )}
    </View>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterLabel: {
    marginBottom: 8,
    fontSize: 14,
    color: '#666',
  },
  filterList: {
    paddingBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#e0e0e0',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    color: '#666',
  },
  selectedFilterChipText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  centerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  address: {
    marginTop: 4,
    color: '#666',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  distance: {
    marginLeft: 4,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  acceptsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 4,
  },
  chipText: {
    fontSize: 12,
  },
  hours: {
    marginTop: 8,
    color: '#666',
  },
  actions: {
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  actionButton: {
    marginRight: 8,
    marginTop: 8,
  },
  warningCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#FFF9C4',
  },
  warningText: {
    color: '#F57F17',
    marginBottom: 8,
  },
  permissionButton: {
    marginTop: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  resetButton: {
    marginTop: 8,
  },
});
