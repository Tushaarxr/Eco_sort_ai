// src/components/scanning/ResultScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Chip, Button } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { analyzeEWasteImage } from '../../api/geminiService';
import { uploadImage, saveScanResult } from '../../api/firebaseService';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../styles/colors';
import { ROUTES } from '../../constants/routes';

const ResultScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { imageUri } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  useEffect(() => {
    analyzeImage();
  }, []);

  const analyzeImage = async () => {
    try {
      setLoading(true);
      
      // Convert image to base64
      const base64Image = await uriToBase64(imageUri);
      
      // Analyze with Gemini
      const result = await analyzeEWasteImage(base64Image);
      
      // Parse the result
      let parsedResult;
      try {
        parsedResult = JSON.parse(result);
      } catch (e) {
        parsedResult = { 
          itemType: 'Unknown Item',
          materials: 'Unknown Materials',
          hazardLevel: 'Unknown',
          disposalMethod: result
        };
      }
      
      setAnalysisResult(parsedResult);
      
      // Save results to Firebase
      const imageUrl = await uploadImage(user.uid, imageUri);
      await saveScanResult(user.uid, { ...parsedResult, imageUrl });
      
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert URI to base64
  const uriToBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Render analysis results
  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <View style={styles.resultContainer}>
            <Text style={styles.title}>Analysis Results</Text>
            
            <View style={styles.itemContainer}>
              <Text style={styles.itemLabel}>Item Type:</Text>
              <Text style={styles.itemValue}>{analysisResult?.itemType}</Text>
            </View>
            
            <View style={styles.itemContainer}>
              <Text style={styles.itemLabel}>Materials:</Text>
              <Text style={styles.itemValue}>{analysisResult?.materials}</Text>
            </View>
            
            <View style={styles.itemContainer}>
              <Text style={styles.itemLabel}>Hazard Level:</Text>
              <Chip mode="outlined" style={styles.hazardChip}>
                {analysisResult?.hazardLevel}
              </Chip>
            </View>
            
            <Button
              mode="contained"
              onPress={() => navigation.navigate(ROUTES.DISPOSAL_GUIDE, {
                itemData: analysisResult
              })}
              style={styles.guideButton}
            >
              View Disposal Guide
            </Button>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Styles omitted for brevity
});

export default ResultScreen;
