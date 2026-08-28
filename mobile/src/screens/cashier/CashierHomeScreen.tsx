import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, CartItem } from '../../types';
import { COLORS } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import { useTransactions } from '../../context/TransactionContext';

type Props = NativeStackScreenProps<RootStackParamList, 'CashierHome'>;

export const CashierHomeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taxRate } = useSettings();
  const { pendingScannedItem, clearPendingScannedItem } = useTransactions();
  const insets = useSafeAreaInsets();

  // Active Cart State
  const [cart, setCart] = useState<CartItem[]>([
    { id: '1', name: 'Classic T-Shirt - Red/M', price: 14.99, quantity: 2, sku: 'TS-001' },
    { id: '2', name: 'Baseball Cap - Black', price: 15.00, quantity: 1, sku: 'CP-002' }
  ]);

  // Customer Info State
  const [customerInput, setCustomerInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isCustomerAdded, setIsCustomerAdded] = useState(false);

  // Manual SKU State
  const [skuInput, setSkuInput] = useState('');

  // Discount / Promo State
  const [discountType, setDiscountType] = useState<'Percentage' | 'Fixed Amount' | 'Promo Code'>('Percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountExpanded, setDiscountExpanded] = useState(false);

  // Printer connection status dot
  const [printerOnline, setPrinterOnline] = useState(true);

  // 1. Listen for scanned items pushed from ScanItemScreen via context
  useEffect(() => {
    if (pendingScannedItem) {
      const newItem = pendingScannedItem;
      setCart((prevCart) => {
        const existing = prevCart.find((item) => item.id === newItem.id || item.name === newItem.name);
        if (existing) {
          return prevCart.map((item) =>
            item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prevCart, { ...newItem, quantity: 1, sku: newItem.sku || 'SC-' + Date.now().toString().slice(-4) }];
      });
      clearPendingScannedItem();
    }
  }, [pendingScannedItem]);

  // Quantity handlers
  const incrementQty = (id: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const decrementQty = (id: string) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity - 1;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const deleteItem = (id: string) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item from the cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setCart((prev) => prev.filter((item) => item.id !== id)),
      },
    ]);
  };

  // Add Manual Item by SKU
  const handleAddManualSku = () => {
    const raw = skuInput.trim().toLowerCase();
    if (!raw) return;

    let newItem: CartItem;
    if (raw.includes('shirt') || raw === '1') {
      newItem = { id: '1', name: 'Classic T-Shirt - Red/M', price: 14.99, quantity: 1, sku: 'TS-001' };
    } else if (raw.includes('cap') || raw === '2') {
      newItem = { id: '2', name: 'Baseball Cap - Black', price: 15.00, quantity: 1, sku: 'CP-002' };
    } else if (raw.includes('dress') || raw === '3') {
      newItem = { id: '3', name: 'Ankara Wrap Dress (M)', price: 42.00, quantity: 1, sku: 'WD-003' };
    } else {
      newItem = {
        id: Date.now().toString(),
        name: `Item SKU: ${skuInput.toUpperCase()}`,
        price: 25.00,
        quantity: 1,
        sku: skuInput.toUpperCase()
      };
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.sku === newItem.sku);
      if (existing) {
        return prevCart.map((item) =>
          item.sku === newItem.sku ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, newItem];
    });

    setSkuInput('');
  };

  // Add Customer
  const handleAddCustomer = () => {
    const trimmed = customerInput.trim();
    if (!trimmed) {
      setIsCustomerAdded(false);
      setCustomerName('');
      setCustomerPhone('');
      return;
    }
    // Simple parse (e.g. "John Smith - +12345")
    if (trimmed.includes('-')) {
      const [name, phone] = trimmed.split('-');
      setCustomerName(name.trim());
      setCustomerPhone(phone.trim());
    } else {
      setCustomerName(trimmed);
      setCustomerPhone('+1234567890'); // fallback phone
    }
    setIsCustomerAdded(true);
    Alert.alert('Customer added', `Assigned: ${trimmed}`);
  };

  // Apply Discount
  const handleApplyDiscount = () => {
    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      setAppliedDiscount(0);
      setDiscountValue('');
      Alert.alert('Discount reset', 'Discount removed.');
      return;
    }

    setAppliedDiscount(val);
    Alert.alert('Discount applied', `Added discount of type: ${discountType}`);
  };

  // Dynamic calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * taxRate;
  
  // Calculate discount amount
  let discountAmount = 0;
  if (appliedDiscount > 0) {
    if (discountType === 'Percentage') {
      discountAmount = subtotal * (appliedDiscount / 100);
    } else if (discountType === 'Fixed Amount') {
      discountAmount = appliedDiscount;
    } else {
      // Promo code mock
      discountAmount = 10.00; // Flat promo rate
    }
  }

  const total = Math.max(0, subtotal + tax - discountAmount);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigation.navigate('CartReview', {
      cartItems: cart,
      customerName: isCustomerAdded ? customerName : undefined,
      customerPhone: isCustomerAdded ? customerPhone : undefined,
      discount: appliedDiscount > 0 ? discountAmount : undefined,
      discountType: appliedDiscount > 0 ? discountType : undefined,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* A. Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Store #01</Text>
          <Text style={styles.headerSubtitle}>Cashier: Jane Doe</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setPrinterOnline(!printerOnline)}>
            <Text style={styles.printerIcon}>🖨️</Text>
          </TouchableOpacity>
          <View style={[styles.statusDot, { backgroundColor: printerOnline ? COLORS.successGreen : COLORS.accentOrange }]} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View>
              {/* B. Scanner / Input Section */}
              <View style={styles.card}>
                <View style={styles.scannerFabContainer}>
                  <TouchableOpacity
                    style={styles.scannerFab}
                    onPress={() => navigation.navigate('ScanItem', { scanContext: 'cashier' })}
                  >
                    <Text style={styles.scannerFabIcon}>📷</Text>
                  </TouchableOpacity>
                  <Text style={styles.scannerFabLabel}>Tap to Scan</Text>
                </View>
                <Text style={styles.dividerText}>- OR -</Text>
                <View style={styles.manualEntryRow}>
                  <TextInput
                    style={styles.manualInput}
                    placeholder="Type SKU or Barcode Number"
                    placeholderTextColor={COLORS.textMuted}
                    value={skuInput}
                    onChangeText={setSkuInput}
                    onSubmitEditing={handleAddManualSku}
                  />
                  <TouchableOpacity style={styles.manualAddBtn} onPress={handleAddManualSku}>
                    <Text style={styles.manualAddBtnText}>ADD</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* C. Customer Info Section */}
              <View style={[styles.card, { paddingVertical: 12 }]}>
                <Text style={styles.cardLabel}>Customer (Optional)</Text>
                <View style={styles.customerRow}>
                  <TextInput
                    style={styles.customerInput}
                    placeholder="e.g. John Smith - +12345"
                    placeholderTextColor={COLORS.textMuted}
                    value={customerInput}
                    onChangeText={setCustomerInput}
                  />
                  <TouchableOpacity style={styles.customerBtn} onPress={handleAddCustomer}>
                    <Text style={styles.customerBtnText}>
                      {isCustomerAdded ? 'REMOVE' : 'ADD CUSTOMER'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {isCustomerAdded && (
                  <Text style={styles.addedCustomerTag}>
                    ✓ Customer Assigned: {customerName} ({customerPhone})
                  </Text>
                )}
              </View>

              {/* Cart Header */}
              <View style={styles.cartHeaderContainer}>
                <Text style={styles.cartHeaderText}>Current Cart</Text>
                <Text style={styles.cartHeaderBadge}>({cart.length} items)</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.cartItemRow}>
              {/* Left: Product Name & SKU */}
              <View style={styles.cartItemLeft}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemSku}>SKU: {item.sku}</Text>
              </View>

              {/* Middle: Quantity Adjusters */}
              <View style={styles.qtyControls}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => decrementQty(item.id)}>
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyVal}>{item.quantity}</Text>
                <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnPlus]} onPress={() => incrementQty(item.id)}>
                  <Text style={[styles.qtyBtnText, { color: '#FFF' }]}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Right: Total Price & Delete Fallback */}
              <View style={styles.cartItemRight}>
                <Text style={styles.cartItemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteItem(item.id)}>
                  <Text style={styles.deleteBtnIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyCartIcon}>🛒</Text>
              <Text style={styles.emptyCartText}>No items scanned. Start scanning!</Text>
            </View>
          }
          ListFooterComponent={
            <View style={{ marginBottom: 120 }}>
              {/* E. Discount / Promo Section */}
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.discountHeader}
                  onPress={() => setDiscountExpanded(!discountExpanded)}
                >
                  <Text style={styles.discountHeaderTitle}>💵 Add Discount or Promo</Text>
                  <Text style={styles.discountHeaderArrow}>{discountExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {discountExpanded && (
                  <View style={styles.discountContent}>
                    <View style={styles.discountTypeGroup}>
                      <TouchableOpacity
                        style={[styles.discountTypeBtn, discountType === 'Percentage' && styles.discountTypeBtnActive]}
                        onPress={() => setDiscountType('Percentage')}
                      >
                        <Text style={[styles.discountTypeText, discountType === 'Percentage' && styles.discountTypeTextActive]}>
                          % Ratio
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.discountTypeBtn, discountType === 'Fixed Amount' && styles.discountTypeBtnActive]}
                        onPress={() => setDiscountType('Fixed Amount')}
                      >
                        <Text style={[styles.discountTypeText, discountType === 'Fixed Amount' && styles.discountTypeTextActive]}>
                          Fixed $
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.discountTypeBtn, discountType === 'Promo Code' && styles.discountTypeBtnActive]}
                        onPress={() => setDiscountType('Promo Code')}
                      >
                        <Text style={[styles.discountTypeText, discountType === 'Promo Code' && styles.discountTypeTextActive]}>
                          Promo
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.discountInputRow}>
                      <TextInput
                        style={styles.discountInput}
                        keyboardType="numeric"
                        placeholder={discountType === 'Promo Code' ? 'Enter promo code' : '0.00'}
                        placeholderTextColor={COLORS.textMuted}
                        value={discountValue}
                        onChangeText={setDiscountValue}
                      />
                      <TouchableOpacity style={styles.discountApplyBtn} onPress={handleApplyDiscount}>
                        <Text style={styles.discountApplyBtnText}>APPLY</Text>
                      </TouchableOpacity>
                    </View>

                    {appliedDiscount > 0 && (
                      <Text style={styles.appliedDiscountTag}>
                        ✓ Applied: {discountType === 'Percentage' ? `${appliedDiscount}% Off` : `$${appliedDiscount} Off`}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          }
        />
      </KeyboardAvoidingView>

      {/* F. Bottom Fixed Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={styles.footerTopRow}>
          <View>
            <Text style={styles.footerLabel}>Subtotal</Text>
            <Text style={styles.footerValue}>${subtotal.toFixed(2)}</Text>
          </View>
          {discountAmount > 0 && (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.footerLabel}>Discount</Text>
              <Text style={[styles.footerValue, { color: COLORS.errorRed }]}>-${discountAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.footerLabel}>Tax (VAT {(taxRate * 100).toFixed(1)}%)</Text>
            <Text style={styles.footerValue}>${tax.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.footerDivider} />

        <View style={styles.footerBottomRow}>
          <View>
            <Text style={styles.totalLabel}>TOTAL DUE</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutBtn, cart.length === 0 && styles.checkoutBtnDisabled]}
            disabled={cart.length === 0}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutBtnText}>CHECKOUT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  headerSubtitle: { color: '#E0E0E0', fontSize: 12, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  printerIcon: { fontSize: 20 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scannerFabContainer: { alignItems: 'center', marginVertical: 8 },
  scannerFab: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accentOrange,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accentOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  scannerFabIcon: { fontSize: 32, color: '#FFF' },
  scannerFabLabel: { color: COLORS.textSecondary, fontWeight: '600', marginTop: 8, fontSize: 13 },
  dividerText: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12, marginVertical: 12 },
  manualEntryRow: { flexDirection: 'row', gap: 8 },
  manualInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  manualAddBtn: {
    borderWidth: 1,
    borderColor: COLORS.primaryDark,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  manualAddBtnText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: 14 },
  cardLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 },
  customerRow: { flexDirection: 'row', gap: 8 },
  customerInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  customerBtn: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
  customerBtnText: { color: COLORS.primaryDark, fontSize: 13, fontWeight: '700' },
  addedCustomerTag: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '600', marginTop: 8 },
  cartHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  cartHeaderText: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  cartHeaderBadge: { fontSize: 14, color: COLORS.textMuted },
  cartItemRow: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  cartItemLeft: { flex: 1.5 },
  cartItemName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  cartItemSku: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  qtyBtnPlus: { backgroundColor: COLORS.accentOrange, borderColor: COLORS.accentOrange },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary },
  qtyVal: { fontSize: 16, fontWeight: '700', minWidth: 20, textAlign: 'center', color: COLORS.textPrimary },
  cartItemRight: { flex: 1, alignItems: 'flex-end', gap: 6 },
  cartItemPrice: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark },
  deleteBtn: { padding: 4 },
  deleteBtnIcon: { fontSize: 16 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyCartIcon: { fontSize: 44, color: COLORS.textMuted, marginBottom: 8 },
  emptyCartText: { color: COLORS.textMuted, fontSize: 14 },
  discountHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  discountHeaderTitle: { color: COLORS.textSecondary, fontWeight: '700' },
  discountHeaderArrow: { color: COLORS.textMuted },
  discountContent: { marginTop: 14, gap: 12 },
  discountTypeGroup: { flexDirection: 'row', gap: 6 },
  discountTypeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  discountTypeBtnActive: { backgroundColor: '#E8F5E9', borderColor: COLORS.primaryDark },
  discountTypeText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  discountTypeTextActive: { color: COLORS.primaryDark, fontWeight: '700' },
  discountInputRow: { flexDirection: 'row', gap: 8 },
  discountInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  discountApplyBtn: {
    backgroundColor: COLORS.accentOrange,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  discountApplyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  appliedDiscountTag: { color: COLORS.successGreen, fontSize: 12, fontWeight: '600' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 2,
    borderTopColor: COLORS.accentOrange,
    paddingHorizontal: 16,
    paddingTop: 10,
    // paddingBottom is applied inline using useSafeAreaInsets
  },
  footerTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  footerLabel: { fontSize: 11, color: COLORS.textMuted },
  footerValue: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginTop: 2 },
  footerDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  footerBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  totalValue: { fontSize: 24, fontWeight: '700', color: COLORS.primaryDark },
  checkoutBtn: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutBtnDisabled: { backgroundColor: '#A0C4B8', opacity: 0.5 },
  checkoutBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
