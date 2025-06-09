import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text, Card, List, Divider, Button } from 'react-native-paper';
import { COLORS } from '../../../src/styles/colors';
import { ScanResult, DisposalGuidance, RecyclingCenter } from '../../../src/types';

export default function DisposalGuideScreen() {
  const { itemData } = useLocalSearchParams<{ itemData: string }>();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [guidance, setGuidance] = useState<DisposalGuidance | null>(null);
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([]);
  const [parsedItemData, setParsedItemData] = useState<ScanResult | null>(null);
  
  useEffect(() => {
    // Simulate loading for a better user experience
    setTimeout(() => {
      if (!itemData) {
        setLoading(false);
        return;
      }
      
      try {
        const parsedData = JSON.parse(itemData);
        setParsedItemData(parsedData);
        
        // Set hardcoded guidance applicable to most e-waste
        setGuidance({
          safety: [
            "Wear gloves when handling items with sharp edges or potential chemical exposure",
            "Avoid breaking screens or components that might contain hazardous materials",
            "Store in a cool, dry place away from children and pets",
            "Do not disassemble batteries or components with visible damage"
          ],
          preparation: [
            "Back up any data stored on the device if applicable",
            "Remove batteries if possible and recycle them separately",
            "Remove any memory cards, SIM cards, or personal data storage",
            "Clean the device of dust or debris (without using water)",
            "Place small items in clear plastic bags to keep components together"
          ],
          disposalMethods: [
            "Take to a certified e-waste recycling center",
            "Return to manufacturer through their take-back program",
            "Donate working electronics to schools or charitable organizations",
            "Use retailer drop-off programs (Best Buy, Staples, etc.)",
            "Check with your local waste management for special e-waste collection days"
          ],
          environmentalImpact: [
            "Proper recycling prevents toxic materials from entering landfills and water sources",
            "Recycling recovers valuable materials like gold, silver, copper, and rare earth metals",
            "One ton of circuit boards contains 40-800 times the gold of one ton of ore",
            "E-waste is the fastest growing waste stream in the world",
            "Recycling e-waste consumes less energy than mining new materials"
          ],
          legalRequirements: [
            "Many states prohibit disposing of e-waste in regular trash",
            "Businesses may have stricter requirements for e-waste disposal",
            "Some items (like batteries and mercury-containing devices) have special disposal regulations",
            "Data privacy laws may require secure data destruction before disposal",
            "Check your local regulations as they vary by location"
          ]
        });
        
        // Set hardcoded recycling centers
        setRecyclingCenters([
          {
            id: '1',
            name: 'EcoTech Recycling Center',
            address: '123 Green Street, Anytown, USA',
            acceptsItems: ['Electronics', 'Batteries', 'Appliances'],
            distance: 2.5,
            
          },
          {
            id: '2',
            name: 'City E-Waste Facility',
            address: '456 Recycle Avenue, Anytown, USA',
            acceptsItems: ['Computers', 'TVs', 'Mobile Phones'],
            distance: 4.8,
           
          },
          {
            id: '3',
            name: 'GreenFuture Recyclers',
            address: '789 Sustainability Blvd, Anytown, USA',
            acceptsItems: ['All Electronics', 'Batteries', 'Ink Cartridges'],
            distance: 6.2,
           
          }
        ]);
        
      } catch (error) {
        console.error('Error parsing item data:', error);
        // Set default item data if parsing fails
        setParsedItemData({
          itemType: "Electronic Device",
          materials: ["Various Materials"],
          hazardLevel: "Medium",
          disposalMethod: "Take to an electronics recycling center"
        });
        
        // Still set the hardcoded guidance and centers
        setGuidance({
          safety: [
            "Wear gloves when handling items with sharp edges or potential chemical exposure",
            "Avoid breaking screens or components that might contain hazardous materials",
            "Store in a cool, dry place away from children and pets",
            "Do not disassemble batteries or components with visible damage"
          ],
          preparation: [
            "Back up any data stored on the device if applicable",
            "Remove batteries if possible and recycle them separately",
            "Remove any memory cards, SIM cards, or personal data storage",
            "Clean the device of dust or debris (without using water)",
            "Place small items in clear plastic bags to keep components together"
          ],
          disposalMethods: [
            "Take to a certified e-waste recycling center",
            "Return to manufacturer through their take-back program",
            "Donate working electronics to schools or charitable organizations",
            "Use retailer drop-off programs (Best Buy, Staples, etc.)",
            "Check with your local waste management for special e-waste collection days"
          ],
          environmentalImpact: [
            "Proper recycling prevents toxic materials from entering landfills and water sources",
            "Recycling recovers valuable materials like gold, silver, copper, and rare earth metals",
            "One ton of circuit boards contains 40-800 times the gold of one ton of ore",
            "E-waste is the fastest growing waste stream in the world",
            "Recycling e-waste consumes less energy than mining new materials"
          ],
          legalRequirements: [
            "Many states prohibit disposing of e-waste in regular trash",
            "Businesses may have stricter requirements for e-waste disposal",
            "Some items (like batteries and mercury-containing devices) have special disposal regulations",
            "Data privacy laws may require secure data destruction before disposal",
            "Check your local regulations as they vary by location"
          ]
        });
        
        setRecyclingCenters([
          {
            id: '1',
            name: 'EcoTech Recycling Center',
            address: '123 Green Street, Anytown, USA',
            acceptsItems: ['Electronics', 'Batteries', 'Appliances'],
            distance: 2.5,
            
          },
          {
            id: '2',
            name: 'City E-Waste Facility',
            address: '456 Recycle Avenue, Anytown, USA',
            acceptsItems: ['Computers', 'TVs', 'Mobile Phones'],
            distance: 4.8,
          
          },
          {
            id: '3',
            name: 'GreenFuture Recyclers',
            address: '789 Sustainability Blvd, Anytown, USA',
            acceptsItems: ['All Electronics', 'Batteries', 'Ink Cartridges'],
            distance: 6.2,
           
          }
        ]);
      } finally {
        setLoading(false);
      }
    }, 1000); // Simulate 1 second of loading
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
              parsedItemData?.hazardLevel === 'Low' && styles.lowHazardText,
              parsedItemData?.hazardLevel === 'Medium' && styles.mediumHazardText,
              parsedItemData?.hazardLevel === 'High' && styles.highHazardText,
            ]}>
              {parsedItemData?.hazardLevel || 'Medium'}
            </Text>
          </Text>
          
          <Divider style={styles.divider} />
          
          <List.Section>
            <List.Accordion title="Safety Precautions" left={props => <List.Icon {...props} icon="shield" />}>
              {guidance?.safety.map((item, index) => (
                <List.Item 
                  key={`safety-${index}`}
                  title={item}
                  left={props => <List.Icon {...props} icon="check-circle-outline" />}
                />
              ))}
            </List.Accordion>
            
            <List.Accordion title="Preparation Steps" left={props => <List.Icon {...props} icon="tools" />}>
              {guidance?.preparation.map((item, index) => (
                <List.Item 
                  key={`prep-${index}`}
                  title={item}
                  left={props => <List.Icon {...props} icon={`numeric-${index + 1}-circle-outline`} />}
                />
              ))}
            </List.Accordion>
            
            <List.Accordion title="Disposal Methods" left={props => <List.Icon {...props} icon="recycle" />}>
              {guidance?.disposalMethods.map((item, index) => (
                <List.Item 
                  key={`disposal-${index}`}
                  title={item}
                  left={props => <List.Icon {...props} icon="check-circle-outline" />}
                />
              ))}
            </List.Accordion>
            
            <List.Accordion title="Environmental Impact" left={props => <List.Icon {...props} icon="leaf" />}>
              {guidance?.environmentalImpact.map((item, index) => (
                <List.Item 
                  key={`impact-${index}`}
                  title={item}
                  left={props => <List.Icon {...props} icon="information-outline" />}
                />
              ))}
            </List.Accordion>
            
            <List.Accordion title="Legal Requirements" left={props => <List.Icon {...props} icon="gavel" />}>
              {guidance?.legalRequirements.map((item, index) => (
                <List.Item 
                  key={`legal-${index}`}
                  title={item}
                  left={props => <List.Icon {...props} icon="check-circle-outline" />}
                />
              ))}
            </List.Accordion>
          </List.Section>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Title title="Nearby Recycling Centers" />
        <Card.Content>
          {recyclingCenters.length > 0 ? (
            recyclingCenters.map((center, index) => (
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
