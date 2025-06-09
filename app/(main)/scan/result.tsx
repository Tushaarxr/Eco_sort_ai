import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Text, Chip, Button } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { uploadImage, saveScanResult } from '../../../src/api/firebaseService';
import { useAuth } from '../../../src/hooks/useAuth';
import { COLORS } from '../../../src/styles/colors';
import { ScanResult } from '../../../src/types';

export default function ResultScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ScanResult | null>(null);
  
  useEffect(() => {
    // Simulate loading for a more realistic experience
    setTimeout(() => {
      if (!imageUri) {
        setError('No image provided');
        setLoading(false);
        return;
      }
      
      // Hardcoded analysis result
      const hardcodedResult: ScanResult = {
        itemType: "Smartphone",
        materials: ["Plastic", "Glass", "Lithium Battery", "Circuit Board", "Copper", "Aluminum"],
        hazardLevel: "Medium",
        disposalMethod: "Take to an electronics recycling center or return to manufacturer through a take-back program."
      };
      
      setAnalysisResult(hardcodedResult);
      setLoading(false);
      
      // Optionally save to Firebase if needed
      if (user) {
        uploadImage(user.uid, imageUri)
          .then(imageUrl => saveScanResult(user.uid, { ...hardcodedResult, imageUrl }))
          .catch(err => console.error('Error saving to Firebase:', err));
      }
    }, 1500); // Simulate 1.5 seconds of "analysis"
  }, [imageUri, user]);

  // Render analysis results
  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Analyzing your e-waste item...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={() => router.back()}
            style={styles.tryAgainButton}
          >
            Try Again
          </Button>
        </View>
      ) : (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <View style={styles.resultContainer}>
            <Text style={styles.title}>Analysis Results</Text>
            
            <View style={styles.itemContainer}>
              <Text style={styles.itemLabel}>Item Type:</Text>
              <Text style={styles.itemValue}>{analysisResult?.itemType || analysisResult?.type}</Text>
            </View>
            
            <View style={styles.itemContainer}>
              <Text style={styles.itemLabel}>Materials:</Text>
              <Text style={styles.itemValue}>
                {Array.isArray(analysisResult?.materials) 
                  ? analysisResult?.materials.join(', ') 
                  : analysisResult?.materials}
              </Text>
            </View>
            
            <View style={styles.itemContainer}>
              <Text style={styles.itemLabel}>Hazard Level:</Text>
              <Chip 
                mode="outlined" 
                style={[
                  styles.hazardChip,
                  analysisResult?.hazardLevel === 'Low' && styles.lowHazard,
                  analysisResult?.hazardLevel === 'Medium' && styles.mediumHazard,
                  analysisResult?.hazardLevel === 'High' && styles.highHazard,
                ]}
                textStyle={styles.hazardChipText}
              >
                {analysisResult?.hazardLevel}
              </Chip>
            </View>
            
            <Button
              mode="contained"
              onPress={() => router.push({
                pathname: '/scan/disposal-guide',
                params: { itemData: JSON.stringify(analysisResult) }
              })}
              style={styles.guideButton}
              icon="information"
            >
              View Disposal Guide
            </Button>
            
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
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
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
    color: COLORS.error,
  },
  tryAgainButton: {
    marginTop: 16,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  resultContainer: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.primary,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 100,
  },
  itemValue: {
    fontSize: 16,
    flex: 1,
  },
  hazardChip: {
    backgroundColor: '#eee',
  },
  hazardChipText: {
    fontWeight: 'bold',
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
  guideButton: {
    marginTop: 20,
    marginBottom: 10,
  },
  scanAgainButton: {
    marginBottom: 20,
  },
});
