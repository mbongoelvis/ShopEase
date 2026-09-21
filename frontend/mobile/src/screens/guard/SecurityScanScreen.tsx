// src/screens/SecurityGuardScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { COLORS } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SecurityGuardFlow'>;

export const SecurityGuardScreen: React.FC<Props> = ({ navigation }) => {

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerUser}>Peter M. · Buea Town</Text>
          <TouchableOpacity
            style={styles.avatar}>
            <Text style={styles.avatarText}>PM</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centerContent}>
          <Text style={styles.centerIcon}>🔍</Text>
          <Text style={styles.centerTitle}>Exit Verification</Text>
          <Text style={styles.centerSubtitle}>Scan a customer's receipt QR code to verify their purchase before exit.</Text>

          <TouchableOpacity
            style={styles.scanQrBtn}
            onPress={() => navigation.navigate('ScanItem', { scanContext: 'guard' })}
          >
            <Text style={styles.scanQrText}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#FFF',
  },
  headerUser: { fontSize: 16, color: COLORS.textPrimary, fontWeight: '700' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  centerIcon: { fontSize: 56, marginBottom: 16 },
  centerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  centerSubtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  scanQrBtn: {
    backgroundColor: COLORS.accentOrange,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  scanQrText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});