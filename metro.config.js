const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add web-specific resolver for AsyncStorage
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.alias = {
  ...config.resolver.alias,
  '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/utils/asyncStoragePolyfill.web.ts'),
};

// Platform-specific extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.ts', 'web.tsx'];

module.exports = config;