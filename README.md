# E-Waste Assistant

A comprehensive React Native mobile application that helps users identify electronic waste items, provides detailed disposal guidance, and connects them with certified recycling centers. Features robust offline capabilities and real-time database integration.

## Features

### 🤖 AI-Powered Recognition
- **Advanced Image Analysis**: Uses cutting-edge AI to identify e-waste items from photos
- **Multi-Item Detection**: Recognizes various electronic devices and components
- **Confidence Scoring**: Provides accuracy ratings for identification results
- **Real-time Processing**: Fast, on-device analysis with cloud backup

### 📱 Smart Disposal Guidance
- **Detailed Instructions**: Step-by-step disposal and preparation guidelines
- **Safety Precautions**: Important safety information for handling different e-waste types
- **Environmental Impact**: Shows the benefits of proper disposal methods
- **Regulatory Compliance**: Includes relevant local and federal disposal regulations

### 🗺️ Recycling Center Integration
- **Location-Based Search**: Finds certified recycling centers near you
- **Real-time Data**: Live information from Firebase database
- **Distance Calculation**: Shows exact distances and travel times
- **Facility Details**: Contact information, hours, accepted items, and certifications
- **Filtering Options**: Search by item type, distance, and facility features

### 🔄 Offline Capabilities
- **Seamless Offline Mode**: Full functionality without internet connection
- **Intelligent Caching**: Stores scan results, guidance, and center data locally
- **Auto-Sync**: Automatically syncs data when connection is restored
- **Background Updates**: Keeps cached data fresh and relevant

### 📊 Data Management
- **Scan History**: Track all your previous scans and disposal actions
- **Personal Dashboard**: View your environmental impact and recycling statistics
- **Export Options**: Share scan results and disposal records
- **Cloud Backup**: Secure storage of user data and preferences

### 🛡️ Security & Privacy
- **Data Encryption**: All user data encrypted in transit and at rest
- **Privacy Controls**: Granular permissions for location and data sharing
- **Secure Authentication**: Firebase-based user authentication
- **GDPR Compliant**: Meets international privacy standards

## Prerequisites

Before running this app, you need to set up the following:

1. **Gemini API Key**: Required for AI image analysis
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - See [API_SETUP.md](./API_SETUP.md) for detailed setup instructions

2. **Node.js & Expo CLI**: For development
3. **Mobile Device or Emulator**: For testing

## Quick Start

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/e-waste-assistant.git
cd e-waste-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication and Firestore
   - Download the configuration file and place it in the appropriate directory

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration

5. Initialize Firebase collections and seed data:
```bash
# Initialize Firebase collections with proper schemas
npm run init-firebase

# Seed the database with sample data
npm run seed-db

# Or run both commands together
npm run setup-db
```

6. Run the application:
```bash
npx expo start
```

## Database Setup

The app uses Firebase Firestore with the following collections:

### Collections Structure
- **`recyclingCenters`**: Certified e-waste recycling facilities
- **`disposalGuidance`**: Item-specific disposal instructions
- **`scans`**: User scan history and results
- **`users`**: User profiles and preferences
- **`systemConfig`**: App configuration and settings

### Available Scripts
- `npm run init-firebase`: Initialize Firebase collections and indexes
- `npm run seed-db`: Populate database with sample data
- `npm run seed-db:clear`: Clear existing data before seeding
- `npm run setup-db`: Complete database setup (init + seed)

For detailed information, see:
- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Database Seeding Guide](./DATABASE_SEEDING.md)
- [Offline Capabilities Guide](./OFFLINE_CAPABILITIES.md)

## Offline Capabilities

The E-Waste Assistant is designed to work seamlessly both online and offline:

### 🔄 Smart Caching System
- **Automatic Data Caching**: Scan results, recycling centers, and disposal guidance are cached locally
- **Location-Aware Caching**: Recycling centers cached based on user location with intelligent radius management
- **Time-Based Expiration**: Smart cache invalidation ensures data freshness

### 📱 Offline-First Design
- **Full Functionality Offline**: All core features work without internet connection
- **Background Sync**: Automatic synchronization when connection is restored
- **Conflict Resolution**: Intelligent handling of data conflicts during sync

### 🚀 Performance Benefits
- **Instant Loading**: Cached data provides immediate access to information
- **Reduced Data Usage**: Minimizes network requests through intelligent caching
- **Battery Optimization**: Efficient background processes preserve device battery

### Usage Examples
```typescript
// Using offline-capable hooks
import { useRecyclingCenters, useDisposalGuidance } from 'src/hooks/useOfflineCache';

const { data, loading, isOffline } = useRecyclingCenters(location, radius);
const { guidance, refresh } = useDisposalGuidance(itemType);
```

For complete documentation, see [Offline Capabilities Guide](./OFFLINE_CAPABILITIES.md).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
