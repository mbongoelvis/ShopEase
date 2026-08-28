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
import { useTransactions } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';

export const CashierDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { transactions, getStats } = useTransactions();
  const { role } = useAuth();
  const stats = getStats();

  const recentTransactions = transactions.slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Store #01 — Cashier</Text>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Greeting */}
        <View style={styles.greetingCard}>
          <Text style={styles.greetingText}>Welcome back, Jane!</Text>
          <Text style={styles.greetingSubtext}>Here's your sales summary for today.</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today's Sales</Text>
            <Text style={[styles.statValue, { color: COLORS.primaryDark }]}>
              ${stats.totalSales.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Transactions</Text>
            <Text style={[styles.statValue, { color: COLORS.accentOrange }]}>
              {stats.count}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg. Value</Text>
            <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>
              ${stats.avgValue.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('TransactionHistory')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionLabel}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('TaxRateSettings')}
          >
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionLabel}>Tax Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions yet today.</Text>
          </View>
        ) : (
          recentTransactions.map((tx) => (
            <View key={tx.id} style={styles.txCard}>
              <View style={styles.txTop}>
                <Text style={styles.txId}>{tx.id}</Text>
                <Text style={styles.txAmount}>${tx.total.toFixed(2)}</Text>
              </View>
              <View style={styles.txBottom}>
                <Text style={styles.txMeta}>
                  {tx.items.length} item{tx.items.length !== 1 ? 's' : ''} • {tx.paymentMethod}
                </Text>
                <Text
                  style={[
                    styles.txStatus,
                    tx.status === 'Collected' && { color: COLORS.successGreen },
                    tx.status === 'Pending Exit' && { color: COLORS.accentOrange },
                    tx.status === 'Discrepancy — Held' && { color: COLORS.errorRed },
                  ]}
                >
                  {tx.status === 'Collected' ? '🟢' : tx.status === 'Pending Exit' ? '🟠' : '🔴'} {tx.status}
                </Text>
              </View>
            </View>
          ))
        )}
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
  txCard: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  txTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txId: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark },
  txAmount: { fontSize: 16, fontWeight: '700', color: COLORS.accentOrange },
  txBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  txMeta: { fontSize: 12, color: COLORS.textMuted },
  txStatus: { fontSize: 11, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
});
