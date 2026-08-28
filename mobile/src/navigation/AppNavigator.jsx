// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Reorganized Screens
import { WelcomeScreen } from '../screens/common/WelcomeScreen';
import { LoginScreen } from '../screens/common/LoginScreen';
import { ScanItemScreen } from '../screens/common/ScanItemScreen';
import { TaxRateSettingsScreen } from '../screens/common/TaxRateSettingsScreen';

import { CashierTabNavigator } from './CashierTabNavigator';
import { CartReviewScreen } from '../screens/cashier/CartReviewScreen';
import { PaymentScreen } from '../screens/cashier/PaymentScreen';
import { ReceiptConfirmationScreen } from '../screens/cashier/ReceiptConfirmationScreen';
import { TransactionHistoryScreen } from '../screens/cashier/TransactionHistoryScreen';

import { SecurityScanOutputScreen } from '../screens/guard/SecurityScanOutputScreen';
import { GuardTabNavigator } from './GuardTabNavigator';

import { StockerTabNavigator } from './StockerTabNavigator';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { role } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {role === null ? (
          // 1. Unauthenticated / Public Stack
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : role === 'cashier' ? (
          // 2. Authenticated Cashier Stack
          <>
            <Stack.Screen name="CashierHome" component={CashierTabNavigator} />
            <Stack.Screen name="CartReview" component={CartReviewScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="ReceiptConfirmation" component={ReceiptConfirmationScreen} />
            <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
            <Stack.Screen name="ScanItem" component={ScanItemScreen} />
            <Stack.Screen name="TaxRateSettings" component={TaxRateSettingsScreen} />
          </>
        ) : role === 'guard' ? (
          // 3. Authenticated Guard Stack
          <>
            <Stack.Screen name="GuardHome" component={GuardTabNavigator} />
            <Stack.Screen name="ScanItem" component={ScanItemScreen} />
            <Stack.Screen name="SecurityScanOutput" component={SecurityScanOutputScreen} />
            <Stack.Screen name="TaxRateSettings" component={TaxRateSettingsScreen} />
          </>
        ) : (
          // 4. Authenticated Stocker Stack
          <>
            <Stack.Screen name="StockerHome" component={StockerTabNavigator} />
            <Stack.Screen name="ScanItem" component={ScanItemScreen} />
            <Stack.Screen name="TaxRateSettings" component={TaxRateSettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};