import { ScanResult } from '../types';

// Input validation utilities for the E-Waste Assistant app

// Email validation
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }
  
  return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long' };
  }
  
  return { isValid: true };
};

// Image URI validation
export const validateImageUri = (imageUri: string): { isValid: boolean; error?: string } => {
  if (!imageUri || typeof imageUri !== 'string') {
    return { isValid: false, error: 'Image URI is required' };
  }
  
  // Check if it's a valid URI format
  try {
    new URL(imageUri);
  } catch {
    // For local file URIs, check basic format
    if (!imageUri.startsWith('file://') && !imageUri.startsWith('content://') && !imageUri.startsWith('data:')) {
      return { isValid: false, error: 'Invalid image URI format' };
    }
  }
  
  // Check for common image extensions or data URI
  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
  const isDataUri = imageUri.startsWith('data:image/');
  const hasValidExtension = imageExtensions.test(imageUri);
  
  if (!isDataUri && !hasValidExtension && !imageUri.includes('content://') && !imageUri.includes('file://')) {
    return { isValid: false, error: 'Image must be a valid image file' };
  }
  
  return { isValid: true };
};

// Base64 image validation
export const validateBase64Image = (base64: string): { isValid: boolean; error?: string } => {
  if (!base64 || typeof base64 !== 'string') {
    return { isValid: false, error: 'Base64 image data is required' };
  }
  
  // Check if it's a valid base64 data URI
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|bmp|webp);base64,/;
  if (!base64Regex.test(base64)) {
    return { isValid: false, error: 'Invalid base64 image format' };
  }
  
  // Check minimum length (should be substantial for a real image)
  if (base64.length < 1000) {
    return { isValid: false, error: 'Base64 image data appears to be too small' };
  }
  
  // Check maximum size (10MB in base64)
  if (base64.length > 13000000) {
    return { isValid: false, error: 'Image is too large (max 10MB)' };
  }
  
  return { isValid: true };
};

// Scan result validation
export const validateScanResult = (result: any): { isValid: boolean; error?: string; sanitized?: ScanResult } => {
  if (!result || typeof result !== 'object') {
    return { isValid: false, error: 'Scan result must be an object' };
  }
  
  // Required fields validation
  if (!result.itemType && !result.type) {
    return { isValid: false, error: 'Item type is required' };
  }
  
  // Sanitize and validate fields
  const sanitized: ScanResult = {
    itemType: sanitizeString(result.itemType || result.type, 100),
    type: sanitizeString(result.type || 'electronics', 50),
    materials: Array.isArray(result.materials) 
      ? result.materials.map((m: any) => sanitizeString(String(m), 50)).filter(Boolean)
      : ['Unknown'],
    hazardLevel: validateHazardLevel(result.hazardLevel),
    disposalMethod: sanitizeString(result.disposalMethod, 500),
    confidence: validateConfidenceLevel(result.confidence),
    recyclingValue: validateRecyclingValue(result.recyclingValue),
    dataSecurityRisk: Boolean(result.dataSecurityRisk),
    fallbackParsed: Boolean(result.fallbackParsed),
    timestamp: result.timestamp || new Date()
  };
  
  return { isValid: true, sanitized };
};

// String sanitization
export const sanitizeString = (input: any, maxLength: number = 255): string => {
  if (!input) return '';
  
  let sanitized = String(input)
    .trim()
    .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' '); // Normalize whitespace
  
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim();
  }
  
  return sanitized;
};

// Hazard level validation
const validateHazardLevel = (level: any): 'low' | 'medium' | 'high' => {
  const validLevels = ['low', 'medium', 'high'];
  const normalized = String(level || '').toLowerCase().trim();
  return validLevels.includes(normalized) ? normalized as 'low' | 'medium' | 'high' : 'medium';
};

// Confidence level validation
const validateConfidenceLevel = (level: any): 'low' | 'medium' | 'high' => {
  const validLevels = ['low', 'medium', 'high'];
  const normalized = String(level || '').toLowerCase().trim();
  return validLevels.includes(normalized) ? normalized as 'low' | 'medium' | 'high' : 'medium';
};

