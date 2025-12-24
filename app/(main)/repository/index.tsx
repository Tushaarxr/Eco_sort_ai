import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, SafeAreaView, StatusBar } from 'react-native';
import { Searchbar, Text, ActivityIndicator, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../src/styles/colors';
import { getEWasteItems, EWasteItemDB } from '../../../src/api/supabaseService';

const getCategoryIcon = (category: string): string => {
  const cat = category.toLowerCase();
  if (cat.includes('phone') || cat.includes('smartphone')) return 'cellphone';
  if (cat.includes('computer')) return 'laptop';
  if (cat.includes('batter')) return 'battery';
  if (cat.includes('appliance')) return 'fridge';
  if (cat.includes('tv') || cat.includes('audio')) return 'television';
  if (cat.includes('cable') || cat.includes('charger')) return 'usb';
  if (cat.includes('printer')) return 'printer';
  if (cat.includes('gaming')) return 'gamepad-variant';
  if (cat.includes('camera')) return 'camera';
  if (cat.includes('wearable')) return 'watch';
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

export default function RepositoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allItems, setAllItems] = useState<EWasteItemDB[]>([]);
  const [displayedItems, setDisplayedItems] = useState<EWasteItemDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const items = await getEWasteItems();
      setAllItems(items);
      setDisplayedItems(items);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const onSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setDisplayedItems(allItems);
      return;
    }

    const q = query.toLowerCase();
    const results = allItems.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keywords.some(k => k.toLowerCase().includes(q))
    );
    setDisplayedItems(results);
  };

  const navigateToItem = (item: EWasteItemDB) => {
    router.push({
      pathname: "/repository/[itemId]",
      params: { itemId: item.id, item: JSON.stringify(item) }
    });
  };

  const renderItem = ({ item }: { item: EWasteItemDB }) => {
    const hazard = getHazardStyle(item.hazardLevel);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigateToItem(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardIcon}>
          <MaterialCommunityIcons
            name={getCategoryIcon(item.category) as any}
            size={28}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardCategory}>{item.category}</Text>
          <View style={styles.cardMeta}>
            <View style={[styles.hazardTag, { backgroundColor: hazard.bg }]}>
              <Text style={[styles.hazardText, { color: hazard.color }]}>
                {item.hazardLevel}
              </Text>
            </View>
            <Text style={styles.materialsText} numberOfLines={1}>
              {item.materials.slice(0, 2).join(' · ')}
            </Text>
          </View>
        </View>

        <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading guides...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={onSearch}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
            iconColor="#999"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/repository/categories')}
          >
            <MaterialCommunityIcons name="view-grid" size={18} color={COLORS.primary} />
            <Text style={styles.actionText}>Categories</Text>
          </TouchableOpacity>

          <View style={styles.resultCount}>
            <Text style={styles.resultText}>{displayedItems.length} items</Text>
          </View>
        </View>

        {/* Items List */}
        <FlatList
          data={displayedItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="magnify" size={48} color="#DDD" />
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptyText}>Try a different search term</Text>
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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    height: 44,
  },
  searchInput: {
    fontSize: 15,
    minHeight: 44,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F0F8F0',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primary,
  },
  resultCount: {
    paddingVertical: 4,
  },
  resultText: {
    fontSize: 13,
    color: '#999',
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  cardCategory: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hazardTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  hazardText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  materialsText: {
    fontSize: 12,
    color: '#AAA',
    flex: 1,
  },
  separator: {
    height: 10,
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
