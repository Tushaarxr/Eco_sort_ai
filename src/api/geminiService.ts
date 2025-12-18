import { GoogleGenerativeAI, GenerationConfig } from "@google/generative-ai";
import Constants from 'expo-constants';
import { ScanResult } from '../types';
// Use legacy API for Expo SDK 54 compatibility
import * as FileSystem from 'expo-file-system/legacy';

// 1. Setup API Key
const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('Gemini API key is not configured');
}

// 2. Initialize the Client
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Configuration for Image Analysis
const visionConfig: GenerationConfig = {
  temperature: 0.6, // Slightly higher for fun responses
  maxOutputTokens: 2048,
  responseMimeType: "application/json",
};

// MODEL: Vision Model (Gemini 2.5 Flash for best image recognition)
const visionModel = genAI?.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: visionConfig
});

// ==========================================
// Function 1: Image Analysis with Fun Edge Case Handling
// ==========================================
export const analyzeEWasteImage = async (base64Image: string): Promise<string> => {
  if (!visionModel) {
    throw new Error('Gemini API is not configured');
  }

  try {
    console.log('Starting Gemini image analysis...');

    const prompt = `You are EcoSort AI, a friendly and slightly witty e-waste identification assistant. Analyze this image.

IMPORTANT RULES:
1. If the image shows an electronic device (phone, computer, TV, battery, cable, mouse, keyboard, appliance, etc.), provide detailed e-waste analysis.
2. If the image does NOT show e-waste (like food, animals, people, nature, clothes, etc.), respond with a FUN, LIGHT-HEARTED, SARCASTIC comment while still being helpful.

For E-WASTE items, respond with this JSON:
{
  "isEWaste": true,
  "itemType": "Specific device name (e.g., 'Wireless Gaming Mouse', 'iPhone 12 Pro', 'Samsung LED TV')",
  "materials": ["List of materials found in the device"],
  "hazardLevel": "low, medium, or high",
  "disposalMethod": "Detailed step-by-step disposal instructions",
  "recyclingValue": "Description of recyclable value",
  "dataSecurityRisk": true or false,
  "confidence": "high, medium, or low",
  "funMessage": null
}

For NON-E-WASTE items, respond with this JSON:
{
  "isEWaste": false,
  "itemType": "What you actually see (e.g., 'Delicious Birthday Cake', 'Fluffy Cat', 'Nice Sneakers')",
  "materials": [],
  "hazardLevel": "none",
  "disposalMethod": "A fun, sarcastic suggestion",
  "recyclingValue": "N/A",
  "dataSecurityRisk": false,
  "confidence": "high",
  "funMessage": "A witty, sarcastic but friendly comment. Examples:
    - For food: 'Hmm, unless you're planning to charge your phone with cake, I can't help you here! 🎂 Try our recipes app instead!'
    - For pets: 'That's a very cute not-a-robot! Pets are best recycled through belly rubs, not recycling centers. 🐱'
    - For clothes: 'Nice outfit! But our specialty is circuits, not fashion. Try a thrift store for clothing recycling! 👕'
    Be creative and fun!"
}

Respond ONLY with valid JSON, no markdown.`;

    // Clean base64 prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

    console.log('Sending to Gemini API...');
    const result = await visionModel.generateContent([
      prompt,
      {
        inlineData: {
          data: cleanBase64,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const responseText = result.response.text();
    console.log('Gemini response received:', responseText.substring(0, 200) + '...');

    return responseText;
  } catch (error) {
    console.error('Error analyzing image with Gemini SDK:', error);
    throw error;
  }
};

// ==========================================
// Helper: Convert image to base64
// ==========================================
export const convertImageToBase64 = async (uri: string): Promise<string> => {
  try {
    console.log('Converting image to base64:', uri);
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log('Base64 conversion successful, length:', base64.length);
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

// ==========================================
// Helper: Parse Gemini response to ScanResult
// ==========================================
export const parseAnalysisResult = (jsonString: string): ScanResult => {
  try {
    console.log('Parsing analysis result...');

    // Clean code block markers if present
    let cleanJson = jsonString
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Try to extract JSON from the response
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanJson = jsonMatch[0];
    }

    const parsed = JSON.parse(cleanJson);
    console.log('Parsed result:', parsed);

    // Check if it's a non-e-waste item with a fun message
    const isEWaste = parsed.isEWaste !== false;
    const funMessage = parsed.funMessage || null;

    return {
      itemType: parsed.itemType || parsed.item_type || parsed.type || "Unknown Device",
      type: parsed.itemType || parsed.item_type || parsed.type || "Unknown Device",
      materials: Array.isArray(parsed.materials) ? parsed.materials : [],
      hazardLevel: (parsed.hazardLevel || parsed.hazard_level || "medium").toLowerCase(),
      disposalMethod: parsed.disposalMethod || parsed.disposal_method || "",
      confidence: (parsed.confidence || "medium").toLowerCase(),
      recyclingValue: parsed.recyclingValue || parsed.recycling_value || null,
      dataSecurityRisk: parsed.dataSecurityRisk || parsed.data_security_risk || false,
      isEWaste: isEWaste,
      funMessage: funMessage,
      fallbackParsed: false,
      timestamp: new Date()
    };
  } catch (e) {
    console.error("Failed to parse JSON:", e, "\nOriginal string:", jsonString);

    return {
      itemType: "Unidentified Item",
      type: "Unidentified Item",
      materials: [],
      hazardLevel: "unknown",
      disposalMethod: "Unable to analyze this item. Please try with a clearer image of an electronic device.",
      confidence: "low",
      recyclingValue: null,
      dataSecurityRisk: false,
      isEWaste: false,
      funMessage: "🤔 Hmm, I couldn't quite figure out what this is. Try taking a clearer photo!",
      fallbackParsed: true,
      timestamp: new Date()
    };
  }
};
