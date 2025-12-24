import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { uploadImage, saveScanResult } from '../../../src/api/supabaseService';
import { useAuth } from '@clerk/clerk-expo';
import { useSupabase } from '../../../src/hooks/useSupabase';
import { COLORS } from '../../../src/styles/colors';
import { ScanResult } from '../../../src/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ResultScreen() {
  const { imageUri, analysisResult: analysisParam } = useLocalSearchParams<{
    imageUri: string;
    analysisResult?: string;
  }>();
  const { userId } = useAuth();
  const supabaseClient = useSupabase();

  const hasSavedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ScanResult | null>(null);
  const [savingToHistory, setSavingToHistory] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      if (!imageUri) {
        setError('No image provided');
        setLoading(false);
        return;
      }

      if (!analysisParam) {
        setError('No analysis data provided');
        setLoading(false);
        return;
      }

      try {
        const parsedResult: ScanResult = JSON.parse(analysisParam);
        setAnalysisResult(parsedResult);
        setLoading(false);

        if (userId && !parsedResult.saved && !hasSavedRef.current && parsedResult.isEWaste !== false) {
          hasSavedRef.current = true;
          setSavingToHistory(true);

          try {
            const imageUrl = await uploadImage(supabaseClient, userId, imageUri);
            await saveScanResult(supabaseClient, userId, { ...parsedResult, imageUrl, saved: true });
            setSavedSuccessfully(true);
          } catch (saveError) {
            console.error('Error saving:', saveError);
          } finally {
            setSavingToHistory(false);
          }
        }
      } catch (parseError) {
        setError('Failed to load results');
        setLoading(false);
      }
    };

    loadResults();
  }, [imageUri, analysisParam, userId]);

  const getHazardStyle = (level: string | undefined) => {
    switch (level?.toLowerCase()) {
      case 'low': return { bg: '#E8F5E9', color: '#2E7D32', icon: 'shield-check' };
      case 'medium': return { bg: '#FFF3E0', color: '#E65100', icon: 'alert-circle' };
      case 'high': return { bg: '#FFEBEE', color: '#C62828', icon: 'alert' };
      default: return { bg: '#F5F5F5', color: '#666', icon: 'help-circle' };
    }
  };

  const isEWaste = analysisResult?.isEWaste !== false;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#CCC" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image */}
      <Image source={{ uri: imageUri }} style={styles.image} />

      <View style={styles.content}>
        {/* Non E-Waste Fun Message */}
        {!isEWaste && analysisResult?.funMessage && (
          <View style={styles.funBox}>
            <Text style={styles.funEmoji}>🤖</Text>
            <Text style={styles.funMessage}>{analysisResult.funMessage}</Text>
            <Text style={styles.funDetected}>Detected: {analysisResult.itemType}</Text>
          </View>
        )}

        {/* E-Waste Results */}
        {isEWaste && (
          <>
            {/* Item Name */}
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{analysisResult?.itemType || 'Unknown Device'}</Text>
              {savedSuccessfully && (
                <View style={styles.savedBadge}>
                  <MaterialCommunityIcons name="check" size={12} color="#4CAF50" />
                  <Text style={styles.savedBadgeText}>Saved</Text>
                </View>
              )}
            </View>

            {/* Hazard Level */}
            {analysisResult?.hazardLevel && (
              <View style={[styles.section, styles.hazardSection, { backgroundColor: getHazardStyle(analysisResult.hazardLevel).bg }]}>
                <MaterialCommunityIcons
                  name={getHazardStyle(analysisResult.hazardLevel).icon as any}
                  size={20}
                  color={getHazardStyle(analysisResult.hazardLevel).color}
                />
                <Text style={[styles.hazardText, { color: getHazardStyle(analysisResult.hazardLevel).color }]}>
                  {analysisResult.hazardLevel} Hazard
                </Text>
              </View>
            )}

            {/* Materials */}
            {analysisResult?.materials && analysisResult.materials.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Materials</Text>
                <View style={styles.chipsRow}>
                  {analysisResult.materials.map((m, i) => (
                    <View key={i} style={styles.chip}>
                      <Text style={styles.chipText}>{m}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Disposal */}
            {analysisResult?.disposalMethod && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Disposal</Text>
                <Text style={styles.sectionText}>{analysisResult.disposalMethod}</Text>
              </View>
            )}

            {/* Recycling Value */}
            {analysisResult?.recyclingValue && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recycling Value</Text>
                <Text style={styles.sectionText}>{analysisResult.recyclingValue}</Text>
              </View>
            )}

            {/* Data Security Warning */}
            {analysisResult?.dataSecurityRisk && (
              <View style={[styles.section, styles.warningBox]}>
                <MaterialCommunityIcons name="lock" size={18} color="#C62828" />
                <Text style={styles.warningText}>
                  Contains personal data. Wipe before disposal.
                </Text>
              </View>
            )}

            {/* Low Confidence Warning */}
            {analysisResult?.confidence === 'low' && (
              <View style={[styles.section, styles.cautionBox]}>
                <Text style={styles.cautionText}>⚠️ Low confidence analysis</Text>
              </View>
            )}

            {/* Saving Indicator */}
            {savingToHistory && (
              <View style={styles.savingRow}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.savingText}>Saving...</Text>
              </View>
            )}
          </>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {isEWaste && (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.push('/(main)/recycling-centers')}
            >
              <MaterialCommunityIcons name="map-marker" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Find Recycling Centers</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()}>
            <MaterialCommunityIcons name="camera" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryBtnText}>Scan Another</Text>
          </TouchableOpacity>
        </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666',
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
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: '#E0E0E0',
  },
  content: {
    padding: 20,
  },
  // Non e-waste
  funBox: {
    backgroundColor: '#FFF8E1',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  funEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  funMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    lineHeight: 24,
  },
  funDetected: {
    fontSize: 13,
    color: '#888',
    marginTop: 12,
    fontStyle: 'italic',
  },
  // E-waste results
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savedBadgeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  hazardSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 0,
  },
  hazardText: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 13,
    color: '#555',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#C62828',
  },
  cautionBox: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFE0B2',
  },
  cautionText: {
    fontSize: 13,
    color: '#E65100',
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  savingText: {
    fontSize: 13,
    color: '#888',
  },
  actions: {
    marginTop: 12,
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