// Recycling value validation
const validateRecyclingValue = (value: any): 'none' | 'low' | 'medium' | 'high' | undefined => {
  if (!value) return undefined;
  const validValues = ['none', 'low', 'medium', 'high'];
  const normalized = String(value).toLowerCase().trim();
  return validValues.includes(normalized) ? normalized as 'none' | 'low' | 'medium' | 'high' : undefined;
};

// User ID validation (Firebase UID format)
export const validateUserId = (userId: string): { isValid: boolean; error?: string } => {
  if (!userId || typeof userId !== 'string') {
    return { isValid: false, error: 'User ID is required' };
  }
  
  // Firebase UIDs are typically 28 characters long
  if (userId.length < 10 || userId.length > 128) {
    return { isValid: false, error: 'Invalid user ID format' };
  }
  
  // Should only contain alphanumeric characters and some special chars
  const uidRegex = /^[a-zA-Z0-9_-]+$/;
  if (!uidRegex.test(userId)) {
    return { isValid: false, error: 'User ID contains invalid characters' };
  }
  
  return { isValid: true };
};

// Location coordinates validation
export const validateCoordinates = (lat: any, lng: any): { isValid: boolean; error?: string; sanitized?: { lat: number; lng: number } } => {
  const latitude = Number(lat);
  const longitude = Number(lng);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return { isValid: false, error: 'Coordinates must be valid numbers' };
  }
  
  if (latitude < -90 || latitude > 90) {
    return { isValid: false, error: 'Latitude must be between -90 and 90' };
  }
  
  if (longitude < -180 || longitude > 180) {
    return { isValid: false, error: 'Longitude must be between -180 and 180' };
  }
  
  return { 
    isValid: true, 
    sanitized: { 
      lat: Math.round(latitude * 1000000) / 1000000, // Round to 6 decimal places
      lng: Math.round(longitude * 1000000) / 1000000
    }
  };
};

// Search query validation
export const validateSearchQuery = (query: string): { isValid: boolean; error?: string; sanitized?: string } => {
  if (!query || typeof query !== 'string') {
    return { isValid: false, error: 'Search query is required' };
  }
  
  const sanitized = sanitizeString(query, 100);
  
  if (sanitized.length < 2) {
    return { isValid: false, error: 'Search query must be at least 2 characters long' };
  }
  
  return { isValid: true, sanitized };
};

// API response validation
export const validateApiResponse = (response: any): { isValid: boolean; error?: string } => {
  if (!response) {
    return { isValid: false, error: 'API response is empty' };
  }
  
  if (typeof response !== 'object') {
    return { isValid: false, error: 'API response must be an object' };
  }
  
  return { isValid: true };
};

// File size validation
export const validateFileSize = (sizeInBytes: number, maxSizeInMB: number = 10): { isValid: boolean; error?: string } => {
  if (typeof sizeInBytes !== 'number' || sizeInBytes < 0) {
    return { isValid: false, error: 'Invalid file size' };
  }
  
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  
  if (sizeInBytes > maxSizeInBytes) {
    return { isValid: false, error: `File size must be less than ${maxSizeInMB}MB` };
  }
  
  if (sizeInBytes === 0) {
    return { isValid: false, error: 'File appears to be empty' };
  }
  
  return { isValid: true };
};

// Generic object sanitization
export const sanitizeObject = (obj: any, allowedKeys: string[]): any => {
  if (!obj || typeof obj !== 'object') {
    return {};
  }
  
  const sanitized: any = {};
  
  for (const key of allowedKeys) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = obj[key];
    }
  }
  
  return sanitized;
};

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (identifier: string, maxRequests: number = 10, windowMs: number = 60000): { allowed: boolean; error?: string } => {
  const now = Date.now();
  const key = identifier;
  
  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  if (current.count >= maxRequests) {
    return { allowed: false, error: 'Rate limit exceeded. Please try again later.' };
  }
  
  current.count++;
  return { allowed: true };
};