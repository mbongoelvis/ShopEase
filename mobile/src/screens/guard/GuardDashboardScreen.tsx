import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

export const GuardDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const stats = {
    scannedToday: 18,
    flagged: 2,
    cleared: 16,
  };

  const recentScans = [
    { id: 'TXN-0041', time: '2:35 PM', items: 3, status: 'Collected' as const },
    { id: 'TXN-0040', time: '2:12 PM', items: 5, status: 'Collected' as const },
    { id: 'TXN-0039', time: '1:58 PM', items: 2, status: 'Discrepancy — Held' as const },
    { id: 'TXN-0038', time: '1:30 PM', items: 1, status: 'Collected' as const },
    { id: 'TXN-0037', time: '12:45 PM', items: 4, status: 'Pending Exit' as const },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Buea Town — Security</Text>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.greetingCard}>
          <Text style={styles.greetingText}>Welcome back, Peter!</Text>
          <Text style={styles.greetingSubtext}>Here's your exit verification summary.</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Scanned</Text>
            <Text style={[styles.statValue, { color: COLORS.primaryDark }]}>
              {stats.scannedToday}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Flagged</Text>
            <Text style={[styles.statValue, { color: COLORS.errorRed }]}>
              {stats.flagged}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Cleared</Text>
            <Text style={[styles.statValue, { color: COLORS.successGreen }]}>
              {stats.cleared}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('ScanItem', { scanContext: 'guard' })}
          >
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionLabel}>Scan QR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('TaxRateSettings')}
          >
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionLabel}>Settings</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Recent Verifications</Text>
        {recentScans.map((scan) => (
          <View key={scan.id} style={styles.scanCard}>
            <View style={styles.scanTop}>
              <Text style={styles.scanId}>{scan.id}</Text>
              <Text style={[
                styles.scanStatus,
                scan.status === 'Collected' && { color: COLORS.successGreen },
                scan.status === 'Pending Exit' && { color: COLORS.accentOrange },
                scan.status === 'Discrepancy — Held' && { color: COLORS.errorRed },
              ]}>
                {scan.status === 'Collected' ? '🟢' : scan.status === 'Pending Exit' ? '🟠' : '🔴'} {scan.status}
              </Text>
            </View>
            <View style={styles.scanBottom}>
              <Text style={styles.scanMeta}>{scan.items} item{scan.items !== 1 ? 's' : ''}</Text>
              <Text style={styles.scanTime}>{scan.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  headerSubtitle: { color: '#E0E0E0', fontSize: 12, marginTop: 2 },
  body: { flex: 1 },
  greetingCard: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  greetingText: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  greetingSubtext: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  statValue: { fontSize: 20, fontWeight: '700', marginTop: 6 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: { fontSize: 28 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginTop: 8 },
  scanCard: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scanTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scanId: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark },
  scanStatus: { fontSize: 11, fontWeight: '600' },
  scanBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  scanMeta: { fontSize: 12, color: COLORS.textMuted },
  scanTime: { fontSize: 12, color: COLORS.textMuted },
});
