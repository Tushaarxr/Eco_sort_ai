import axios from 'axios';
import Constants from 'expo-constants';
import { ScanResult, DisposalGuidance } from '../types';

// Improved API key retrieval with fallback to environment variable
const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || process.env.GEMINI_API_KEY;
const GEMINI_VISION_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent';
const GEMINI_TEXT_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

// Function to analyze e-waste items from images
export const analyzeEWasteImage = async (base64Image: string): Promise<string> => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }
    
    // Rest of the function remains the same
    const response = await axios.post(
      `${GEMINI_VISION_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: "Analyze this image and identify any electronic waste items. For each item, provide: 1) Item type, 2) Material composition, 3) Hazard level (low/medium/high), and 4) Proper disposal method. Format as a JSON object."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image.replace(/^data:image\/\w+;base64,/, '')
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);
    throw error;
  }
};

// Function to get personalized e-waste disposal guidance
export const getDisposalGuidance = async (itemData: ScanResult): Promise<string> => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }
    
    const response = await axios.post(
      `${GEMINI_TEXT_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Provide detailed step-by-step instructions for safely disposing of the following e-waste item:
                Item type: ${itemData.type || itemData.itemType}
                Material composition: ${Array.isArray(itemData.materials) ? itemData.materials.join(', ') : itemData.materials}
                Hazard level: ${itemData.hazardLevel}
                
                Include:
                1. Safety precautions
                2. Preparation steps
                3. Recommended disposal methods
                4. Environmental impact information
                5. Legal requirements.
                
                Format this as a JSON object with sections for each category.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 4096,
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error getting disposal guidance:', error);
    throw error;
  }
};
