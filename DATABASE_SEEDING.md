# Database Seeding Guide

This guide explains how to seed your Firebase Firestore database with recycling centers data for the E-Waste Assistant app.

## Overview

The app now uses a real Firebase database instead of hardcoded recycling centers data. This provides:
- Real-time data updates
- Location-based search and distance calculation
- Comprehensive recycling center information
- Scalable data management

## Prerequisites

1. **Firebase Project Setup**: Ensure your Firebase project is configured with Firestore enabled
2. **Environment Variables**: Make sure your `.env` file contains the correct Firebase configuration
3. **Dependencies**: Install required dependencies with `npm install`

## Seeding Commands

### Basic Seeding
```bash
npm run seed-db
```
This command adds recycling centers to your database without clearing existing data.

### Clear and Seed
```bash
npm run seed-db:clear
```
This command clears all existing recycling centers and adds fresh data.

### Manual Seeding
You can also run the seeding script directly:
```bash
npx ts-node src/scripts/seedRecyclingCenters.ts
```

## Seeded Data

The seeding script includes comprehensive recycling centers data covering:

### Geographic Coverage
- **United States**: Major cities including San Francisco, New York, Los Angeles, Chicago, Seattle, Austin
- **International**: Chennai (India), London (UK), Toronto (Canada)
- **Specialized Centers**: Battery-specific and electronics-focused facilities

### Data Fields
Each recycling center includes:
- **Basic Info**: Name, address, phone, website
- **Location**: GPS coordinates for distance calculation
- **Services**: Accepted items, operating hours, certifications
- **Features**: Data wiping, pickup service, fees structure
- **Compliance**: R2, e-Stewards, ISO 14001 certifications

## Database Structure

### Collection: `recyclingCenters`
```typescript
{
  id: string,
  name: string,
  address: string,
  location: GeoPoint, // Firebase GeoPoint for location queries
  acceptsItems: string[], // Array of accepted item types
  phoneNumber: string,
  website: string,
  operatingHours: string,
  certifications: string[],
  acceptsDataDevices: boolean,
  dataWipingService: boolean,
  pickupService: boolean,
  fees: string,
  active: boolean, // For enabling/disabling centers
  verified: boolean, // For data quality control
  createdAt: string,
  updatedAt: string
}
```

## Features

### Distance Calculation
- Uses Haversine formula for accurate distance calculation
- Converts distances to miles for US users
- Sorts results by proximity to user location

### Filtering and Search
- Filter by accepted item types
- Filter by maximum distance
- Location-based queries using Firebase GeoPoint

### Fallback System
- Graceful fallback to generic centers if database is unavailable
- Error handling with user-friendly messages
- Rate limiting to prevent API abuse

## Validation and Security

### Input Validation
- Coordinates validation (latitude: -90 to 90, longitude: -180 to 180)
- Item type sanitization
- Rate limiting (30 requests per minute)

### Data Sanitization
- All string inputs are sanitized
- XSS protection for user-facing content
- Structured data validation

## Usage in App

### Automatic Integration
The following screens now use the database:
- **Recycling Centers Screen**: `/recycling-centers`
- **Disposal Guide Screen**: `/scan/disposal-guide`
- **Scan Result Screen**: `/scan/result`

### API Functions
```typescript
// Get recycling centers with optional filters
getRecyclingCenters(
  userLocation?: { latitude: number; longitude: number },
  itemType?: string,
  maxDistance?: number
): Promise<RecyclingCenter[]>

// Get user's current location
getCurrentUserLocation(): Promise<{ latitude: number; longitude: number } | null>
```

## Troubleshooting

### Common Issues

1. **Firebase Configuration Error**
   - Verify `.env` file contains correct Firebase config
   - Ensure Firestore is enabled in Firebase console

2. **Permission Errors**
   - Check Firestore security rules
   - Verify authentication if required

3. **Seeding Failures**
   - Check network connectivity
   - Verify Firebase project permissions
   - Review console logs for specific errors

### Verification
After seeding, verify the data:
```bash
# The script automatically runs verification
# Check console output for:
# - Total centers added
# - Centers by location
# - Any errors encountered
```

## Maintenance

### Adding New Centers
1. Edit `src/scripts/seedRecyclingCenters.ts`
2. Add new center data to `RECYCLING_CENTERS_DATA` array
3. Run seeding script to update database

### Updating Existing Centers
1. Modify data in the seeding script
2. Run `npm run seed-db:clear` to refresh all data

### Data Quality
- Regular verification of center information
- Update operating hours and contact details
- Verify certifications and services

## Performance Considerations

- Results limited to 50 centers for optimal performance
- Efficient GeoPoint queries for location-based search
- Caching strategies for frequently accessed data
- Rate limiting to prevent abuse

## Security Best Practices

- Input validation and sanitization
- Rate limiting on API calls
- Secure Firebase rules configuration
- No sensitive data in recycling center records

For technical support or questions about the seeding process, refer to the main project documentation or contact the development team.