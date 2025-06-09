import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Text, Card, ActivityIndicator, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getItemCategories, getItemsByCategory } from '../../api/firebaseService';
import { COLORS } from '../../styles/colors';
import { ROUTES } from '../../constants/routes';

const CategoryBrowserScreen = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await getItemCategories();
      setCategories(categoriesData);
      
      // Select first category by default
      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0]);
        fetchItemsByCategory(categoriesData[0].id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemsByCategory = async (categoryId) => {
    try {
      setLoadingItems(true);
      const itemsData = await getItemsByCategory(categoryId);
      setItems(itemsData);
    } catch (error) {
      console.error('Error fetching items by category:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchItemsByCategory(category.id);
  };

  const renderCategoryItem = ({ item }) => {
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

  const renderItem = ({ item }) => (
    <Card
      style={styles.itemCard}
      onPress={() => navigation.navigate(ROUTES.ITEM_DETAILS, { item })}
    >
      <Card.Cover source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <Card.Content>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemMaterials} numberOfLines={1}>
          Materials: {item.materials.join(', ')}
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
};

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
    backgroundColor: '#4CAF50',
  },
  mediumHazard: {
    backgroundColor: '#FFC107',
  },
  highHazard: {
    backgroundColor: '#F44336',
  },
});

export default CategoryBrowserScreen;
