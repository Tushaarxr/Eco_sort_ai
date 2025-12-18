import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import { testGeminiConnection, checkNetworkConnectivity } from '../../../src/api/apiUtils';
import { COLORS } from '../../../src/styles/colors';

export default function ApiTestScreen() {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    network: boolean | null;
    gemini: boolean | null;
  }>({
    network: null,
    gemini: null,
  });

  const runTests = async () => {
    setLoading(true);
    setTestResults({ network: null, gemini: null });

    try {
      // Test network connectivity first
      const networkResult = await checkNetworkConnectivity();
      setTestResults(prev => ({ ...prev, network: networkResult }));

      if (!networkResult) {
        Alert.alert('Network Error', 'No internet connection detected. Please check your connection and try again.');
        setLoading(false);
        return;
      }

      // Test Gemini API
      const geminiResult = await testGeminiConnection();
      setTestResults(prev => ({ ...prev, gemini: geminiResult }));

      if (geminiResult) {
        Alert.alert('Success', 'Gemini API is working correctly!');
      } else {
        Alert.alert('API Error', 'Gemini API test failed. Please check your API key configuration.');
      }

    } catch (error) {
      console.error('Test error:', error);
      Alert.alert('Error', 'An error occurred during testing.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: boolean | null): string => {
    if (status === null) return 'Not tested';
    return status ? '✅ Working' : '❌ Failed';
  };

  const getStatusColor = (status: boolean | null): string => {
    if (status === null) return '#666';
    return status ? COLORS.success : COLORS.error;
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="API Connection Test" />
        <Card.Content>
          <Text style={styles.description}>
            This test will check if your Gemini API key is configured and working correctly.
          </Text>
          
          <Button
            mode="contained"
            onPress={runTests}
            loading={loading}
            disabled={loading}
            style={styles.testButton}
          >
            Run API Tests
          </Button>

          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Test Results:</Text>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Network Connectivity:</Text>
              <Text style={[styles.resultStatus, { color: getStatusColor(testResults.network) }]}>
                {getStatusText(testResults.network)}
              </Text>
            </View>

            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Gemini API:</Text>
              <Text style={[styles.resultStatus, { color: getStatusColor(testResults.gemini) }]}>
                {getStatusText(testResults.gemini)}
              </Text>
            </View>
          </View>

          {testResults.gemini === false && (
            <View style={styles.troubleshootContainer}>
              <Text style={styles.troubleshootTitle}>Troubleshooting:</Text>
              <Text style={styles.troubleshootText}>
                1. Check if you have a valid Gemini API key{'\n'}
                2. Ensure the API key is properly configured in your environment{'\n'}
                3. Verify that the API key has the necessary permissions{'\n'}
                4. Check if you have sufficient API quota remaining
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  card: {
    margin: 16,
  },
  description: {
    marginBottom: 20,
    lineHeight: 20,
  },
  testButton: {
    marginBottom: 20,
  },
  resultsContainer: {
    marginTop: 10,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultLabel: {
    fontSize: 14,
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  troubleshootContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  troubleshootTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#E65100',
  },
  troubleshootText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#E65100',
  },
});
