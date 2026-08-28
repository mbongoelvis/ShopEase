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

export const StockerInventoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const stats = {
    totalProducts: 48,
    lowStock: 5,
    categories: 12,
    addedToday: 3,
  };

  const recentProducts = [
    { id: '1', name: 'Summer Dress - Floral/M', sku: 'SD-001', stock: 24, category: 'Dresses' },
    { id: '2', name: 'Leather Belt - Brown', sku: 'LB-002', stock: 8, category: 'Accessories' },
    { id: '3', name: 'Running Shoes - White/42', sku: 'RS-003', stock: 2, category: 'Shoes' },
    { id: '4', name: 'Silk Scarf - Navy', sku: 'SS-004', stock: 15, category: 'Accessories' },
    { id: '5', name: 'Ankara Wrap Dress - L', sku: 'AW-005', stock: 0, category: 'Dresses' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Inventory</Text>
          <Text style={styles.headerSubtitle}>Buea Town — Stocker</Text>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.greetingCard}>
          <Text style={styles.greetingText}>Welcome back, Sophia!</Text>
          <Text style={styles.greetingSubtext}>Here's your inventory overview.</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Products</Text>
            <Text style={[styles.statValue, { color: COLORS.primaryDark }]}>
              {stats.totalProducts}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Low Stock</Text>
            <Text style={[styles.statValue, { color: COLORS.accentOrange }]}>
              {stats.lowStock}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Added Today</Text>
            <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>
              {stats.addedToday}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('TaxRateSettings')}
          >
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionLabel}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('ScanItem', { scanContext: 'stocker' })}
          >
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionLabel}>Quick Scan</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Recent Products</Text>
        {recentProducts.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productTop}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={[
                styles.productStock,
                product.stock === 0 && { color: COLORS.errorRed },
                product.stock > 0 && product.stock <= 5 && { color: COLORS.accentOrange },
                product.stock > 5 && { color: COLORS.successGreen },
              ]}>
                {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
              </Text>
            </View>
            <View style={styles.productBottom}>
              <Text style={styles.productMeta}>SKU: {product.sku}</Text>
              <Text style={styles.productCategory}>{product.category}</Text>
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
  productCard: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  productStock: { fontSize: 12, fontWeight: '600' },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productMeta: { fontSize: 12, color: COLORS.textMuted },
  productCategory: { fontSize: 11, fontWeight: '600', color: COLORS.primaryDark },
});
