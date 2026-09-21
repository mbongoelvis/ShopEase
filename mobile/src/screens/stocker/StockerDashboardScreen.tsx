import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiRequest, formatXaf, uploadFile } from '../../services/api';
import { showSettingsComingSoonAlert } from '../../utils/comingSoon';
import { getUserInitials } from '../../utils/user';

type Props = NativeStackScreenProps<RootStackParamList, 'StockerDashboard'>;
type Category = { categ_id: string; name: string; base_price: number; tax_rate: number };

export const StockerDashboardScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryPrice, setCategoryPrice] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [saving, setSaving] = useState(false);

  const [categoryOpen, setCategoryOpen] = useState(false);

  const [barcode, setBarcode] = useState('');
  const [productName, setProductName] = useState('');
  const [supplierName, setSupplierName] = useState('');

  const [availableSizes, setAvailableSizes] = useState<string[]>(['S', 'M', 'L']);
  const [availableColors, setAvailableColors] = useState<string[]>(['Red', 'Blue']);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L']);
  const [selectedColors, setSelectedColors] = useState<string[]>(['Red', 'Blue']);

  const [addingSize, setAddingSize] = useState(false);
  const [newSizeText, setNewSizeText] = useState('');

  const [addingColor, setAddingColor] = useState(false);
  const [newColorText, setNewColorText] = useState('');

  const loadCategories = async () => {
    try {
      const response = await apiRequest<Category[]>('/categories');
      setCategories(response);
      setSelectedCategory((current) => current || response[0] || null);
    } catch (error) {
      Alert.alert('Unable to load categories', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (route.params?.scannedBarcode) {
      setBarcode(route.params.scannedBarcode);
      // clear param so it doesn't reapply on re-render
      navigation.setParams({ scannedBarcode: undefined });
    }
  }, [route.params?.scannedBarcode]);

  const onPressCamera = () => {
    navigation.navigate('ScanItem', { scanContext: 'stocker' });
  };

  const addSize = () => {
    const v = newSizeText.trim();
    if (v && !availableSizes.includes(v)) {
      setAvailableSizes((current) => [...current, v]);
      setSelectedSizes((current) => [...current, v]);
    }
    setNewSizeText('');
    setAddingSize(false);
  };

  const addColor = () => {
    const v = newColorText.trim();
    if (v && !availableColors.includes(v)) {
      setAvailableColors((current) => [...current, v]);
      setSelectedColors((current) => [...current, v]);
    }
    setNewColorText('');
    setAddingColor(false);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((current) => current.includes(size) ? current.filter((item) => item !== size) : [...current, size]);
  };

  const toggleColor = (color: string) => {
    setSelectedColors((current) => current.includes(color) ? current.filter((item) => item !== color) : [...current, color]);
  };

  const createCategory = async () => {
    const basePrice = Number(categoryPrice);
    if (!categoryName.trim() || !Number.isFinite(basePrice) || basePrice < 0) {
      Alert.alert('Invalid category', 'Enter a category name and a valid base price in XAF.');
      return;
    }

    setSaving(true);
    try {
      const response = await apiRequest<{ category: Category }>('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: categoryName.trim(), basePrice, taxRate: 0 }),
      });
      setCategories((current) => [...current, response.category].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedCategory(response.category);
      setCategoryName('');
      setCategoryPrice('');
      setCreatingCategory(false);
      Alert.alert('Category created', `${response.category.name} will price new products at ${formatXaf(Number(response.category.base_price))}.`);
    } catch (error) {
      Alert.alert('Category creation failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const createProduct = async () => {
    if (!selectedCategory || !barcode.trim() || !productName.trim()) {
      Alert.alert('Missing product details', 'Select a category and enter the product name and barcode.');
      return;
    }

    setSaving(true);
    try {
      await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify({
          categoryId: selectedCategory.categ_id,
          barcode: barcode.trim(),
          name: productName.trim(),
          supplierName: supplierName.trim() || undefined,
          sizes: selectedSizes,
          colors: selectedColors,
        }),
      });
      Alert.alert('Product created', `${productName.trim()} was created at ${formatXaf(Number(selectedCategory.base_price))}.`);
      setBarcode('');
      setProductName('');
      setSupplierName('');
      setSelectedSizes([]);
      setSelectedColors([]);
    } catch (error) {
      Alert.alert('Product creation failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const uploadCsv = async () => {
    const selection = await DocumentPicker.getDocumentAsync({
      type: 'text/csv',
      copyToCacheDirectory: true,
    });
    if (selection.canceled) return;

    const file = selection.assets[0];
    setSaving(true);
    try {
      const result = await uploadFile<{ successCount: number; failedRows: { row: number; error: string }[] }>('/products/bulk-upload', file);
      const failed = result.failedRows?.length || 0;
      Alert.alert('Bulk upload complete', `${result.successCount} product row(s) imported${failed ? `, ${failed} row(s) failed.` : '.'}`);
    } catch (error) {
      Alert.alert('Bulk upload failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const variantCount = selectedSizes.length > 0 && selectedColors.length > 0
    ? selectedSizes.length * selectedColors.length
    : Math.max(selectedSizes.length, selectedColors.length);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header (same style as Cashier) */}
      <View style={styles.header}>
        <Text style={styles.headerUser}>{user?.name || 'User'} · {user?.storeName || 'Store'}</Text>
        <TouchableOpacity style={styles.avatar} onPress={showSettingsComingSoonAlert}>
          <Text style={styles.avatarText}>{getUserInitials(user?.name)}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>New product</Text>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setCreatingCategory((value) => !value)}>
            <Text style={styles.secondaryBtnText}>+ Category</Text>
          </TouchableOpacity>
        </View>

        {creatingCategory && (
          <View style={styles.categoryBox}>
            <Text style={styles.generateTitle}>Create category</Text>
            <TextInput
              placeholder="Category name"
              value={categoryName}
              onChangeText={setCategoryName}
              style={styles.input}
            />
            <TextInput
              placeholder="Base price in XAF"
              value={categoryPrice}
              onChangeText={setCategoryPrice}
              keyboardType="numeric"
              style={[styles.input, { marginTop: 8 }]}
            />
            <Text style={styles.helperText}>Every product assigned to this category inherits this base price.</Text>
            <TouchableOpacity style={styles.smallAddBtn} onPress={createCategory} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Save category</Text>}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.uploadBtn} onPress={uploadCsv} disabled={saving}>
          {saving ? <ActivityIndicator color={COLORS.primaryDark} /> : <Text style={styles.uploadBtnText}>Upload products CSV</Text>}
        </TouchableOpacity>
        <Text style={styles.helperText}>CSV columns: categoryId, barcode, name, sizes, colors. Prices come from each category in XAF.</Text>

        {/* Barcode field with camera icon inside input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Scan barcode or enter manually</Text>
          <View style={styles.barcodeRow}>
            <TextInput
              placeholder="8901234567890"
              value={barcode}
              onChangeText={setBarcode}
              style={styles.barcodeInput}
            />
            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={onPressCamera}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
              accessibilityLabel="Open scanner"
            >
              <Text style={{ fontSize: 18 }}>📷</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Product name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Product name</Text>
          <TextInput
            placeholder="e.g. Summer Dress"
            value={productName}
            onChangeText={setProductName}
            style={styles.input}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Supplier name</Text>
          <TextInput
            placeholder="e.g. Maxi Supplies"
            value={supplierName}
            onChangeText={setSupplierName}
            style={styles.input}
          />
          <Text style={styles.helperText}>Enter supplier name here.</Text>
        </View>

        {/* Category dropdown */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setCategoryOpen((v) => !v)}>
            <Text style={styles.dropdownText}>{selectedCategory ? `${selectedCategory.name} · ${formatXaf(Number(selectedCategory.base_price))}` : 'Select a category'}</Text>
            <Text style={styles.dropdownArrow}>▾</Text>
          </TouchableOpacity>
          {categoryOpen && (
            <View style={styles.dropdownList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.categ_id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedCategory(category);
                    setCategoryOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{category.name} · {formatXaf(Number(category.base_price))}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {selectedCategory && <Text style={styles.helperText}>Inherited product price: {formatXaf(Number(selectedCategory.base_price))}</Text>}
        </View>

        {/* Variants generator box */}
        <View style={styles.variantsBox}>
          <Text style={styles.generateTitle}>Generate variants</Text>

          <View style={styles.variantsRow}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {availableSizes.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sizeBubble, selectedSizes.includes(s) ? styles.sizeBubbleActive : styles.sizeBubbleInactive]}
                  onPress={() => toggleSize(s)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selectedSizes.includes(s) }}
                >
                  <Text style={[styles.sizeBubbleText, !selectedSizes.includes(s) && styles.inactiveBubbleText]}>{s}{selectedSizes.includes(s) ? ' ✓' : ''}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.addVariantBtn} onPress={() => setAddingSize(true)}>
                <Text style={styles.addVariantBtnText}>+ Size</Text>
              </TouchableOpacity>
            </View>
          </View>

          {addingSize && (
            <View style={styles.addRow}>
              <TextInput
                placeholder="New size (e.g. XL)"
                value={newSizeText}
                onChangeText={setNewSizeText}
                style={[styles.input, { flex: 1 }]}
              />
              <TouchableOpacity style={styles.smallAddBtn} onPress={addSize}>
                <Text style={{ color: '#fff' }}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.variantsRow, { marginTop: 12 }]}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {availableColors.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorBubble, selectedColors.includes(c) ? styles.colorBubbleActive : styles.colorBubbleInactive]}
                  onPress={() => toggleColor(c)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selectedColors.includes(c) }}
                >
                  <Text style={[styles.colorBubbleText, !selectedColors.includes(c) && styles.inactiveBubbleText]}>{c}{selectedColors.includes(c) ? ' ✓' : ''}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.addVariantBtn} onPress={() => setAddingColor(true)}>
                <Text style={styles.addVariantBtnText}>+ Color</Text>
              </TouchableOpacity>
            </View>
          </View>

          {addingColor && (
            <View style={styles.addRow}>
              <TextInput
                placeholder="New color (e.g. Green)"
                value={newColorText}
                onChangeText={setNewColorText}
                style={[styles.input, { flex: 1 }]}
              />
              <TouchableOpacity style={styles.smallAddBtn} onPress={addColor}>
                <Text style={{ color: '#fff' }}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.variantNote}>Will create {variantCount} variant SKUs</Text>
        </View>

        {/* Footer actions */}
        <View style={styles.footerActions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => {
            // reset
            setBarcode('');
            setProductName('');
            setSelectedCategory(categories[0] || null);
            setSelectedSizes([]);
            setSelectedColors([]);
          }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.createBtn} onPress={createProduct} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.createText}>Create product</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, marginTop:5 },
  headerUser: { fontSize: 16, color: COLORS.textPrimary, fontWeight: '700' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryDark, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 40 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  screenTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  secondaryBtn: { borderWidth: 1, borderColor: COLORS.primaryDark, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10 },
  secondaryBtnText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: 12 },
  categoryBox: { backgroundColor: '#FFF', padding: 14, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  uploadBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.primaryDark, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  uploadBtnText: { color: COLORS.primaryDark, fontWeight: '700' },
  helperText: { color: COLORS.textMuted, fontSize: 12, marginTop: 8, marginBottom: 10 },
  fieldGroup: { marginBottom: 16, },
  label: { color: COLORS.textMuted, marginBottom: 8 },
  input: { backgroundColor: '#F6F7F5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 14, color: COLORS.textPrimary, borderWidth: 4, borderColor: COLORS.border },
  barcodeRow: { position: 'relative' },
  barcodeInput: { backgroundColor: '#F6F7F5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 14, paddingRight: 48, color: COLORS.textPrimary, borderWidth: 4, borderColor: COLORS.border },
  cameraBtn: { position: 'absolute', right: 8, top: 6, width: 36, height: 36, borderRadius: 6, backgroundColor: '#E9ECE8', justifyContent: 'center', alignItems: 'center' },
  dropdown: { backgroundColor: '#F6F7F5', borderRadius: 8, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 4, borderColor: COLORS.border },
  dropdownText: { color: COLORS.textPrimary },
  dropdownArrow: { color: COLORS.textMuted },
  dropdownList: { backgroundColor: '#FFF', marginTop: 8, borderRadius: 8, paddingVertical: 8, borderWidth: 1, borderColor: '#EEE' },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 12 },
  dropdownItemText: { color: COLORS.textPrimary },
  variantsBox: { backgroundColor: '#F1F6F3', padding: 16, borderRadius: 8, marginBottom: 16 },
  generateTitle: { color: COLORS.textPrimary, fontWeight: '700', marginBottom: 12 },
  variantsRow: { flexDirection: 'row', alignItems: 'center' },
  sizeBubble: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginRight: 8, minWidth: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  sizeBubbleActive: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  sizeBubbleInactive: { backgroundColor: '#FFF', borderColor: COLORS.border },
  sizeBubbleText: { color: '#FFF', fontWeight: '700' },
  addVariantBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#DDD', backgroundColor: '#FFF', marginLeft: 4 },
  addVariantBtnText: { color: COLORS.textPrimary },
  colorBubble: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginRight: 8, minWidth: 56, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  colorBubbleActive: { backgroundColor: COLORS.accentOrange, borderColor: COLORS.accentOrange },
  colorBubbleInactive: { backgroundColor: '#FFF', borderColor: COLORS.border },
  colorBubbleText: { color: '#FFF', fontWeight: '700' },
  inactiveBubbleText: { color: COLORS.textMuted },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  smallAddBtn: { backgroundColor: COLORS.primaryDark, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginLeft: 8 },
  variantNote: { color: COLORS.textMuted, marginTop: 12 },
  footerActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  cancelBtn: { backgroundColor: '#FFF', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: '#E6E6E6' },
  cancelText: { color: COLORS.textMuted },
  createBtn: { backgroundColor: COLORS.accentOrange, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  createText: { color: '#FFF', fontWeight: '700' },
});
