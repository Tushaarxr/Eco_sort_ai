import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Chip, Button } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../src/styles/colors';
import { EWasteItemDB } from '../../../src/api/supabaseService';

export default function ItemDetailsScreen() {
  const { itemId, item: itemParam } = useLocalSearchParams<{ itemId: string; item: string }>();
  const [itemData, setItemData] = useState<EWasteItemDB | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (itemParam) {
      try {
        setItemData(JSON.parse(itemParam));
      } catch (error) {
        console.error('Error parsing item:', error);
      }
    }
    setLoading(false);
  }, [itemParam]);

  const getHazardStyle = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return { bg: '#E8F5E9', color: '#2E7D32', icon: 'shield-check' };
      case 'medium': return { bg: '#FFF3E0', color: '#E65100', icon: 'alert-circle' };
      case 'high': return { bg: '#FFEBEE', color: '#C62828', icon: 'alert' };
      default: return { bg: '#F5F5F5', color: '#666', icon: 'help-circle' };
    }
  };

  const getCategoryIcon = (category: string): string => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('phone')) return 'cellphone';
    if (cat.includes('computer')) return 'laptop';
    if (cat.includes('batter')) return 'battery';
    if (cat.includes('appliance')) return 'fridge';
    if (cat.includes('tv') || cat.includes('audio')) return 'television';
    if (cat.includes('cable')) return 'usb';
    if (cat.includes('printer')) return 'printer';
    if (cat.includes('gaming')) return 'gamepad-variant';
    if (cat.includes('camera')) return 'camera';
    if (cat.includes('wearable')) return 'watch';
    return 'chip';
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
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#CCC" />
        <Text style={styles.errorText}>Item not found</Text>
        <Button mode="contained" onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  const hazard = getHazardStyle(itemData.hazardLevel);
  const materials = Array.isArray(itemData.materials) ? itemData.materials : [];
  const instructions = Array.isArray(itemData.disposalInstructions) ? itemData.disposalInstructions : [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={getCategoryIcon(itemData.category) as any} size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>{itemData.name}</Text>
        <Text style={styles.category}>{itemData.category}</Text>

        <View style={[styles.hazardBadge, { backgroundColor: hazard.bg }]}>
          <MaterialCommunityIcons name={hazard.icon as any} size={16} color={hazard.color} />
          <Text style={[styles.hazardText, { color: hazard.color }]}>{itemData.hazardLevel} Hazard</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{itemData.description}</Text>
      </View>

      {/* Materials */}
      {materials.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materials</Text>
          <View style={styles.materialsGrid}>
            {materials.map((material, idx) => (
              <View key={idx} style={styles.materialChip}>
                <Text style={styles.materialText}>{material}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Disposal Instructions */}
      {instructions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disposal Steps</Text>
          {instructions.map((step, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      {/* High Hazard Warning */}
      {itemData.hazardLevel?.toLowerCase() === 'high' && (
        <View style={styles.warningBox}>
          <MaterialCommunityIcons name="alert" size={20} color="#C62828" />
          <Text style={styles.warningText}>
            Contains hazardous materials. Use certified e-waste recyclers only.
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(main)/recycling-centers')}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#fff" />
          <Text style={styles.primaryBtnText}>Find Recycling Centers</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(main)/scan')}>
          <MaterialCommunityIcons name="camera" size={18} color={COLORS.primary} />
          <Text style={styles.secondaryBtnText}>Scan Another Item</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FAFAFA',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  category: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  hazardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 16,
  },
  hazardText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
  },
  materialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  materialChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  materialText: {
    fontSize: 13,
    color: '#555',
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    margin: 16,
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#C62828',
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
});
