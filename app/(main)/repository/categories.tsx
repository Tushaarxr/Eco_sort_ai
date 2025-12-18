import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Text, Card, ActivityIndicator, Surface } from 'react-native-paper';
import { router } from 'expo-router';
import { COLORS } from '../../../src/styles/colors';
import { Category, EWasteItem } from '../../../src/types';

// Hardcoded categories
const HARDCODED_CATEGORIES: Category[] = [
  {
    id: 'cat1',
    name: 'Smartphones',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/545/545245.png'
  },
  {
    id: 'cat2',
    name: 'Computers',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3474/3474360.png'
  },
  {
    id: 'cat3',
    name: 'Batteries',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/664/664883.png'
  },
  {
    id: 'cat4',
    name: 'Appliances',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2553/2553628.png'
  },
  {
    id: 'cat5',
    name: 'Cables',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2909/2909508.png'
  }
];

// Hardcoded items by category
const HARDCODED_ITEMS: Record<string, EWasteItem[]> = {
  'cat1': [
    {
      id: 'item1',
      name: 'iPhone',
      description: 'Apple smartphone with lithium battery and glass screen.',
      category: 'Smartphones',
      categoryId: 'cat1',
      materials: ['Glass', 'Aluminum', 'Lithium Battery', 'Circuit Board'],
      hazardLevel: 'Medium',
      disposalInstructions: [
        'Back up your data and perform a factory reset',
        'Remove SIM card and any memory cards',
        'Take to an electronics recycling center or Apple Store',
        'Many retailers offer trade-in programs for credit toward new devices'
      ],
      keywords: ['iphone', 'smartphone', 'apple', 'mobile', 'cell phone'],
      imageUrl: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 'item2',
      name: 'Samsung Galaxy',
      description: 'Android smartphone with OLED display and removable components.',
      category: 'Smartphones',
      categoryId: 'cat1',
      materials: ['Plastic', 'Glass', 'Lithium Battery', 'Circuit Board'],
      hazardLevel: 'Medium',
      disposalInstructions: [
        'Back up your data and perform a factory reset',
        'Remove SIM card and any memory cards',
        'Take to an electronics recycling center or Samsung Store',
        'Check if your local municipality has e-waste collection events'
      ],
      keywords: ['samsung', 'galaxy', 'android', 'smartphone', 'mobile'],
      imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80'
    }
  ],
  'cat2': [
    {
      id: 'item3',
      name: 'Laptop',
      description: 'Portable computer with screen, keyboard, and internal components.',
      category: 'Computers',
      categoryId: 'cat2',
      materials: ['Plastic', 'Aluminum', 'Lithium Battery', 'Circuit Board', 'LCD Screen'],
      hazardLevel: 'Medium',
      disposalInstructions: [
        'Back up your data and securely wipe the hard drive',
        'Remove any batteries if possible and recycle separately',
        'Take to an electronics recycling center',
        'Some manufacturers offer take-back programs'
      ],
      keywords: ['laptop', 'notebook', 'computer', 'portable', 'battery'],
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80'
    },
    {
      id: 'item4',
      name: 'Desktop Computer',
      description: 'Full-sized computer with separate components and peripherals.',
      category: 'Computers',
      categoryId: 'cat2',
      materials: ['Plastic', 'Metal', 'Circuit Board', 'Wiring'],
      hazardLevel: 'Medium',
      disposalInstructions: [
        'Back up your data and securely wipe all storage devices',
        'Disassemble into main components if possible',
        'Take to an electronics recycling center',
        'Some parts may be valuable for scrap metal recycling'
      ],
      keywords: ['desktop', 'pc', 'computer', 'tower', 'workstation'],
      imageUrl: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    }
  ],
  'cat3': [
    {
      id: 'item5',
      name: 'Lithium-Ion Battery',
      description: 'Rechargeable battery used in portable electronics and electric vehicles.',
      category: 'Batteries',
      categoryId: 'cat3',
      materials: ['Lithium', 'Cobalt', 'Nickel', 'Plastic'],
      hazardLevel: 'High',
      disposalInstructions: [
        'Never dispose of in regular trash - can cause fires',
        'Cover terminals with tape to prevent short circuits',
        'Take to a battery recycling center or hazardous waste facility',
        'Many electronics retailers offer battery recycling services'
      ],
      keywords: ['battery', 'lithium-ion', 'rechargeable', 'power', 'cells'],
      imageUrl: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80'
    },
    {
      id: 'item6',
      name: 'Alkaline Battery',
      description: 'Common single-use battery used in household devices.',
      category: 'Batteries',
      categoryId: 'cat3',
      materials: ['Zinc', 'Manganese Dioxide', 'Potassium Hydroxide', 'Steel'],
      hazardLevel: 'Low',
      disposalInstructions: [
        'In some regions, alkaline batteries can go in regular trash',
        'Check local regulations as rules vary by location',
        'Prefer to take to battery recycling drop-off points',
        'Consider switching to rechargeable alternatives'
      ],
      keywords: ['battery', 'alkaline', 'single-use', 'household', 'AA', 'AAA'],
      imageUrl: 'https://images.unsplash.com/photo-1612958789638-e129f4bf31fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    }
  ],
  'cat4': [
    {
      id: 'item7',
      name: 'Refrigerator',
      description: 'Large appliance for cooling and preserving food.',
      category: 'Appliances',
      categoryId: 'cat4',
      materials: ['Metal', 'Plastic', 'Refrigerant Chemicals', 'Insulation', 'Copper'],
      hazardLevel: 'High',
      disposalInstructions: [
        'Never dispose of without proper handling of refrigerants',
        'Contact your local waste management for bulk pickup',
        'Look for appliance recycling programs in your area',
        'Some retailers offer haul-away service when purchasing new appliances'
      ],
      keywords: ['appliance', 'fridge', 'refrigerator', 'cooling', 'freon'],
      imageUrl: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80'
    },
    {
      id: 'item8',
      name: 'Microwave Oven',
      description: 'Kitchen appliance that cooks food using electromagnetic radiation.',
      category: 'Appliances',
      categoryId: 'cat4',
      materials: ['Metal', 'Plastic', 'Circuit Board', 'Glass', 'Wiring'],
      hazardLevel: 'Medium',
      disposalInstructions: [
        'Never dispose of in regular trash due to electronic components',
        'Take to an electronics recycling center',
        'Some retailers and manufacturers offer take-back programs',
        'Check if your local waste management offers special collection'
      ],
      keywords: ['appliance', 'microwave', 'oven', 'kitchen', 'electronics'],
      imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1976&q=80'
    }
  ],
  'cat5': [
    {
      id: 'item9',
      name: 'USB Cables',
      description: 'Cables used to connect and charge electronic devices.',
      category: 'Cables',
      categoryId: 'cat5',
      materials: ['Copper', 'Plastic', 'Rubber', 'Gold Plating'],
      hazardLevel: 'Low',
      disposalInstructions: [
        'Do not dispose of in regular trash if possible',
        'Take to an electronics recycling center',
        'Some office supply stores accept cables for recycling',
        'Consider donating working cables to schools or charities'
      ],
      keywords: ['cable', 'usb', 'charging', 'data cable', 'connector'],
      imageUrl: 'https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 'item10',
      name: 'Power Cords',
      description: 'Cables that connect devices to power outlets.',
      category: 'Cables',
      categoryId: 'cat5',
      materials: ['Copper', 'Plastic', 'Rubber', 'PVC'],
      hazardLevel: 'Low',
      disposalInstructions: [
        'Do not dispose of in regular trash if possible',
        'Take to an electronics recycling center',
        'Cut cords from unusable appliances before disposal',
        'Some scrap metal recyclers accept power cords for their copper content'
      ],
      keywords: ['cable', 'power cord', 'ac cable', 'plug', 'wire'],
      imageUrl: 'https://images.unsplash.com/photo-1601524909162-ae8725290836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80'
    }
  ]
};

export default function CategoryBrowserScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<EWasteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);

  useEffect(() => {
    // Simulate loading for better UX
    setTimeout(() => {
      fetchHardcodedCategories();
    }, 1000);
  }, []);

  const fetchHardcodedCategories = (): void => {
    try {
      setLoading(true);
      // Use hardcoded categories
      setCategories(HARDCODED_CATEGORIES);
      
      // Select first category by default
      if (HARDCODED_CATEGORIES.length > 0) {
        setSelectedCategory(HARDCODED_CATEGORIES[0]);
        fetchHardcodedItemsByCategory(HARDCODED_CATEGORIES[0].id);
      }
    } catch (error) {
      console.error('Error setting hardcoded categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHardcodedItemsByCategory = (categoryId: string): void => {
    try {
      setLoadingItems(true);
      // Simulate network delay
      setTimeout(() => {
        // Get items for the selected category
        const itemsData = HARDCODED_ITEMS[categoryId] || [];
        setItems(itemsData);
        setLoadingItems(false);
      }, 500);
    } catch (error) {
      console.error('Error setting hardcoded items:', error);
      setLoadingItems(false);
    }
  };

  const handleCategorySelect = (category: Category): void => {
    setSelectedCategory(category);
    fetchHardcodedItemsByCategory(category.id);
  };

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory && item.id === selectedCategory.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          isSelected && styles.selectedCategoryItem
        ]}
        onPress={() => handleCategorySelect(item)}
      >
        <Image
          source={{ uri: item.iconUrl }}
          style={styles.categoryIcon}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.categoryName,
            isSelected && styles.selectedCategoryName
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: EWasteItem }) => (
    <Card
      style={styles.itemCard}
      onPress={() => router.push({
        pathname: "/repository/[itemId]",
        params: { 
          itemId: item.id,
          item: JSON.stringify(item) 
        }
      })}
    >
      <Card.Cover source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <Card.Content>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemMaterials} numberOfLines={1}>
          Materials: {Array.isArray(item.materials) ? item.materials.join(', ') : item.materials}
        </Text>
        <View style={styles.hazardContainer}>
          <Text>Hazard Level: </Text>
          <Surface style={[
            styles.hazardBadge,
            item.hazardLevel === 'Low' && styles.lowHazard,
            item.hazardLevel === 'Medium' && styles.mediumHazard,
            item.hazardLevel === 'High' && styles.highHazard,
          ]}>
            <Text style={styles.hazardText}>{item.hazardLevel}</Text>
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />
      
      <View style={styles.itemsContainer}>
        <Text style={styles.sectionTitle}>
          {selectedCategory ? selectedCategory.name : 'Items'}
        </Text>
        
        {loadingItems ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.itemsList}
            numColumns={2}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  categoriesList: {
    padding: 16,
    backgroundColor: '#fff',
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  selectedCategoryItem: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
  },
  selectedCategoryName: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  itemsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemsList: {
    paddingBottom: 16,
  },
  itemCard: {
    flex: 1,
    margin: 8,
    maxWidth: '46%',
  },
  itemImage: {
    height: 120,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  itemMaterials: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  hazardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  hazardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hazardText: {
    fontSize: 12,
    color: '#fff',
  },
  lowHazard: {
    backgroundColor: COLORS.hazardLow,
  },
  mediumHazard: {
    backgroundColor: COLORS.hazardMedium,
  },
  highHazard: {
    backgroundColor: COLORS.hazardHigh,
  },
});
