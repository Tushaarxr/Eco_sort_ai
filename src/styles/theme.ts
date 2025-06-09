import { MD3Theme, DefaultTheme } from 'react-native-paper';
import { COLORS } from './colors';

export const theme: MD3Theme = {
  ...DefaultTheme,
  roundness: 8,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    primaryContainer: COLORS.primaryLight,
    secondary: COLORS.accent,
    secondaryContainer: COLORS.accentLight,
    background: COLORS.background,
    surface: COLORS.surface,
    error: COLORS.error,
    onSurface: COLORS.textPrimary,
    onSurfaceDisabled: COLORS.textDisabled,
    onSurfaceVariant: COLORS.textSecondary,
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};
