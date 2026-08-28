import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'StockerDashboard'>;

export const StockerDashboardScreen: React.FC<Props> = ({ navigation, route }) => {
  const { logout } = useAuth();

  const categories = [
    'Dresses',
    'Accessories',
    'Shoes'
  ];

  const [selectedCategory, setSelectedCategory] = useState<string | null>(categories[0]);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [barcode, setBarcode] = useState('');
  const [productName, setProductName] = useState('');

  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L']);
  const [colors, setColors] = useState<string[]>(['Red', 'Blue']);

  const [addingSize, setAddingSize] = useState(false);
  const [newSizeText, setNewSizeText] = useState('');

  const [addingColor, setAddingColor] = useState(false);
  const [newColorText, setNewColorText] = useState('');

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
    if (v && !sizes.includes(v)) {
      setSizes((s) => [...s, v]);
    }
    setNewSizeText('');
    setAddingSize(false);
  };

  const addColor = () => {
    const v = newColorText.trim();
    if (v && !colors.includes(v)) {
      setColors((c) => [...c, v]);
    }
    setNewColorText('');
    setAddingColor(false);
  };

  const createProduct = () => {
    // no backend yet - just log to console and reset form
    console.log('Create product', { barcode, productName, selectedCategory, sizes, colors });
    // Basic reset
    setBarcode('');
    setProductName('');
    setSelectedCategory(categories[0]);
    setSizes(['S', 'M', 'L']);
    setColors(['Red', 'Blue']);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header (same style as Cashier) */}
      <View style={styles.header}>
        <Text style={styles.headerUser}>Sophia E. · Buea Town</Text>
        <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('TaxRateSettings')}>
          <Text style={styles.avatarText}>SE</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.screenTitle}>New product</Text>

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

        {/* Category dropdown */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setCategoryOpen((v) => !v)}>
            <Text style={styles.dropdownText}>{selectedCategory}</Text>
            <Text style={styles.dropdownArrow}>▾</Text>
          </TouchableOpacity>
          {categoryOpen && (
            <View style={styles.dropdownList}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedCategory(c);
                    setCategoryOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Variants generator box */}
        <View style={styles.variantsBox}>
          <Text style={styles.generateTitle}>Generate variants</Text>

          <View style={styles.variantsRow}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {sizes.map((s) => (
                <View key={s} style={[styles.sizeBubble, { backgroundColor: COLORS.primaryDark }]}> 
                  <Text style={styles.sizeBubbleText}>{s}</Text>
                </View>
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
              {colors.map((c) => (
                <View key={c} style={[styles.colorBubble, { backgroundColor: COLORS.accentOrange }]}>
                  <Text style={styles.colorBubbleText}>{c}</Text>
                </View>
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

          <Text style={styles.variantNote}>Will create {sizes.length * colors.length} variant SKUs</Text>
        </View>

        {/* Footer actions */}
        <View style={styles.footerActions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => {
            // reset
            setBarcode('');
            setProductName('');
            setSelectedCategory(categories[0]);
            setSizes(['S','M','L']);
            setColors(['Red','Blue']);
          }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.createBtn} onPress={createProduct}>
            <Text style={styles.createText}>Create product</Text>
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
  screenTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: COLORS.textPrimary },
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
  sizeBubble: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginRight: 8, minWidth: 36, alignItems: 'center', justifyContent: 'center' },
  sizeBubbleText: { color: '#FFF', fontWeight: '700' },
  addVariantBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#DDD', backgroundColor: '#FFF', marginLeft: 4 },
  addVariantBtnText: { color: COLORS.textPrimary },
  colorBubble: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginRight: 8, minWidth: 56, alignItems: 'center', justifyContent: 'center' },
  colorBubbleText: { color: '#FFF', fontWeight: '700' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  smallAddBtn: { backgroundColor: COLORS.primaryDark, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginLeft: 8 },
  variantNote: { color: COLORS.textMuted, marginTop: 12 },
  footerActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  cancelBtn: { backgroundColor: '#FFF', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: '#E6E6E6' },
  cancelText: { color: COLORS.textMuted },
  createBtn: { backgroundColor: COLORS.accentOrange, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  createText: { color: '#FFF', fontWeight: '700' },
});
