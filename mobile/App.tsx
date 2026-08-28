// App.tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { TransactionProvider } from './src/context/TransactionContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SettingsProvider>
          <TransactionProvider>
            <AppNavigator />
          </TransactionProvider>
        </SettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}