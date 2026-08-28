import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../constants/theme';
import { StockerInventoryScreen } from '../screens/stocker/StockerInventoryScreen';
import { StockerDashboardScreen } from '../screens/stocker/StockerDashboardScreen';
import { StockerProfileScreen } from '../screens/stocker/StockerProfileScreen';

const Tab = createBottomTabNavigator();

export const StockerTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Inventory"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primaryDark,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Inventory"
        component={StockerInventoryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>📦</Text>
          ),
        }}
      />
      <Tab.Screen
        name="AddProduct"
        component={StockerDashboardScreen}
        options={{
          tabBarLabel: 'Add Product',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>➕</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={StockerProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
    paddingBottom: 6,
    minHeight: 60,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
});
