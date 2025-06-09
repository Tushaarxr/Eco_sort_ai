import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Linking, Platform } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip, Divider, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getRecyclingCenters } from '../../api/firebaseService';
import { COLORS } from '../../styles/colors';

const RecyclingCentersScreen = () => {
  const [centers, setCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    checkLocationPermission();
    fetchCenters();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    } catch (error) {
      console.error('Error checking location permission:', error);
      setLocationPermission(false);
    }
  };

  const fetchCenters = async () => {
    try {
      setLoading(true);
      // Fetch all centers using a common e-waste type
      const centersData = await getRecyclingCenters('electronics');
      setCenters(centersData);
      setFilteredCenters(centersData);
    } catch (error) {
      console.error('Error fetching recycling centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const openMaps = (address) => {
    const formattedAddress = encodeURIComponent(address);
    const mapsUrl = Platform.select({
      ios: `maps:0,0?q=${formattedAddress}`,
      android: `geo:0,0?q=${formattedAddress}`,
    });
    
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

  const callCenter = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const visitWebsite = (website) => {
    Linking.openURL(website);
  };

  const onChangeSearch = (query) => {
    setSearchQuery(query);
    filterCenters(query, selectedFilter);
  };

  const filterByType = (type) => {
    setSelectedFilter(type);
    filterCenters(searchQuery, type);
  };

  const filterCenters = (query, type) => {
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

  const renderCenterItem = ({ item }) => (
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
            onPress={() => callCenter(item.phoneNumber)}
            style={styles.actionButton}
          >
            Call
          </Button>
        )}
        
        {item.website && (
          <Button 
            mode="outlined" 
            icon="web" 
            onPress={() => visitWebsite(item.website)}
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
          data={['All', 'Batteries', 'Electronics', 'Computers', 'Phones']}
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
              Location permission not granted. Showing general recycling centers.
            </Text>
            <Button 
              mode="contained" 
              onPress={checkLocationPermission}
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
          <Text style={styles.loadingText}>Finding recycling centers...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCenters}
          renderItem={renderCenterItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

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
});

export default RecyclingCentersScreen;
