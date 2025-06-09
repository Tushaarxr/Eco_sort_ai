// src/components/scanning/CameraScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../styles/colors';
import { ROUTES } from '../../constants/routes';

const CameraScreen = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const cameraRef = useRef(null);
  
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        navigation.navigate(ROUTES.RESULT, { imageUri: photo.uri });
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      
      if (!result.canceled) {
        navigation.navigate(ROUTES.RESULT, { imageUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  // Render camera UI with controls for taking pictures and accessing gallery
  return (
    <View style={styles.container}>
      {hasPermission ? (
        <Camera style={styles.camera} type={type} ref={cameraRef}>
          {/* Camera controls */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <MaterialCommunityIcons name="image" size={30} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
            
            <TouchableOpacity style={styles.flipButton} onPress={() => {
              setType(type === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back);
            }}>
              <MaterialCommunityIcons name="camera-flip" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </Camera>
      ) : (
        <View style={styles.permissionContainer}>
          <Text>No access to camera</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Styles omitted for brevity
});

export default CameraScreen;
