import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../src/styles/colors';
import { getEWasteCategories, getEWasteItemsByCategory, EWasteItemDB } from '../../../src/api/supabaseService';

interface CategoryData {
  id: string;
  name: string;
  count: number;
  icon: string;
}

const getCategoryIcon = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('phone') || n.includes('smartphone')) return 'cellphone';
  if (n.includes('computer')) return 'laptop';
  if (n.includes('batter')) return 'battery';
  if (n.includes('appliance')) return 'fridge';
  if (n.includes('tv') || n.includes('audio')) return 'television';
  if (n.includes('cable') || n.includes('charger')) return 'usb';
  if (n.includes('printer')) return 'printer';
  if (n.includes('gaming')) return 'gamepad-variant';
  if (n.includes('camera')) return 'camera';
  if (n.includes('wearable')) return 'watch';
  return 'chip';
};

const getHazardStyle = (level: string) => {
  switch (level.toLowerCase()) {
    case 'low': return { bg: '#E8F5E9', color: '#2E7D32' };
    case 'medium': return { bg: '#FFF3E0', color: '#E65100' };
    case 'high': return { bg: '#FFEBEE', color: '#C62828' };
    default: return { bg: '#F5F5F5', color: '#666' };
  }
};

const { width } = Dimensions.get('window');
const GRID_GAP = 12;
const CARD_WIDTH = (width - 48 - GRID_GAP) / 2;

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [items, setItems] = useState<EWasteItemDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await getEWasteCategories();
      const data = cats.map(c => ({
        ...c,
        icon: getCategoryIcon(c.name)
      }));
      setCategories(data);

      if (data.length > 0) {
        selectCategory(data[0]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = async (category: CategoryData) => {
    setSelectedCategory(category);
    setLoadingItems(true);

    try {
      const items = await getEWasteItemsByCategory(category.id);
      setItems(items);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const navigateToItem = (item: EWasteItemDB) => {
    router.push({
      pathname: "/repository/[itemId]",
      params: { itemId: item.id, item: JSON.stringify(item) }
    });
  };

  const renderCategory = ({ item }: { item: CategoryData }) => {
    const isActive = selectedCategory?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.categoryTab, isActive && styles.categoryTabActive]}
        onPress={() => selectCategory(item)}
      >
        <MaterialCommunityIcons
          name={item.icon as any}
          size={18}
          color={isActive ? COLORS.primary : '#888'}
        />
        <Text style={[styles.categoryName, isActive && styles.categoryNameActive]} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: EWasteItemDB }) => {
    const hazard = getHazardStyle(item.hazardLevel);

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => navigateToItem(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemIcon}>
          <MaterialCommunityIcons
            name={getCategoryIcon(item.category) as any}
            size={24}
            color={COLORS.primary}
          />
        </View>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <View style={[styles.hazardBadge, { backgroundColor: hazard.bg }]}>
          <Text style={[styles.hazardText, { color: hazard.color }]}>{item.hazardLevel}</Text>
        </View>
      </TouchableOpacity>
    );
  };

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
      {/* Category Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsList}
        />
      </View>

      {/* Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{selectedCategory?.name || 'Items'}</Text>
        <Text style={styles.itemCount}>{items.length} items</Text>
      </View>

      {/* Items Grid */}
      {loadingItems ? (
        <View style={styles.itemsLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="package-variant" size={48} color="#DDD" />
              <Text style={styles.emptyText}>No items in this category</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: '#E8F5E9',
  },
  categoryName: {
    fontSize: 13,
    color: '#666',
  },
  categoryNameActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  itemCount: {
    fontSize: 13,
    color: '#999',
  },
  itemsLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  gridRow: {
    gap: GRID_GAP,
  },
  itemCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: GRID_GAP,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    minHeight: 36,
  },
  hazardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  hazardText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#999',
  },
});
