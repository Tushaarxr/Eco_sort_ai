import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Chip, Button, Card } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { uploadImage, saveScanResult } from '../../../src/api/supabaseService';
import { useAuth } from '@clerk/clerk-expo';
import { useSupabase } from '../../../src/hooks/useSupabase';
import { COLORS } from '../../../src/styles/colors';
import { ScanResult } from '../../../src/types';

export default function ResultScreen() {
  const { imageUri, analysisResult: analysisParam } = useLocalSearchParams<{
    imageUri: string;
    analysisResult?: string;
  }>();
  const { userId } = useAuth();
  const supabaseClient = useSupabase();

  const hasSavedRef = useRef(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ScanResult | null>(null);
  const [savingToHistory, setSavingToHistory] = useState<boolean>(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState<boolean>(false);

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

        // Only save e-waste items to history
        if (userId && !parsedResult.saved && !hasSavedRef.current && parsedResult.isEWaste !== false) {
          hasSavedRef.current = true;
          setSavingToHistory(true);

          try {
            const imageUrl = await uploadImage(supabaseClient, userId, imageUri);
            await saveScanResult(supabaseClient, userId, { ...parsedResult, imageUrl, saved: true });
            setSavedSuccessfully(true);
          } catch (saveError) {
            console.error('Error saving to history:', saveError);
          } finally {
            setSavingToHistory(false);
          }
        }
      } catch (parseError) {
        console.error('Error parsing analysis result:', parseError);
        setError('Failed to load analysis results');
        setLoading(false);
      }
    };

    loadResults();
  }, [imageUri, analysisParam, userId]);

  const getHazardColor = (level: string | undefined) => {
    switch (level?.toLowerCase()) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const isEWaste = analysisResult?.isEWaste !== false;

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading analysis results...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={() => router.back()} style={styles.tryAgainButton}>
            Try Again
          </Button>
        </View>
      ) : (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} />

          <View style={styles.resultContainer}>
            {/* Fun Message for Non-E-Waste */}
            {!isEWaste && analysisResult?.funMessage && (
              <Card style={styles.funCard}>
                <Card.Content>
                  <Text style={styles.funEmoji}>🤖</Text>
                  <Text style={styles.funMessage}>{analysisResult.funMessage}</Text>
                  <Text style={styles.funSubtext}>
                    Detected: {analysisResult.itemType}
                  </Text>
                </Card.Content>
              </Card>
            )}

            {/* E-Waste Analysis Results */}
            {isEWaste && (
              <>
                <Text style={styles.title}>Analysis Results</Text>

                {/* Item Type */}
                <Card style={styles.card}>
                  <Card.Content>
                    <Text style={styles.cardTitle}>Identified Item</Text>
                    <Text style={styles.itemType}>
                      {analysisResult?.itemType || 'Unknown Device'}
                    </Text>
                  </Card.Content>
                </Card>

                {/* Materials */}
                {analysisResult?.materials && analysisResult.materials.length > 0 && (
                  <Card style={styles.card}>
                    <Card.Content>
                      <Text style={styles.cardTitle}>Materials</Text>
                      <View style={styles.materialsContainer}>
                        {analysisResult.materials.map((material, index) => (
                          <Chip key={index} style={styles.materialChip} textStyle={styles.chipText}>
                            {material}
                          </Chip>
                        ))}
                      </View>
                    </Card.Content>
                  </Card>
                )}

                {/* Hazard Level */}
                <Card style={styles.card}>
                  <Card.Content>
                    <Text style={styles.cardTitle}>Hazard Level</Text>
                    <View style={styles.hazardContainer}>
                      <View
                        style={[
                          styles.hazardIndicator,
                          { backgroundColor: getHazardColor(analysisResult?.hazardLevel) }
                        ]}
                      />
                      <Text style={[styles.hazardText, { color: getHazardColor(analysisResult?.hazardLevel) }]}>
                        {analysisResult?.hazardLevel?.toUpperCase() || 'UNKNOWN'}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>

                {/* Disposal Method */}
                <Card style={styles.card}>
                  <Card.Content>
                    <Text style={styles.cardTitle}>Disposal Recommendation</Text>
                    <Text style={styles.disposalText}>
                      {analysisResult?.disposalMethod || 'Take to a certified e-waste recycling center.'}
                    </Text>
                  </Card.Content>
                </Card>

                {/* Recycling Value */}
                {analysisResult?.recyclingValue && (
                  <Card style={styles.card}>
                    <Card.Content>
                      <Text style={styles.cardTitle}>♻️ Recycling Value</Text>
                      <Text style={styles.disposalText}>
                        {analysisResult.recyclingValue}
                      </Text>
                    </Card.Content>
                  </Card>
                )}

                {/* Data Security Risk Warning */}
                {analysisResult?.dataSecurityRisk && (
                  <Card style={[styles.card, styles.securityCard]}>
                    <Card.Content>
                      <Text style={styles.securityTitle}>🔒 Data Security Risk</Text>
                      <Text style={styles.securityText}>
                        This device may contain personal data. Ensure all data is securely wiped before disposal.
                      </Text>
                    </Card.Content>
                  </Card>
                )}

                {/* Confidence Warning */}
                {analysisResult?.confidence === 'low' && (
                  <Card style={[styles.card, styles.warningCard]}>
                    <Card.Content>
                      <Text style={styles.warningText}>
                        ⚠️ Low confidence analysis. Results may not be accurate.
                      </Text>
                    </Card.Content>
                  </Card>
                )}

                {/* Save Status */}
                {savingToHistory && (
                  <View style={styles.savingContainer}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.savingText}>Saving to your history...</Text>
                  </View>
                )}

                {savedSuccessfully && (
                  <View style={styles.savedContainer}>
                    <Text style={styles.savedText}>✓ Saved to your scan history</Text>
                  </View>
                )}

                <Button
                  mode="contained"
                  onPress={() => router.push({
                    pathname: '/(main)/recycling-centers',
                    params: { itemType: analysisResult?.itemType || 'electronics' }
                  })}
                  style={styles.guideButton}
                  icon="recycle"
                >
                  Find Recycling Centers
                </Button>
              </>
            )}

            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={styles.scanAgainButton}
              icon="camera"
            >
              Scan Another Item
            </Button>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#F44336',
  },
  tryAgainButton: {
    marginTop: 16,
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  resultContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.primary,
  },
  // Fun message styles
  funCard: {
    marginBottom: 16,
    backgroundColor: '#FFF8E1',
    elevation: 3,
  },
  funEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 12,
  },
  funMessage: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    lineHeight: 26,
    marginBottom: 12,
  },
  funSubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  // Regular card styles
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  itemType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  materialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  materialChip: {
    marginBottom: 4,
  },
  chipText: {
    fontSize: 12,
  },
  hazardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hazardIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  hazardText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  disposalText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
  },
  securityCard: {
    backgroundColor: '#FFEBEE',
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#C62828',
  },
  warningCard: {
    backgroundColor: '#FFF3E0',
  },
  warningText: {
    color: '#E65100',
    fontSize: 14,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  savingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  savedContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  savedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  guideButton: {
    marginTop: 16,
    marginBottom: 12,
  },
  scanAgainButton: {
    marginBottom: 24,
  },
});
