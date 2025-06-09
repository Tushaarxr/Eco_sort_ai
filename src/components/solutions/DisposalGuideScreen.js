
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Text, Card, List, Divider } from "react-native-paper";
import { getDisposalGuidance } from "../../api/geminiService";
import { getRecyclingCenters } from "../../api/firebaseService";
import { COLORS } from "../../styles/colors";

const DisposalGuideScreen = () => {
  const route = useRoute();
  const { itemData } = route.params;

  const [loading, setLoading] = useState(true);
  const [guidance, setGuidance] = useState(null);
  const [recyclingCenters, setRecyclingCenters] = useState([]);

  useEffect(() => {
    fetchGuidanceAndCenters();
  }, []);

  const fetchGuidanceAndCenters = async () => {
    try {
      setLoading(true);

      // Get personalized disposal guidance from Gemini
      const guidanceData = await getDisposalGuidance(itemData);

      // Parse the guidance
      let parsedGuidance;
      try {
        parsedGuidance = JSON.parse(guidanceData);
      } catch (e) {
        parsedGuidance = {
          safety: ["Handle with care"],
          preparation: ["Remove any obvious hazardous components"],
          disposalMethods: [guidanceData],
          environmentalImpact: ["Improper disposal can harm the environment"],
          legalRequirements: ["Check local regulations"],
        };
      }

      setGuidance(parsedGuidance);

      // Get nearby recycling centers
      const centers = await getRecyclingCenters(itemData.type);
      setRecyclingCenters(centers);
    } catch (err) {
      console.error("Error fetching guidance:", err);
    } finally {
      setLoading(false);
    }
  };

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
        <Card.Title title={`Disposal Guide for ${itemData.type}`} />
        <Card.Content>
          <Text style={styles.hazardText}>
            Hazard Level:{" "}
            <Text style={styles.hazardValue}>{itemData.hazardLevel}</Text>
          </Text>

          <Divider style={styles.divider} />

          <List.Section>
            <List.Accordion
              title="Safety Precautions"
              left={(props) => <List.Icon {...props} icon="shield" />}
            >
              {guidance?.safety.map((item, index) => (
                <List.Item
                  key={`safety-${index}`}
                  title={item}
                  left={(props) => (
                    <List.Icon {...props} icon="check-circle-outline" />
                  )}
                />
              ))}
            </List.Accordion>

            <List.Accordion
              title="Preparation Steps"
              left={(props) => <List.Icon {...props} icon="tools" />}
            >
              {guidance?.preparation.map((item, index) => (
                <List.Item
                  key={`prep-${index}`}
                  title={item}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="numeric-${index + 1}-circle-outline"
                    />
                  )}
                />
              ))}
            </List.Accordion>

            <List.Accordion
              title="Disposal Methods"
              left={(props) => <List.Icon {...props} icon="recycle" />}
            >
              {guidance?.disposalMethods.map((item, index) => (
                <List.Item
                  key={`disposal-${index}`}
                  title={item}
                  left={(props) => (
                    <List.Icon {...props} icon="check-circle-outline" />
                  )}
                />
              ))}
            </List.Accordion>

            <List.Accordion
              title="Environmental Impact"
              left={(props) => <List.Icon {...props} icon="leaf" />}
            >
              {guidance?.environmentalImpact.map((item, index) => (
                <List.Item
                  key={`impact-${index}`}
                  title={item}
                  left={(props) => (
                    <List.Icon {...props} icon="information-outline" />
                  )}
                />
              ))}
            </List.Accordion>

            <List.Accordion
              title="Legal Requirements"
              left={(props) => <List.Icon {...props} icon="gavel" />}
            >
              {guidance?.legalRequirements.map((item, index) => (
                <List.Item
                  key={`legal-${index}`}
                  title={item}
                  left={(props) => (
                    <List.Icon {...props} icon="check-circle-outline" />
                  )}
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
                <Text>Accepts: {center.acceptsItems.join(", ")}</Text>
                <Text>Distance: {center.distance} km</Text>
                {index < recyclingCenters.length - 1 && (
                  <Divider style={styles.divider} />
                )}
              </View>
            ))
          ) : (
            <Text>
              No recycling centers found nearby. Try contacting your local waste
              management facility.
            </Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "bold",
    color: COLORS.accent,
  },
  centerContainer: {
    marginBottom: 12,
  },
  centerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DisposalGuideScreen;
