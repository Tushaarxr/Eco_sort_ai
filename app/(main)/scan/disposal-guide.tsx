import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text, Card, List, Divider, Button } from 'react-native-paper';
import { COLORS } from '../../../src/styles/colors';
import { ScanResult, DisposalGuidance, RecyclingCenter } from '../../../src/types';
import { getRecyclingCenters, getCurrentUserLocation } from '../../../src/api/firebaseService';
import { useDisposalGuidanceCache, useRecyclingCentersCache } from '../../../src/hooks/useOfflineCache';

export default function DisposalGuideScreen() {
  const { itemData } = useLocalSearchParams<{ itemData: string }>();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [parsedItemData, setParsedItemData] = useState<ScanResult | null>(null);
  
  // Use offline cache hooks
  const {
    disposalGuidance: guidance,
    isLoadingGuidance: guidanceLoading,
    error: guidanceError,
    isOnline
  } = useDisposalGuidanceCache();
  
  const {
    recyclingCenters,
    isLoadingCenters: centersLoading,
    error: centersError
  } = useRecyclingCentersCache(userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : undefined);
  
  const loading = guidanceLoading || centersLoading;
  const error = guidanceError || centersError;
  const isOffline = !isOnline;
  
  useEffect(() => {
    if (!itemData) {
      return;
    }
    
    try {
      const parsedData = JSON.parse(itemData);
      setParsedItemData(parsedData);
      
      // Get user location for recycling centers
      getCurrentUserLocation().then((location: { latitude: number; longitude: number } | null) => {
        setUserLocation(location);
      }).catch((error: any) => {
        console.error('Error getting user location:', error);
      });
      
    } catch (error) {
      console.error('Error parsing item data:', error);
      // Set default item data if parsing fails
      setParsedItemData({
        itemType: "Electronic Device",
        type: "electronics",
        materials: ["Various Materials"],
        hazardLevel: "medium",
        disposalMethod: "Take to an electronics recycling center",
        confidence: "medium",
        recyclingValue: "medium",
        dataSecurityRisk: false,
        fallbackParsed: true,
        timestamp: new Date()
      } as ScanResult);
    }
  }, [itemData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Generating disposal guidance...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title 
          title={`Disposal Guide for ${parsedItemData?.itemType || parsedItemData?.type || 'Electronic Device'}`} 
        />
        <Card.Content>
          <Text style={styles.hazardText}>
            Hazard Level: <Text style={[
              styles.hazardValue,
              parsedItemData?.hazardLevel === 'low' && styles.lowHazardText,
              parsedItemData?.hazardLevel === 'medium' && styles.mediumHazardText,
              parsedItemData?.hazardLevel === 'high' && styles.highHazardText,
            ]}>
              {parsedItemData?.hazardLevel || 'Medium'}
            </Text>
          </Text>
          
          <Divider style={styles.divider} />
          
          <List.Section>
            <List.Accordion title="Safety Precautions" left={props => <List.Icon {...props} icon="shield" />}>
              {guidance?.[0]?.safety?.map((item: string, index: number) => (
                <List.Item 
                  key={`safety-${index}`}
                  title={item}
                  left={props => <List.Icon {...props} icon="check-circle-outline" />}
                />
              )) || [
                <List.Item 
                  key="safety-default"
                  title="Handle with care and follow local safety guidelines"
                  left={props => <List.Icon {...props} icon="check-circle-outline" />}
                />
              ]}
            </List.Accordion>
            
            <List.Accordion title="Preparation Steps" left={props => <List.Icon {...props} icon="tools" />}>
              {guidance?.[0]?.preparation?.map((item: string, index: number) => (
                <List.Item 
                  key={`prep-${index}`}
                  title={item}
                  left={props => <List.Icon {...props} icon={`numeric-${index + 1}-circle-outline`} />}
                />
              )) || [
                <List.Item 
                  key="prep-default"
                  title="Remove batteries and personal data before disposal"
                  left={props => <List.Icon {...props} icon="numeric-1-circle-outline" />}
                />
              ]}
            </List.Accordion>
            
            <List.Accordion title="Disposal Methods" left={props => <List.Icon {...props} icon="recycle" />}>
              {guidance?.[0]?.disposalMethods?.map((method: any, index: number) => (
                <List.Item 
                  key={`disposal-${index}`}
                  title={typeof method === 'string' ? method : method.method}
                  description={typeof method === 'object' ? method.description : undefined}
                  left={props => <List.Icon {...props} icon="check-circle-outline" />}
                />
              )) || [
                <List.Item 
                  key="disposal-default"
                  title={parsedItemData?.disposalMethod || "Take to electronics recycling center"}
                  left={props => <List.Icon {...props} icon="check-circle-outline" />}
                />
              ]}
            </List.Accordion>
            
            <List.Accordion title="Environmental Impact" left={props => <List.Icon {...props} icon="leaf" />}>
              <List.Item 
                key="impact-default"
                title={guidance?.[0]?.environmentalImpact || "Proper disposal prevents harmful materials from entering the environment"}
                left={props => <List.Icon {...props} icon="information-outline" />}
              />
            </List.Accordion>
            
            <List.Accordion title="Legal Requirements" left={props => <List.Icon {...props} icon="gavel" />}>
              {guidance?.[0]?.legalRequirements?.map((item: string, index: number) => (
                <List.Item 
                  key={`legal-${index}`}
                  title={item}
                  left={props => <List.Icon {...props} icon="check-circle-outline" />}
                />
              )) || [
                <List.Item 
                  key="legal-default"
                  title="Follow local e-waste disposal regulations"
                  left={props => <List.Icon {...props} icon="check-circle-outline" />}
                />
              ]}
            </List.Accordion>
          </List.Section>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Title title="Nearby Recycling Centers" />
        <Card.Content>
          {recyclingCenters.length > 0 ? (
            recyclingCenters.map((center: RecyclingCenter, index: number) => (
              <View key={`center-${index}`} style={styles.centerContainer}>
                <Text style={styles.centerName}>{center.name}</Text>
                <Text>{center.address}</Text>
                <Text>Accepts: {center.acceptsItems.join(', ')}</Text>
                <Text>Distance: {typeof center.distance === 'number' ? `${center.distance} km` : center.distance}</Text>
                {index < recyclingCenters.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))
          ) : (
            <Text>No recycling centers found nearby. Try contacting your local waste management facility.</Text>
          )}
        </Card.Content>
        <Card.Actions>
          <Button
            mode="contained"
            icon="map-marker"
            onPress={() => {
              // This would navigate to the recycling centers tab
              // Using tab routing in Expo Router
            }}
          >
            View All Centers
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  card: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 12,
  },
  hazardText: {
    fontSize: 16,
    marginBottom: 8,
  },
  hazardValue: {
    fontWeight: 'bold',
  },
  lowHazardText: {
    color: COLORS.hazardLow,
  },
  mediumHazardText: {
    color: COLORS.hazardMedium,
  },
  highHazardText: {
    color: COLORS.hazardHigh,
  },
  centerContainer: {
    marginBottom: 12,
  },
  centerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
