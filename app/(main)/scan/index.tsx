import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../src/styles/colors';

// Hardcoded scan result data
const HARDCODED_RESULT = {
  itemType: "Smartphone",
  materials: ["Plastic", "Glass", "Lithium Battery", "Circuit Board", "Copper", "Aluminum"],
  hazardLevel: "Medium",
  disposalMethod: "Take to an electronics recycling center or return to manufacturer through a take-back program."
};

export default function UploadScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    try {
      setIsLoading(true);
      
      // Check permissions first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'You need to grant access to your photo library to upload images.'
        );
        setIsLoading(false);
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
        allowsMultipleSelection: false
      });
      
      if (!result.canceled && result.assets?.[0]?.uri) {
        // Instead of analyzing the image, use the hardcoded result
        try {
          const imageUri = result.assets[0].uri;
          console.log('Selected image URI:', imageUri);
          
          // Navigate to result screen with hardcoded data
          router.push({
            pathname: '/scan/result',
            params: { 
              imageUri,
              // Pass the hardcoded result as a JSON string
              hardcodedResult: JSON.stringify(HARDCODED_RESULT)
            }
          });
        } catch (error) {
          console.error('Error accessing image:', error);
          Alert.alert('Error', 'Failed to access the selected image. Please try another image.');
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.uploadContainer}>
        <Text style={styles.title}>E-Waste Scanner</Text>
        <Text style={styles.subtitle}>Upload a photo of your e-waste item</Text>
        
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={pickImage}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <>
              <MaterialCommunityIcons name="image-plus" size={60} color={COLORS.primary} />
              <Text style={styles.uploadText}>Upload Image</Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={styles.instructionText}>
          For best results, take a clear photo of the item against a plain background
        </Text>
      </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 20,
    borderStyle: 'dashed',
    backgroundColor: 'white',
    width: 250,
    height: 250,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    color: COLORS.primary,
  },
  instructionText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    maxWidth: 300,
  },
});