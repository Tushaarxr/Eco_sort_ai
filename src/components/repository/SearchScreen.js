// src/components/repository/SearchScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Searchbar, Card, Title, Paragraph, Chip, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { searchEWasteDatabase } from '../../api/firebaseService';
import { COLORS } from '../../styles/colors';
import { ROUTES } from '../../constants/routes';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const onSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    
    setLoading(true);
    try {
      const searchResults = await searchEWasteDatabase(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <Card 
      style={styles.card}
      onPress={() => navigation.navigate(ROUTES.ITEM_DETAILS, { item })}
    >
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph numberOfLines={2}>{item.description}</Paragraph>
        
        <View style={styles.chipContainer}>
          <Chip style={styles.chip}>{item.category}</Chip>
          <Chip style={styles.chip} mode="outlined">{item.hazardLevel}</Chip>
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
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default SearchScreen;
