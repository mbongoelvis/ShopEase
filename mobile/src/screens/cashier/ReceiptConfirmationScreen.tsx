import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { COLORS } from '../../constants/theme';
import { useTransactions } from '../../context/TransactionContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ReceiptConfirmation'>;

export const ReceiptConfirmationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { transactionId } = route.params ?? {};
  const { getTransaction, getStats } = useTransactions();
  const tx = getTransaction(transactionId || '');
  const stats = getStats();

  const [isReprinting, setIsReprinting] = useState(false);

  // Auto-mock printing alert on screen mount
  useEffect(() => {
    if (tx) {
      console.log(`Printing receipt via Bluetooth for transaction ${tx.id}...`);
    }
  }, [tx]);

  if (!tx) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Transaction not found</Text>
        <TouchableOpacity style={styles.newTxBtn} onPress={() => navigation.navigate('CashierHome')}>
          <Text style={styles.newTxBtnText}>Back to POS Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Generate serialized QR code data
  const qrPayload = JSON.stringify({
    status: 'valid',
    transactionId: tx.id,
    items: tx.items,
  });

  const handleReprintReceipt = () => {
    setIsReprinting(true);
    setTimeout(() => {
      setIsReprinting(false);
      Alert.alert('Success', `Receipt for ${tx.id} has been reprinted successfully.`);
    }, 1000);
  };

  const handleNewTransaction = () => {
    // Reset and navigate back to POS Home
    navigation.navigate('CashierHome');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment Successful!</Text>
        <Text style={styles.headerRightText}>Transaction Complete</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* B. Success Section */}
        <View style={styles.successSection}>
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmarkIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>Receipt sent to printer.</Text>
        </View>

        {/* C. Receipt Summary Card */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptRow}>
            <Text style={styles.txIdText}>#{tx.id}</Text>
            <Text style={styles.dateTimeText}>{tx.dateTime}</Text>
          </View>
          <Text style={styles.receiptLabel}>Payment Method: {tx.paymentMethod}</Text>
          
          <View style={styles.receiptDivider} />

          {/* Itemized list */}
          {tx.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.name} <Text style={styles.itemQty}>x{item.quantity}</Text>
              </Text>
              <Text style={styles.itemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.receiptDivider} />

          <View style={styles.receiptRow}>
            <Text style={styles.receiptTotalLabel}>Total Paid</Text>
            <Text style={styles.receiptTotalVal}>${tx.total.toFixed(2)}</Text>
          </View>
          {tx.change > 0 && (
            <View style={[styles.receiptRow, { marginTop: 4 }]}>
              <Text style={styles.receiptLabel}>Change</Text>
              <Text style={styles.receiptVal}>${tx.change.toFixed(2)}</Text>
            </View>
          )}
        </View>

        {/* D. Security QR Code Section (The "Exit Lock") */}
        <View style={styles.qrCard}>
          <Text style={styles.qrHeader}>🔒 Exit Verification QR Code</Text>
          
          <View style={styles.qrContainer}>
            <Image
              source={{
                uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                  qrPayload
                )}`,
              }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.qrInstruction}>
            Customer must present this QR at the exit for security verification.
          </Text>
          <Text style={styles.qrWarning}>
            This QR is unique and expires immediately upon exit scan.
          </Text>
          
          {/* Dynamic exit status badge from context */}
          <View
            style={[
              styles.statusBadge,
              tx.status === 'Collected'
                ? { backgroundColor: '#E6F4EA' }
                : tx.status === 'Discrepancy — Held'
                ? { backgroundColor: COLORS.errorBg }
                : { backgroundColor: '#FFF3E0' },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                tx.status === 'Collected'
                  ? { color: COLORS.successGreen }
                  : tx.status === 'Discrepancy — Held'
                  ? { color: COLORS.errorRed }
                  : { color: COLORS.accentOrange },
              ]}
            >
              {tx.status === 'Collected'
                ? '🟢 Collected - Exited'
                : tx.status === 'Discrepancy — Held'
                ? '🔴 Flagged - Held'
                : '🟠 Active - Awaiting Exit Scan'}
            </Text>
          </View>
        </View>

        {/* E. Quick Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today's Total</Text>
            <Text style={styles.statValue}>${stats.totalSales.toFixed(2)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Transactions</Text>
            <Text style={[styles.statValue, { color: COLORS.accentOrange }]}>{stats.count}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg. Value</Text>
            <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>
              ${stats.avgValue.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* F. Action Buttons (Bottom Fixed) */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.reprintBtn}
          onPress={handleReprintReceipt}
          disabled={isReprinting}
        >
          <Text style={styles.reprintBtnText}>
            {isReprinting ? 'PRINTING...' : 'REPRINT RECEIPT'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.newTxBtn} onPress={handleNewTransaction}>
          <Text style={styles.newTxBtnText}>NEW TRANSACTION</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyLink}
          onPress={() => navigation.navigate('TransactionHistory')}
        >
          <Text style={styles.historyLinkText}>VIEW TRANSACTION HISTORY</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  headerRightText: { color: '#E0E0E0', fontSize: 12 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 160 },
  errorText: { textAlign: 'center', fontSize: 16, marginTop: 40, color: COLORS.errorRed },
  successSection: { alignItems: 'center', marginTop: 20, marginBottom: 10 },
  checkmarkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmarkIcon: { color: COLORS.successGreen, fontSize: 32, fontWeight: '700' },
  successTitle: { fontSize: 24, fontWeight: '700', color: '#000', textAlign: 'center' },
  successSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4 },
  receiptCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
    padding: 16,
    marginTop: 14,
  },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txIdText: { fontSize: 18, fontWeight: '700', color: COLORS.primaryDark },
  dateTimeText: { fontSize: 12, color: COLORS.textMuted },
  receiptLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 6 },
  receiptVal: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '600' },
  receiptDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  itemName: { fontSize: 14, color: COLORS.textPrimary },
  itemQty: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  itemPrice: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },
  receiptTotalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  receiptTotalVal: { fontSize: 20, fontWeight: '700', color: COLORS.primaryDark },
  qrCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.accentOrange,
    padding: 16,
    marginTop: 14,
    alignItems: 'center',
  },
  qrHeader: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 12 },
  qrContainer: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  qrImage: { width: 160, height: 160 },
  qrInstruction: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', marginHorizontal: 12 },
  qrWarning: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center', marginTop: 4, marginHorizontal: 12 },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 12, marginTop: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: { fontSize: 10, color: COLORS.textMuted, marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    gap: 8,
  },
  reprintBtn: {
    borderColor: COLORS.primaryDark,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  reprintBtnText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: 14 },
  newTxBtn: {
    backgroundColor: COLORS.accentOrange,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  newTxBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  historyLink: { alignItems: 'center', paddingVertical: 4, marginTop: 4 },
  historyLinkText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },
});
