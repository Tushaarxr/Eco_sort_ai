import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../src/styles/colors';
import { analyzeEWasteImage, parseAnalysisResult, convertImageToBase64 } from '../../../src/api/geminiService';
import { useAuth } from '@clerk/clerk-expo';

export default function ScanScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { userId } = useAuth();

  const processImage = async (imageUri: string) => {
    try {
      setLoadingMessage('Preparing image...');
      const base64Image = await convertImageToBase64(imageUri);

      setLoadingMessage('Analyzing with AI...');
      let analysisResponse: string;
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          analysisResponse = await analyzeEWasteImage(base64Image);
          break;
        } catch (apiError: any) {
          retryCount++;
          if (retryCount > maxRetries) throw apiError;
          setLoadingMessage(`Retrying (${retryCount}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      setLoadingMessage('Processing results...');
      const parsedResult = parseAnalysisResult(analysisResponse!);

      router.push({
        pathname: '/scan/result',
        params: {
          imageUri,
          analysisResult: JSON.stringify(parsedResult)
        }
      });
    } catch (error: any) {
      Alert.alert(
        'Analysis Failed',
        error.message || 'Unable to analyze the image',
        [
          { text: 'Try Again', onPress: () => pickImage() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const pickImage = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Opening gallery...');

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const takePhoto = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Opening camera...');

      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant camera access.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons name="recycle" size={40} color={COLORS.primary} />
            <Text style={styles.title}>Scan E-Waste</Text>
            <Text style={styles.subtitle}>
              Take a photo or select from gallery
            </Text>
          </View>

          {/* Primary Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={takePhoto}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="camera" size={32} color="#fff" />
              <Text style={styles.primaryButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={pickImage}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="image" size={24} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Tips for best results</Text>
            <View style={styles.tipRow}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>Use good lighting</Text>
            </View>
            <View style={styles.tipRow}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>Place item on plain background</Text>
            </View>
            <View style={styles.tipRow}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>Capture the entire item</Text>
            </View>
          </View>
        </View>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>{loadingMessage || 'Processing...'}</Text>
              <Text style={styles.loadingHint}>AI is analyzing your item</Text>
            </View>
          </View>
        )}
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 48,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 20,
    borderRadius: 16,
    gap: 12,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    gap: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  tipsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
  },
  loadingHint: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
  },
});