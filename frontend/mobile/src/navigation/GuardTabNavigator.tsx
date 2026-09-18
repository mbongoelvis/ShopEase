import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../constants/theme';
import { GuardDashboardScreen } from '../screens/guard/GuardDashboardScreen';
import { SecurityGuardScreen } from '../screens/guard/SecurityScanScreen';
import { GuardProfileScreen } from '../screens/guard/GuardProfileScreen';

const Tab = createBottomTabNavigator();

export const GuardTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primaryDark,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={GuardDashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Scan"
        component={SecurityGuardScreen}
        options={{
          tabBarLabel: 'Verify',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>🔍</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={GuardProfileScreen}
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
