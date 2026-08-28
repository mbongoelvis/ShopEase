import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, CartItem } from '../../types';
import { COLORS } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';

type Props = NativeStackScreenProps<RootStackParamList, 'CartReview'>;

export const CartReviewScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taxRate } = useSettings();
  const { cartItems = [], customerName, customerPhone, discount = 0, discountType } = route.params ?? {};

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * taxRate;
  const total = Math.max(0, subtotal + tax - discount);

  const handleEditCart = () => {
    navigation.goBack();
  };

  const handleProceedToPayment = () => {
    navigation.navigate('Payment', {
      cartItems,
      customerName,
      customerPhone,
      discount,
      discountType,
      totalAmount: total,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* A. Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleEditCart} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Order</Text>
        <Text style={styles.headerRightText}>Step 1 of 2</Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View>
            {/* B. Cart Summary Section */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Cart Summary</Text>
                <Text style={styles.cardSubtitle}>({cartItems.length} items)</Text>
              </View>
              <View style={styles.divider} />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.summaryItemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQty}>x{item.quantity}</Text>
            </View>
            <Text style={styles.itemSubtotal}>${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.itemDivider} />}
        ListFooterComponent={
          <View style={{ marginTop: 14 }}>
            {/* C. Price Breakdown */}
            <View style={styles.card}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Subtotal</Text>
                <Text style={styles.breakdownValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Tax (VAT {(taxRate * 100).toFixed(1)}%)</Text>
                <Text style={styles.breakdownValue}>${tax.toFixed(2)}</Text>
              </View>
              {discount > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, { color: COLORS.errorRed }]}>Discount</Text>
                  <Text style={[styles.breakdownValue, { color: COLORS.errorRed }]}>-${discount.toFixed(2)}</Text>
                </View>
              )}
              <View style={[styles.divider, { marginVertical: 12 }]} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
            </View>

            {/* D. Customer Info (Read Only) */}
            <View style={[styles.card, { marginTop: 14 }]}>
              <Text style={styles.customerLabel}>Customer</Text>
              <Text style={styles.customerValue}>
                {customerName ? `${customerName} - ${customerPhone}` : 'Walk-in Customer'}
              </Text>
            </View>
          </View>
        }
      />

      {/* E. Action Buttons (Bottom Fixed) */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.editBtn} onPress={handleEditCart}>
          <Text style={styles.editBtnText}>EDIT CART</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.payBtn} onPress={handleProceedToPayment}>
          <Text style={styles.payBtnText}>PROCEED TO PAYMENT</Text>
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
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  cardSubtitle: { fontSize: 14, color: COLORS.textMuted },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  summaryItemRow: {
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  itemName: { fontSize: 14, color: COLORS.textPrimary, flex: 1 },
  itemQty: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
  itemSubtotal: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark },
  itemDivider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  breakdownLabel: { fontSize: 14, color: COLORS.textSecondary },
  breakdownValue: { fontSize: 14, color: COLORS.textPrimary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  totalValue: { fontSize: 20, fontWeight: '700', color: COLORS.primaryDark },
  customerLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  customerValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
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
  editBtn: {
    flex: 1,
    borderColor: COLORS.primaryDark,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  editBtnText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: 14 },
  payBtn: {
    flex: 1.8,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  payBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
