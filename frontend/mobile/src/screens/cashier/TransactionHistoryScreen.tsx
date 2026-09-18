import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Transaction } from '../../types';
import { COLORS } from '../../constants/theme';
import { useTransactions } from '../../context/TransactionContext';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionHistory'>;
type FilterTab = 'Today' | 'Yesterday' | 'This Week' | 'This Month';

export const TransactionHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { transactions, getStats } = useTransactions();
  const stats = getStats();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<FilterTab>('Today');
  
  // Modal details state
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filterTabs: FilterTab[] = ['Today', 'Yesterday', 'This Week', 'This Month'];

  // Handle Search and Filter logic
  const filteredTransactions = transactions.filter((tx) => {
    // 1. Search filter
    const matchesSearch =
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.customerName && tx.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.customerPhone && tx.customerPhone.includes(searchQuery));

    if (!matchesSearch) return false;

    // 2. Tab Date Filter
    if (selectedTab === 'Today') {
      return tx.dateTime.includes('Aug 20, 2026');
    }
    if (selectedTab === 'Yesterday') {
      return tx.dateTime.includes('Aug 19, 2026');
    }
    if (selectedTab === 'This Week') {
      // Mock inclusion for demo
      return tx.dateTime.includes('Aug 20, 2026') || tx.dateTime.includes('Aug 19, 2026') || tx.dateTime.includes('Aug 18, 2026');
    }
    // This Month includes all
    return true;
  });

  const handleOpenDetail = (tx: Transaction) => {
    setSelectedTx(tx);
    setModalVisible(true);
  };

  const handleReprintReceipt = () => {
    if (!selectedTx) return;
    setModalVisible(false);
    Alert.alert(
      'Reprinting',
      `Receipt for ${selectedTx.id} has been sent to the Bluetooth printer.`
    );
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isCollected = item.status === 'Collected';
    const isFlagged = item.status === 'Discrepancy — Held';

    return (
      <TouchableOpacity style={styles.txCard} onPress={() => handleOpenDetail(item)}>
        {/* Top Row */}
        <View style={styles.txCardRow}>
          <Text style={styles.txCardId}>#{item.id}</Text>
          <Text style={styles.txCardTime}>{item.dateTime.split('-')[1]?.trim() || item.dateTime}</Text>
          <Text style={styles.txCardTotal}>${item.total.toFixed(2)}</Text>
        </View>

        {/* Middle Row */}
        <View style={[styles.txCardRow, { marginTop: 8 }]}>
          <Text style={styles.txCardSub}>{item.items.reduce((sum, i) => sum + i.quantity, 0)} items · {item.paymentMethod}</Text>
          {item.customerName ? (
            <Text style={styles.txCardSub}>{item.customerName}</Text>
          ) : (
            <Text style={styles.txCardSub}>Walk-in</Text>
          )}
        </View>

        {/* Bottom Row: Status Badge */}
        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.statusBadge,
              isCollected
                ? { backgroundColor: '#E6F4EA' }
                : isFlagged
                ? { backgroundColor: COLORS.errorBg }
                : { backgroundColor: '#FFF3E0' },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                isCollected
                  ? { color: COLORS.successGreen }
                  : isFlagged
                  ? { color: COLORS.errorRed }
                  : { color: COLORS.accentOrange },
              ]}
            >
              {isCollected ? '🟢 Collected' : isFlagged ? '🔴 Flagged' : '🟠 Pending Exit'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* A. Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.headerRight}>
          <Text style={styles.headerStatsLabel}>Today</Text>
          <Text style={styles.headerStatsVal}>${stats.totalSales.toFixed(2)}</Text>
        </View>
      </View>

      {/* B. Filter & Search Bar */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by transaction ID or customer"
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Filter Tabs */}
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {filterTabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, selectedTab === tab && styles.tabBtnActive]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* C. Transaction List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>No transactions found for this period.</Text>
          </View>
        }
      />

      {/* D. Transaction Detail Modal */}
      {selectedTx && (
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <View />
          </Pressable>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Transaction Detail</Text>
                <Text style={styles.modalTxId}>#{selectedTx.id}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>{selectedTx.dateTime}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Customer</Text>
                <Text style={styles.detailValue}>
                  {selectedTx.customerName
                    ? `${selectedTx.customerName} (${selectedTx.customerPhone})`
                    : 'Walk-in Customer'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Method</Text>
                <Text style={styles.detailValue}>{selectedTx.paymentMethod}</Text>
              </View>

              <View style={styles.modalDivider} />

              {/* Itemized List */}
              <Text style={styles.modalSectionTitle}>Items Purchased</Text>
              {selectedTx.items.map((item) => (
                <View key={item.id} style={styles.modalItemRow}>
                  <Text style={styles.modalItemText}>
                    {item.name} <Text style={{ color: COLORS.textMuted }}>x{item.quantity}</Text>
                  </Text>
                  <Text style={styles.modalItemVal}>${(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              ))}

              <View style={styles.modalDivider} />

              {/* Totals */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Subtotal</Text>
                <Text style={styles.detailValue}>${selectedTx.subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tax</Text>
                <Text style={styles.detailValue}>${selectedTx.tax.toFixed(2)}</Text>
              </View>
              {selectedTx.discount > 0 && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: COLORS.errorRed }]}>Discount</Text>
                  <Text style={[styles.detailValue, { color: COLORS.errorRed }]}>-${selectedTx.discount.toFixed(2)}</Text>
                </View>
              )}
              <View style={[styles.detailRow, { marginTop: 6 }]}>
                <Text style={styles.detailTotalLabel}>Total Paid</Text>
                <Text style={styles.detailTotalValue}>${selectedTx.total.toFixed(2)}</Text>
              </View>

              <View style={styles.modalDivider} />

              {/* Exit Status */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Exit Status</Text>
                <Text
                  style={[
                    styles.detailValue,
                    { fontWeight: '700' },
                    selectedTx.status === 'Collected'
                      ? { color: COLORS.successGreen }
                      : selectedTx.status === 'Discrepancy — Held'
                      ? { color: COLORS.errorRed }
                      : { color: COLORS.accentOrange },
                  ]}
                >
                  {selectedTx.status === 'Collected'
                    ? '🟢 Collected'
                    : selectedTx.status === 'Discrepancy — Held'
                    ? '🔴 Held - Discrepancy Flagged'
                    : '🟠 Pending Exit Scan'}
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.modalReprintBtn} onPress={handleReprintReceipt}>
              <Text style={styles.modalReprintText}>REPRINT THIS RECEIPT</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
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
  headerRight: { alignItems: 'flex-end' },
  headerStatsLabel: { color: '#E0E0E0', fontSize: 10 },
  headerStatsVal: { color: COLORS.accentOrange, fontSize: 16, fontWeight: '700', marginTop: 2 },
  searchSection: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  tabsWrapper: { marginTop: 12 },
  tabsScroll: { gap: 16, paddingBottom: 8 },
  tabBtn: {
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: COLORS.accentOrange,
  },
  tabText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#000', fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 40 },
  txCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 10,
  },
  txCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txCardId: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark },
  txCardTime: { fontSize: 12, color: COLORS.textMuted },
  txCardTotal: { fontSize: 16, fontWeight: '700', color: COLORS.accentOrange },
  txCardSub: { fontSize: 12, color: COLORS.textSecondary },
  badgeContainer: { flexDirection: 'row', marginTop: 10 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 10 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 44, color: COLORS.textMuted, marginBottom: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '75%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  modalTxId: { fontSize: 14, fontWeight: '600', color: COLORS.primaryDark, marginTop: 2 },
  modalCloseBtn: { padding: 4 },
  modalCloseText: { fontSize: 20, color: COLORS.textMuted, fontWeight: '600' },
  modalScroll: { paddingBottom: 24 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailLabel: { fontSize: 14, color: COLORS.textMuted },
  detailValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  modalDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  modalSectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8 },
  modalItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  modalItemText: { fontSize: 14, color: COLORS.textPrimary },
  modalItemVal: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },
  detailTotalLabel: { fontSize: 16, fontWeight: '700', color: '#000' },
  detailTotalValue: { fontSize: 18, fontWeight: '700', color: COLORS.primaryDark },
  modalReprintBtn: {
    backgroundColor: COLORS.accentOrange,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  modalReprintText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
