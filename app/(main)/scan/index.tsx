import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../src/styles/colors';
import { analyzeEWasteImage, parseAnalysisResult, convertImageToBase64 } from '../../../src/api/geminiService';
import { useAuth } from '@clerk/clerk-expo';

export default function UploadScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { userId } = useAuth();

  const pickImage = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Requesting permissions...');

      // Check permissions first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'You need to grant access to your photo library to upload images.'
        );
        setIsLoading(false);
        setLoadingMessage('');
        return;
      }

      setLoadingMessage('Opening image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
        allowsMultipleSelection: false
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const imageUri = result.assets[0].uri;
        console.log('Selected image URI:', imageUri);

        try {
          // Convert image to base64
          setLoadingMessage('Preparing image for analysis...');
          console.log('Converting image to base64...');
          const base64Image = await convertImageToBase64(imageUri);
          console.log('Base64 image length:', base64Image.length);

          // Analyze with Gemini
          setLoadingMessage('Analyzing e-waste item with AI...');
          console.log('Sending to Gemini API...');

          let analysisResponse: string;
          let retryCount = 0;
          const maxRetries = 2;

          while (retryCount <= maxRetries) {
            try {
              analysisResponse = await analyzeEWasteImage(base64Image);
              console.log('Gemini response:', analysisResponse);
              break;
            } catch (apiError: any) {
              retryCount++;
              console.error(`Gemini API attempt ${retryCount} failed:`, apiError);

              if (retryCount > maxRetries) {
                throw apiError;
              }

              setLoadingMessage(`Retrying analysis (${retryCount}/${maxRetries})...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }

          // Parse the analysis result
          setLoadingMessage('Processing analysis results...');
          console.log('Parsing analysis result...');
          const parsedResult = parseAnalysisResult(analysisResponse!);
          console.log('Parsed result:', parsedResult);

          // Check if we got a proper result
          if (parsedResult.fallbackParsed) {
            console.warn('Using fallback parsing - Gemini response may have been malformed');
          }

          setLoadingMessage('Complete!');

          // Navigate to result screen with analysis data
          // Note: We'll save to Supabase on the result screen to avoid duplicate saves
          router.push({
            pathname: '/scan/result',
            params: {
              imageUri,
              analysisResult: JSON.stringify(parsedResult)
            }
          });

        } catch (error: any) {
          console.error('Analysis error:', error);

          // Show error with option to try again
          Alert.alert(
            'Analysis Failed',
            `Unable to analyze the image: ${error.message || 'Unknown error'}`,
            [
              { text: 'Try Again', onPress: () => pickImage() },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        }
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const takePhoto = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Requesting camera permissions...');

      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'You need to grant camera access to take photos.'
        );
        setIsLoading(false);
        setLoadingMessage('');
        return;
      }

      setLoadingMessage('Opening camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const imageUri = result.assets[0].uri;
        console.log('Captured image URI:', imageUri);

        try {
          setLoadingMessage('Preparing image for analysis...');
          const base64Image = await convertImageToBase64(imageUri);

          setLoadingMessage('Analyzing e-waste item with AI...');
          const analysisResponse = await analyzeEWasteImage(base64Image);
          console.log('Gemini response:', analysisResponse);

          setLoadingMessage('Processing analysis results...');
          const parsedResult = parseAnalysisResult(analysisResponse);

          setLoadingMessage('Complete!');

          router.push({
            pathname: '/scan/result',
            params: {
              imageUri,
              analysisResult: JSON.stringify(parsedResult)
            }
          });

        } catch (error: any) {
          console.error('Analysis error:', error);
          Alert.alert(
            'Analysis Failed',
            `Unable to analyze the image: ${error.message || 'Unknown error'}`,
            [
              { text: 'Try Again', onPress: () => takePhoto() },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.uploadContainer}>
        <Text style={styles.title}>E-Waste Scanner</Text>
        <Text style={styles.subtitle}>
          {userId ? 'Scan or upload a photo of your e-waste item' : 'Sign in to save your scan history'}
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={takePhoto}
            disabled={isLoading}
          >
            <MaterialCommunityIcons name="camera" size={50} color={COLORS.primary} />
            <Text style={styles.uploadText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickImage}
            disabled={isLoading}
          >
            <MaterialCommunityIcons name="image-plus" size={50} color={COLORS.primary} />
            <Text style={styles.uploadText}>Upload Image</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.instructionText}>
          For best results, take a clear photo of the item against a plain background
        </Text>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>
            {loadingMessage || 'Processing...'}
          </Text>
          <Text style={styles.progressText}>
            This may take a few moments while AI analyzes your item
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  uploadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 20,
    borderStyle: 'dashed',
    backgroundColor: 'white',
    width: 140,
    height: 140,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    color: COLORS.primary,
    textAlign: 'center',
  },
  instructionText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    maxWidth: 300,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 30,
  },
  loadingText: {
    color: 'white',
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});