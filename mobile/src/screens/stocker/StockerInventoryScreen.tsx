import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { showSettingsComingSoonAlert } from '../../utils/comingSoon';

export const StockerInventoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [allProducts, setAllProducts] = React.useState<any[]>([]);
  const [recentProducts, setRecentProducts] = React.useState<any[]>([]);
  const [stockInputs, setStockInputs] = React.useState<Record<string, string>>({});
  const [updatingProductId, setUpdatingProductId] = React.useState<string | null>(null);

  const loadProducts = async () => {
    try {
      const products = await apiRequest<any[]>('/products');
      setAllProducts(products);
      setRecentProducts(products.slice(0, 20).map((product) => ({
        id: String(product.product_id),
        name: product.name,
        sku: product.barcode,
        stock: Number(product.stock || 0),
        category: product.category_name || 'Uncategorized',
        createdAt: product.created_at,
      })));
    } catch {
      setAllProducts([]);
      setRecentProducts([]);
    }
  };

  React.useEffect(() => {
    loadProducts();
  }, []);

  const addStock = async (product: { id: string; name: string }) => {
    const quantity = Number(stockInputs[product.id]);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      Alert.alert('Invalid quantity', 'Enter a whole number greater than zero.');
      return;
    }

    setUpdatingProductId(product.id);
    try {
      await apiRequest(`/products/${product.id}/inventory`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity, action: 'add' }),
      });
      setStockInputs((current) => ({ ...current, [product.id]: '' }));
      await loadProducts();
      Alert.alert('Stock updated', `${quantity} unit(s) added to ${product.name}.`);
    } catch (error) {
      Alert.alert('Stock update failed', error instanceof Error ? error.message : 'Unable to update stock.');
    } finally {
      setUpdatingProductId(null);
    }
  };

  const today = new Date().toDateString();
  const stats = {
    totalProducts: allProducts.length,
    lowStock: allProducts.filter((product) => Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 5).length,
    categories: new Set(allProducts.map((product) => product.category_name || 'Uncategorized')).size,
    addedToday: allProducts.filter((product) => product.created_at && new Date(product.created_at).toDateString() === today).length,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Inventory</Text>
          <Text style={styles.headerSubtitle}>{user?.storeName || 'Store'} — Stocker</Text>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.greetingCard}>
          <Text style={styles.greetingText}>Welcome back, {user?.name || 'User'}!</Text>
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
            onPress={showSettingsComingSoonAlert}
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
            <View style={styles.stockUpdateRow}>
              <TextInput
                value={stockInputs[product.id] || ''}
                onChangeText={(value) => setStockInputs((current) => ({ ...current, [product.id]: value }))}
                placeholder="Qty to add"
                keyboardType="number-pad"
                style={styles.stockInput}
              />
              <TouchableOpacity
                style={styles.addStockButton}
                onPress={() => addStock(product)}
                disabled={updatingProductId === product.id}
              >
                <Text style={styles.addStockButtonText}>{updatingProductId === product.id ? 'Adding...' : 'Add stock'}</Text>
              </TouchableOpacity>
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
  stockUpdateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  stockInput: { flex: 1, backgroundColor: '#F6F7F5', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, color: COLORS.textPrimary, fontSize: 13 },
  addStockButton: { backgroundColor: COLORS.primaryDark, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  addStockButtonText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
});
