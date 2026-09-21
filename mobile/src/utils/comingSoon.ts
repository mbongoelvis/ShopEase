import { Alert } from 'react-native';

export function showSettingsComingSoonAlert() {
  Alert.alert(
    'Account settings in development',
    'Account settings are still in development and will be available in a later update.',
    [{ text: 'OK' }],
  );
}
