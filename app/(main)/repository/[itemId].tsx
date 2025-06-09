import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Text, Card, List, Divider, Button, Chip } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { COLORS } from '../../../src/styles/colors';
import { EWasteItem } from '../../../src/types';

export default function ItemDetailsScreen() {
  const { itemId, item: itemParam } = useLocalSearchParams<{ itemId: string; item: string }>();
  const [itemData, setItemData] = useState<EWasteItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (itemParam) {
      try {
        setItemData(JSON.parse(itemParam));
      } catch (error) {
        console.error('Error parsing item data:', error);
      }
    } else if (itemId) {
      // If we didn't get item data directly, we'd fetch it from Firebase
      // fetchItemById(itemId);
    }
    
    setLoading(false);
  }, [itemId, itemParam]);

  const getHazardColor = (level: string): string => {
    switch (level) {
      case 'Low':
        return COLORS.hazardLow;
      case 'Medium':
        return COLORS.hazardMedium;
      case 'High':
        return COLORS.hazardHigh;
      default:
        return '#999';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!itemData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Item not found</Text>
        <Button 
          mode="contained" 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: itemData.imageUrl }} 
        style={styles.itemImage}
        resizeMode="cover"
      />
      
      <View style={styles.headerContainer}>
        <Text style={styles.itemName}>{itemData.name}</Text>
        <Chip 
          style={[styles.hazardChip, { backgroundColor: getHazardColor(itemData.hazardLevel) }]}
          textStyle={styles.hazardChipText}
        >
          {itemData.hazardLevel} Hazard
        </Chip>
      </View>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{itemData.description}</Text>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Material Composition</Text>
          <View style={styles.materialsContainer}>
            {itemData.materials.map((material, index) => (
              <Chip key={index} style={styles.materialChip}>
                {material}
              </Chip>
            ))}
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Disposal Instructions</Text>
          <List.Section>
            {itemData.disposalInstructions.map((instruction, index) => (
              <List.Item
                key={index}
                title={instruction}
                left={props => <List.Icon {...props} icon={`numeric-${index + 1}-circle`} />}
                titleNumberOfLines={3}
                style={styles.listItem}
              />
            ))}
          </List.Section>
        </Card.Content>
      </Card>
      
      <View style={styles.buttonsContainer}>
        <Button 
          mode="contained" 
          icon="map-marker"
          onPress={() => router.push('/recycling-centers')}
          style={styles.button}
        >
          Find Recycling Centers
        </Button>
        
        <Button 
          mode="outlined"
          icon="camera"
          onPress={() => router.push('/scan')}
          style={styles.button}
        >
          Scan Similar Item
        </Button>
      </View>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    marginTop: 10,
  },
  itemImage: {
    width: '100%',
    height: 250,
  },
  headerContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  itemName: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  hazardChip: {
    marginLeft: 10,
  },
  hazardChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.primary,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  divider: {
    marginVertical: 16,
  },
  materialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  materialChip: {
    margin: 4,
  },
  listItem: {
    paddingLeft: 0,
  },
  buttonsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  button: {
    marginBottom: 16,
  },
});
