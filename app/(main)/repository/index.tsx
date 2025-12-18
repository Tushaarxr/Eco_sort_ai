import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Searchbar, Card, Title, Paragraph, Chip, Divider, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { COLORS } from '../../../src/styles/colors';
import { EWasteItem } from '../../../src/types';

// Hardcoded search results
const HARDCODED_ITEMS: EWasteItem[] = [
  {
    id: 'item1',
    name: 'iPhone',
    description: 'Apple smartphone with lithium battery and glass screen.',
    category: 'Smartphones',
    categoryId: 'smartphones',
    keywords: ['iphone', 'apple', 'smartphone', 'mobile'],
    materials: ['Glass', 'Aluminum', 'Lithium Battery', 'Circuit Board'],
    hazardLevel: 'Medium',
    disposalInstructions: [
      'Back up your data and perform a factory reset',
      'Remove SIM card and any memory cards',
      'Take to an electronics recycling center or Apple Store',
      'Many retailers offer trade-in programs for credit toward new devices'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 'item3',
    name: 'Laptop',
    description: 'Portable computer with screen, keyboard, and internal components.',
    category: 'Computers',
    categoryId: 'computers',
    keywords: ['laptop', 'computer', 'pc', 'notebook'],
    materials: ['Plastic', 'Aluminum', 'Lithium Battery', 'Circuit Board', 'LCD Screen'],
    hazardLevel: 'Medium',
    disposalInstructions: [
      'Back up your data and securely wipe the hard drive',
      'Remove any batteries if possible and recycle separately',
      'Take to an electronics recycling center',
      'Some manufacturers offer take-back programs'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80'
  },
  {
    id: 'item5',
    name: 'Lithium-Ion Battery',
    description: 'Rechargeable battery used in portable electronics and electric vehicles.',
    category: 'Batteries',
    categoryId: 'batteries',
    keywords: ['battery', 'lithium', 'power'],
    materials: ['Lithium', 'Cobalt', 'Nickel', 'Plastic'],
    hazardLevel: 'High',
    disposalInstructions: [
      'Never dispose of in regular trash - can cause fires',
      'Cover terminals with tape to prevent short circuits',
      'Take to a battery recycling center or hazardous waste facility',
      'Many electronics retailers offer battery recycling services'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80'
  },
  {
    id: 'item7',
    name: 'Refrigerator',
    description: 'Large appliance for cooling and preserving food.',
    category: 'Appliances',
    categoryId: 'appliances',
    keywords: ['refrigerator', 'fridge', 'appliance', 'cooling'],
    materials: ['Metal', 'Plastic', 'Refrigerant Chemicals', 'Insulation', 'Copper'],
    hazardLevel: 'High',
    disposalInstructions: [
      'Never dispose of without proper handling of refrigerants',
      'Contact your local waste management for bulk pickup',
      'Look for appliance recycling programs in your area',
      'Some retailers offer haul-away service when purchasing new appliances'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80'
  },
  {
    id: 'item9',
    name: 'USB Cables',
    description: 'Cables used to connect and charge electronic devices.',
    category: 'Cables',
    categoryId: 'cables',
    keywords: ['usb', 'cable', 'wire', 'charger'],
    materials: ['Copper', 'Plastic', 'Rubber', 'Gold Plating'],
    hazardLevel: 'Low',
    disposalInstructions: [
      'Do not dispose of in regular trash if possible',
      'Take to an electronics recycling center',
      'Some office supply stores accept cables for recycling',
      'Consider donating working cables to schools or charities'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  }
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [results, setResults] = useState<EWasteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const onSearch = async (): Promise<void> => {
    if (searchQuery.trim().length < 2) return;
    
    setLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      // Filter hardcoded items based on search query
      const searchResults = HARDCODED_ITEMS.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(item.materials) && item.materials.some(material => 
          material.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
      
      setResults(searchResults);
      setLoading(false);
    }, 500);
  };

  const renderItem = ({ item }: { item: EWasteItem }) => (
    <Card 
      style={styles.card}
      onPress={() => router.push({
        pathname: "/repository/[itemId]",
        params: { 
          itemId: item.id,
          item: JSON.stringify(item) 
        }
      })}
    >
      <Card.Cover source={{ uri: item.imageUrl }} style={styles.cardImage} />
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph numberOfLines={2}>{item.description}</Paragraph>
        
        <View style={styles.chipContainer}>
          <Chip style={styles.chip}>{item.category}</Chip>
          <Chip 
            style={[
              styles.chip,
              item.hazardLevel === 'Low' && styles.lowHazardChip,
              item.hazardLevel === 'Medium' && styles.mediumHazardChip,
              item.hazardLevel === 'High' && styles.highHazardChip,
            ]} 
            textStyle={styles.hazardChipText}
          >
            {item.hazardLevel}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search for e-waste items..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={onSearch}
        style={styles.searchbar}
        loading={loading}
      />
      
      <View style={styles.categoriesContainer}>
        <Button
          mode="contained"
          icon="shape"
          onPress={() => router.push('/repository/categories')}
          style={styles.categoriesButton}
        >
          Browse Categories
        </Button>
      </View>
      
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Paragraph>
              {searchQuery.length > 0 
                ? 'No items found. Try a different search term.' 
                : 'Search for e-waste items to learn about their disposal.'}
            </Paragraph>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoriesButton: {
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardImage: {
    height: 180,
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
  },
  lowHazardChip: {
    backgroundColor: COLORS.hazardLow,
  },
  mediumHazardChip: {
    backgroundColor: COLORS.hazardMedium,
  },
  highHazardChip: {
    backgroundColor: COLORS.hazardHigh,
  },
  hazardChipText: {
    color: '#fff',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
});
