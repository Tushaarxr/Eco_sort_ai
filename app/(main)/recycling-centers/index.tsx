import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Linking, Platform, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip, Divider, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS } from '../../../src/styles/colors';
import { RecyclingCenter } from '../../../src/types';

// Hardcoded recycling centers in Chennai
const CHENNAI_RECYCLING_CENTERS: RecyclingCenter[] = [
  {
    id: '1',
    name: 'Earth Sense Recycle',
    address: '15, Bazullah Rd, T. Nagar, Chennai, Tamil Nadu 600017',
    acceptsItems: ['Electronics', 'Batteries', 'Computers', 'Phones'],
    distance: 3.2,
    phoneNumber: '+91 44 4212 7070',
    website: 'https://www.earthsenserecycle.com',
    operatingHours: 'Mon-Sat: 9:00 AM - 6:00 PM',
    
  },
  {
    id: '2',
    name: 'Eco Birdd E-Waste Recyclers',
    address: 'No.1, Vellalar Street, Mogappair East, Chennai, Tamil Nadu 600037',
    acceptsItems: ['Electronics', 'Computers', 'Phones', 'Appliances'],
    distance: 7.5,
    phoneNumber: '+91 95000 55000',
    website: 'https://www.ecobirdd.com',
    operatingHours: 'Mon-Sat: 10:00 AM - 7:00 PM',
    
  },
  {
    id: '3',
    name: 'Green Era Recyclers',
    address: 'Plot No. 5, Sidco Industrial Estate, Ambattur, Chennai, Tamil Nadu 600098',
    acceptsItems: ['Electronics', 'Batteries', 'Computers', 'Phones', 'Appliances'],
    distance: 12.3,
    phoneNumber: '+91 44 2686 1010',
    website: 'https://www.greenerarecyclers.com',
    operatingHours: 'Mon-Fri: 9:00 AM - 5:30 PM, Sat: 9:00 AM - 1:00 PM',
   
  },
  {
    id: '4',
    name: 'Trishyiraya Recycling India',
    address: 'No. 53, Greams Road, Thousand Lights, Chennai, Tamil Nadu 600006',
    acceptsItems: ['Electronics', 'Batteries', 'Computers'],
    distance: 5.1,
    phoneNumber: '+91 44 2829 1765',
    operatingHours: 'Mon-Sat: 10:00 AM - 6:00 PM',
   
  },
  {
    id: '5',
    name: 'Virogreen India',
    address: 'No. 8, 1st Main Road, OMR, Thoraipakkam, Chennai, Tamil Nadu 600097',
    acceptsItems: ['Electronics', 'Batteries', 'Computers', 'Phones', 'Appliances'],
    distance: 15.7,
    phoneNumber: '+91 44 4850 0606',
    website: 'https://www.virogreen.in',
    operatingHours: 'Mon-Sat: 9:30 AM - 6:30 PM',
    
  },
  {
    id: '6',
    name: 'E-Parisaraa',
    address: 'No. 46, 2nd Floor, Nelson Manickam Road, Chennai, Tamil Nadu 600029',
    acceptsItems: ['Electronics', 'Computers', 'Phones'],
    distance: 6.8,
    phoneNumber: '+91 44 2374 1250',
    website: 'https://www.ewasteindia.com',
    operatingHours: 'Mon-Fri: 9:00 AM - 5:00 PM',
    
  },
  {
    id: '7',
    name: 'Chennai Municipal Corporation E-Waste Collection Center',
    address: 'Ripon Building, EVK Sampath Road, Chennai, Tamil Nadu 600003',
    acceptsItems: ['Electronics', 'Batteries', 'Computers', 'Phones', 'Appliances'],
    distance: 4.3,
    phoneNumber: '+91 44 2536 7853',
    operatingHours: 'Mon-Sat: 8:00 AM - 4:00 PM',
    
  }
];

export default function RecyclingCentersScreen() {
  const [centers, setCenters] = useState<RecyclingCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<RecyclingCenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  useEffect(() => {
    checkLocationPermission();
    // Use hardcoded data instead of fetching
    loadHardcodedCenters();
  }, []);

  const checkLocationPermission = async (): Promise<void> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    } catch (error) {
      console.error('Error checking location permission:', error);
      setLocationPermission(false);
    }
  };

  const loadHardcodedCenters = (): void => {
    // Simulate loading for better UX
    setTimeout(() => {
      setCenters(CHENNAI_RECYCLING_CENTERS);
      setFilteredCenters(CHENNAI_RECYCLING_CENTERS);
      setLoading(false);
    }, 1000);
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
              Location permission not granted. Showing Chennai recycling centers.
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
          <Text style={styles.loadingText}>Finding recycling centers in Chennai...</Text>
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
