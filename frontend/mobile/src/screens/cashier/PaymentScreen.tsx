import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Transaction, CartItem } from '../../types';
import { COLORS } from '../../constants/theme';
import { useTransactions } from '../../context/TransactionContext';
import { useSettings } from '../../context/SettingsContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;
type PaymentMethod = 'Cash' | 'Credit/Debit Card' | 'Mobile Payment' | 'Split Payment';

export const PaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { addTransaction } = useTransactions();
  const { taxRate } = useSettings();

  const {
    cartItems = [],
    customerName,
    customerPhone,
    discount = 0,
    totalAmount = 0,
  } = route.params ?? {};

  // Payment states
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Cash');
  const [cashTendered, setCashTendered] = useState('');
  
  // Terminal connection state for Credit/Debit
  const [terminalStatus, setTerminalStatus] = useState<'idle' | 'waiting' | 'connected'>('idle');

  // Exact amount and math
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * taxRate;

  // Tender handlers
  const handleQuickAdd = (amount: number) => {
    const current = parseFloat(cashTendered) || 0;
    setCashTendered((current + amount).toFixed(2));
  };

  const setExactAmount = () => {
    setCashTendered(totalAmount.toFixed(2));
  };

  const calculatedChange = Math.max(
    0,
    (parseFloat(cashTendered) || 0) - totalAmount
  );

  const handleConnectTerminal = () => {
    setTerminalStatus('waiting');
    // Simulate terminal search and connection in 1.2s
    setTimeout(() => {
      setTerminalStatus('connected');
    }, 1200);
  };

  const handleCompletePayment = () => {
    // Validate Cash
    if (selectedMethod === 'Cash') {
      const tenderedVal = parseFloat(cashTendered) || 0;
      if (tenderedVal < totalAmount) {
        Alert.alert('Incomplete Payment', 'Cash tendered is less than the total amount due.');
        return;
      }
    }

    // Validate Card
    if (selectedMethod === 'Credit/Debit Card' && terminalStatus !== 'connected') {
      Alert.alert('Terminal Offline', 'Please connect the card terminal before completing payment.');
      return;
    }

    // Generate Transaction
    const txId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ' - ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newTx: Transaction = {
      id: txId,
      dateTime: formattedDate,
      paymentMethod: selectedMethod,
      items: cartItems,
      subtotal,
      tax,
      discount,
      total: totalAmount,
      change: selectedMethod === 'Cash' ? calculatedChange : 0,
      status: 'Pending Exit',
      customerName,
      customerPhone,
    };

    addTransaction(newTx);
    navigation.navigate('ReceiptConfirmation', { transactionId: txId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <Text style={styles.headerRightText}>Step 2 of 2</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* B. Amount Display */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Amount Due</Text>
            <Text style={styles.amountValue}>${totalAmount.toFixed(2)}</Text>
          </View>

          {/* C. Payment Method Selection */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Select Payment Method</Text>

            {/* Cash Method */}
            <TouchableOpacity
              style={[styles.methodItem, selectedMethod === 'Cash' && styles.methodItemActive]}
              onPress={() => setSelectedMethod('Cash')}
            >
              <Text style={styles.methodIcon}>💵</Text>
              <View style={styles.methodTextContainer}>
                <Text style={styles.methodTitle}>Cash</Text>
                <Text style={styles.methodSubtitle}>Pay with physical cash</Text>
              </View>
              <View style={[styles.radioButton, selectedMethod === 'Cash' && styles.radioButtonActive]} />
            </TouchableOpacity>

            {/* Credit/Debit Card Method */}
            <TouchableOpacity
              style={[styles.methodItem, selectedMethod === 'Credit/Debit Card' && styles.methodItemActive]}
              onPress={() => setSelectedMethod('Credit/Debit Card')}
            >
              <Text style={styles.methodIcon}>💳</Text>
              <View style={styles.methodTextContainer}>
                <Text style={styles.methodTitle}>Credit / Debit Card</Text>
                <Text style={styles.methodSubtitle}>Pay with card (terminal required)</Text>
              </View>
              <View style={[styles.radioButton, selectedMethod === 'Credit/Debit Card' && styles.radioButtonActive]} />
            </TouchableOpacity>

            {/* Mobile Payment Method */}
            <TouchableOpacity
              style={[styles.methodItem, selectedMethod === 'Mobile Payment' && styles.methodItemActive]}
              onPress={() => setSelectedMethod('Mobile Payment')}
            >
              <Text style={styles.methodIcon}>📱</Text>
              <View style={styles.methodTextContainer}>
                <Text style={styles.methodTitle}>Mobile Payment</Text>
                <Text style={styles.methodSubtitle}>Pay with QR Code or NFC</Text>
              </View>
              <View style={[styles.radioButton, selectedMethod === 'Mobile Payment' && styles.radioButtonActive]} />
            </TouchableOpacity>

            {/* Split Payment Method */}
            <TouchableOpacity
              style={[styles.methodItem, selectedMethod === 'Split Payment' && styles.methodItemActive]}
              onPress={() => setSelectedMethod('Split Payment')}
            >
              <Text style={styles.methodIcon}>🔀</Text>
              <View style={styles.methodTextContainer}>
                <Text style={styles.methodTitle}>Split Payment</Text>
                <Text style={styles.methodSubtitle}>Combine multiple payment methods</Text>
              </View>
              <View style={[styles.radioButton, selectedMethod === 'Split Payment' && styles.radioButtonActive]} />
            </TouchableOpacity>
          </View>

          {/* D. Cash Payment Details (Conditional) */}
          {selectedMethod === 'Cash' && (
            <View style={styles.card}>
              <Text style={styles.detailsLabel}>Cash Tendered</Text>
              <View style={styles.tenderInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.tenderInput}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  value={cashTendered}
                  onChangeText={setCashTendered}
                />
              </View>

              {/* Quick Amount Buttons */}
              <View style={styles.quickAmountRow}>
                <TouchableOpacity style={styles.quickBtn} onPress={setExactAmount}>
                  <Text style={styles.quickBtnText}>Exact Amount</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickBtn} onPress={() => handleQuickAdd(10)}>
                  <Text style={styles.quickBtnText}>+$10</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickBtn} onPress={() => handleQuickAdd(20)}>
                  <Text style={styles.quickBtnText}>+$20</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickBtn} onPress={() => handleQuickAdd(50)}>
                  <Text style={styles.quickBtnText}>+$50</Text>
                </TouchableOpacity>
              </View>

              {/* Change Display */}
              <View style={styles.changeContainer}>
                <Text style={styles.changeLabel}>Change Due:</Text>
                <Text style={styles.changeValue}>${calculatedChange.toFixed(2)}</Text>
              </View>
            </View>
          )}

          {/* E. Card Payment Details (Conditional) */}
          {selectedMethod === 'Credit/Debit Card' && (
            <View style={styles.card}>
              <Text style={styles.detailsLabel}>Card Terminal</Text>
              <Text
                style={[
                  styles.terminalStatusText,
                  terminalStatus === 'connected' && { color: COLORS.successGreen },
                ]}
              >
                {terminalStatus === 'idle'
                  ? 'Terminal disconnected.'
                  : terminalStatus === 'waiting'
                  ? 'Searching for terminal...'
                  : '🟢 Connected. Ready to swipe / tap card.'}
              </Text>
              {terminalStatus !== 'connected' && (
                <TouchableOpacity
                  style={[
                    styles.terminalConnectBtn,
                    terminalStatus === 'waiting' && { backgroundColor: COLORS.textMuted },
                  ]}
                  disabled={terminalStatus === 'waiting'}
                  onPress={handleConnectTerminal}
                >
                  <Text style={styles.terminalConnectText}>
                    {terminalStatus === 'waiting' ? 'CONNECTING...' : 'CONNECT TERMINAL'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Mobile Payment Placeholder (Conditional) */}
          {selectedMethod === 'Mobile Payment' && (
            <View style={styles.card}>
              <Text style={styles.detailsLabel}>Mobile Payment QR</Text>
              <Text style={styles.terminalStatusText}>
                Display transaction QR code on terminal screen. Awaiting scan...
              </Text>
            </View>
          )}

          {/* Split Payment Placeholder (Conditional) */}
          {selectedMethod === 'Split Payment' && (
            <View style={styles.card}>
              <Text style={styles.detailsLabel}>Split payment details</Text>
              <Text style={styles.terminalStatusText}>
                Configure amounts for multiple checkout methods.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* F. Action Buttons (Bottom Fixed) */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelBtnText}>CANCEL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.completeBtn,
            selectedMethod === 'Credit/Debit Card' && terminalStatus !== 'connected' && styles.completeBtnDisabled,
          ]}
          disabled={selectedMethod === 'Credit/Debit Card' && terminalStatus !== 'connected'}
          onPress={handleCompletePayment}
        >
          <Text style={styles.completeBtnText}>COMPLETE PAYMENT</Text>
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
    alignItems: 'center',
  },
  backBtn: { paddingRight: 16 },
  backBtnText: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', flex: 1 },
  headerRightText: { color: '#E0E0E0', fontSize: 12 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  amountCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 14,
  },
  amountLabel: { fontSize: 14, color: COLORS.textSecondary },
  amountValue: { fontSize: 32, fontWeight: '700', color: COLORS.primaryDark, marginTop: 4 },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    marginTop: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  methodItemActive: { backgroundColor: '#F0FDF4', borderRadius: 8, paddingHorizontal: 8 },
  methodIcon: { fontSize: 24, marginRight: 12 },
  methodTextContainer: { flex: 1 },
  methodTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  methodSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  radioButtonActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.primaryDark,
  },
  detailsLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  tenderInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  currencySymbol: { fontSize: 20, fontWeight: '700', color: COLORS.textSecondary },
  tenderInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  quickAmountRow: { flexDirection: 'row', gap: 6, marginTop: 12 },
  quickBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  quickBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  changeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  changeLabel: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  changeValue: { fontSize: 20, fontWeight: '700', color: COLORS.primaryDark },
  terminalStatusText: { fontSize: 14, color: COLORS.accentOrange, marginBottom: 12 },
  terminalConnectBtn: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  terminalConnectText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderColor: COLORS.errorRed,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.errorRed, fontWeight: '700', fontSize: 14 },
  completeBtn: {
    flex: 1.8,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  completeBtnDisabled: { backgroundColor: '#A0C4B8', opacity: 0.5 },
  completeBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
