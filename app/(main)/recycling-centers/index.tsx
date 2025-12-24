import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Linking, Platform, Alert, TextInput as RNTextInput, ScrollView, SafeAreaView } from 'react-native';
import { Text, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS } from '../../../src/styles/colors';
import { RecyclingCenter } from '../../../src/types';
import { getRecyclingCenters } from '../../../src/api/supabaseService';
import { TouchableOpacity } from 'react-native';

export default function RecyclingCentersScreen() {
  const [centers, setCenters] = useState<RecyclingCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<RecyclingCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLocation, setHasLocation] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchCity, setSearchCity] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    applyFilter(selectedFilter);
  }, [centers, selectedFilter]);

  const initializeLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        try {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const location = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setHasLocation(true);
          await loadCenters(location);
          return;
        } catch (e) {
          console.log('Could not get GPS:', e);
        }
      }

      setShowSearch(true);
      await loadCenters(null);
    } catch (error) {
      console.error('Location error:', error);
      await loadCenters(null);
    }
  };

  const loadCenters = async (location: { latitude: number; longitude: number } | null) => {
    try {
      const data = await getRecyclingCenters(null as any, location || undefined);

      if (location) {
        data.sort((a, b) => {
          const distA = typeof a.distance === 'number' ? a.distance : Infinity;
          const distB = typeof b.distance === 'number' ? b.distance : Infinity;
          return distA - distB;
        });
      }

      setCenters(data);
      setFilteredCenters(data);
    } catch (error) {
      console.error('Error loading centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchByCity = async () => {
    if (!searchCity.trim()) return;

    setLoading(true);
    try {
      const results = await Location.geocodeAsync(searchCity);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        setHasLocation(true);
        setShowSearch(false);
        await loadCenters({ latitude, longitude });
      } else {
        Alert.alert('Not Found', 'Could not find that location');
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not search location');
      setLoading(false);
    }
  };

  const applyFilter = (filter: string) => {
    if (filter === 'All') {
      setFilteredCenters(centers);
    } else {
      setFilteredCenters(centers.filter(c =>
        c.acceptsItems.some(item => item.toLowerCase().includes(filter.toLowerCase()))
      ));
    }
  };

  const openMaps = (center: RecyclingCenter) => {
    const { address, location } = center;
    let url = '';

    if (location?.latitude && location?.longitude) {
      url = Platform.select({
        ios: `maps:0,0?q=${location.latitude},${location.longitude}`,
        android: `geo:${location.latitude},${location.longitude}`,
      }) || `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    } else {
      const addr = encodeURIComponent(address);
      url = `https://www.google.com/maps/search/?api=1&query=${addr}`;
    }

    Linking.openURL(url);
  };

  const callCenter = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const filters = ['All', 'Electronics', 'Batteries', 'Computers', 'Phones', 'Appliances'];

  const renderCenter = ({ item }: { item: RecyclingCenter }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          {item.verified && (
            <MaterialCommunityIcons name="check-decagram" size={16} color="#4CAF50" />
          )}
        </View>
        {typeof item.distance === 'number' && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{item.distance} km</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardAddress} numberOfLines={2}>{item.address}</Text>

      {item.operatingHours && (
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="clock-outline" size={14} color="#888" />
          <Text style={styles.infoText}>{item.operatingHours}</Text>
        </View>
      )}

      <View style={styles.chipsContainer}>
        {item.acceptsItems.slice(0, 4).map((acc, idx) => (
          <View key={idx} style={styles.chip}>
            <Text style={styles.chipText}>{acc}</Text>
          </View>
        ))}
        {item.acceptsItems.length > 4 && (
          <View style={styles.chip}>
            <Text style={styles.chipText}>+{item.acceptsItems.length - 4}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openMaps(item)}>
          <MaterialCommunityIcons name="directions" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Directions</Text>
        </TouchableOpacity>

        {item.phoneNumber && (
          <TouchableOpacity style={styles.actionBtnOutline} onPress={() => callCenter(item.phoneNumber!)}>
            <MaterialCommunityIcons name="phone" size={16} color={COLORS.primary} />
            <Text style={styles.actionBtnOutlineText}>Call</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding centers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Location Bar */}
        {showSearch ? (
          <View style={styles.searchBar}>
            <RNTextInput
              style={styles.searchInput}
              placeholder="Enter city name..."
              value={searchCity}
              onChangeText={setSearchCity}
              onSubmitEditing={searchByCity}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={searchByCity}>
              <MaterialCommunityIcons name="magnify" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.locationBar}>
            <MaterialCommunityIcons name="crosshairs-gps" size={16} color="#4CAF50" />
            <Text style={styles.locationText}>Showing nearest centers</Text>
            <TouchableOpacity onPress={() => setShowSearch(true)}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Filters */}
        <FlatList
          horizontal
          data={filters}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, selectedFilter === item && styles.filterChipActive]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text style={[styles.filterText, selectedFilter === item && styles.filterTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        />

        {/* Centers List */}
        <FlatList
          data={filteredCenters}
          renderItem={renderCenter}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="map-marker-off" size={48} color="#DDD" />
              <Text style={styles.emptyTitle}>No centers found</Text>
              <Text style={styles.emptyText}>Try a different filter or location</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666',
  },
  searchBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  searchBtn: {
    width: 42,
    height: 42,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  changeText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  filtersContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    minHeight: 50,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  distanceBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  distanceText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  cardAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#888',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  chip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 11,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionBtnOutlineText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});
