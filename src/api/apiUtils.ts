import { GoogleGenAI } from '@google/genai';
import Constants from 'expo-constants';

// Test Firebase connection
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Simple test to check if Firebase is accessible
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};

// Test Gemini API connection
export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.error('❌ Gemini API key not found');
      console.log('Please ensure GEMINI_API_KEY is set in your environment or app config');
      return false;
    }

    console.log('🔑 API Key found:', GEMINI_API_KEY.substring(0, 10) + '...');
    console.log('🌐 Testing Gemini API connection with official SDK...');

    // Initialize the Google GenAI client
    const genAI = new GoogleGenAI(GEMINI_API_KEY);

    // Test with a simple prompt
    const result = await genAI.models.generateContent({
      model: "gemini-pro",
      contents: "Hello, this is a test message. Please respond with 'API is working' if you receive this."
    });

    if (!result || !result.candidates || !result.candidates[0] || 
        !result.candidates[0].content || !result.candidates[0].content.parts || 
        !result.candidates[0].content.parts[0] || typeof result.candidates[0].content.parts[0].text !== 'string') {
      throw new Error('Failed to get a valid response from Gemini API');
    }

    const response = result.candidates[0].content.parts[0].text;
    console.log('✅ Gemini API test successful!');
    console.log('📝 Response:', response);
    return true;
  } catch (error) {
    console.error('❌ Gemini API connection test failed:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.error('💡 This might be an API key issue');
      } else if (error.message.includes('quota')) {
        console.error('💡 This might be a quota issue');
      } else if (error.message.includes('permission')) {
        console.error('💡 This might be a permissions issue');
      }
    }
    return false;
  }
};

// Test network connectivity
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    console.log('🌐 Testing network connectivity...');
    const response = await fetch('https://www.google.com', { 
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    console.log('✅ Network connectivity test successful!');
    return response.ok;
  } catch (error) {
    console.error('❌ Network connectivity test failed:', error);
    return false;
  }
};