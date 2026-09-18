import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, CartItem } from '../../types';
import { COLORS } from '../../constants/theme';
import { useTransactions } from '../../context/TransactionContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanItem'>;

function parseScanData(data: string): { status: 'valid' | 'invalid'; items: CartItem[]; transactionId?: string } {
  try {
    const parsed = JSON.parse(data);
    if (
      parsed &&
      (parsed.status === 'valid' || parsed.status === 'invalid') &&
      Array.isArray(parsed.items)
    ) {
      const items = parsed.items
        .filter((item: any) => item && item.name && typeof item.price === 'number')
        .map((item: any, index: number) => ({
          id: String(item.id ?? index + 1),
          name: String(item.name),
          price: Number(item.price),
          quantity: Number(item.quantity ?? 1),
        }));
      return {
        status: parsed.status,
        transactionId: parsed.transactionId,
        items: items.length ? items : [{ id: '1', name: 'Unknown Item', price: 0, quantity: 1 }],
      };
    }
  } catch {
    // continue to fallback parsing
  }

  const parts = data
    .split(';')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment, index) => {
      const [name, pricePart] = segment.split(':');
      return {
        id: String(index + 1),
        name: name?.trim() || `Item ${index + 1}`,
        price: Number(pricePart) || 12.5,
        quantity: 1,
      };
    });

  return {
    status: parts.length ? 'valid' : 'invalid',
    items: parts.length ? parts : [{ id: '1', name: 'Scanned Item', price: 35.0, quantity: 1 }],
  };
}

export const ScanItemScreen: React.FC<Props> = ({ navigation, route }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { pushScannedItem } = useTransactions();
  const insets = useSafeAreaInsets();

  // For the cashier auto-add confirmation banner
  const [addedItem, setAddedItem] = useState<CartItem | null>(null);
  const bannerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // Show confirmation banner then fade it out after 1.5s
  useEffect(() => {
    if (addedItem) {
      Animated.timing(bannerOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(bannerOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setAddedItem(null);
        });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [addedItem]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission is required to scan product items.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    const parsed = parseScanData(data);

    if (route.params?.scanContext === 'guard') {
      navigation.navigate('SecurityScanOutput', {
        status: parsed.status,
        items: parsed.items,
        transactionId: parsed.transactionId,
      });
      return;
    }

    if (route.params?.scanContext === 'stocker') {
      navigation.navigate('StockerDashboard', { scannedBarcode: data });
      return;
    }

    // Cashier context: push item into shared context — NO navigation, scanner stays open.
    const item = parsed.items[0];
    pushScannedItem(item);

    // Show the green confirmation banner
    setAddedItem(item);
    // Reset immediately so the camera is ready for the next product scan right away
    setScanned(false);
  };

  return (
    <View style={styles.container}>
      {/* Top Overlay Header — sits below status bar */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>✕ Close</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Barcode / QR Code</Text>
      </View>

      {/* Camera Viewfinder — no children allowed */}
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'upc_a'],
        }}
      />

      {/* Overlay sits on top of camera using absolute positioning */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={[styles.scanTargetBox, addedItem ? styles.scanTargetBoxSuccess : null]} />
        <Text style={styles.instructionText}>
          {addedItem ? '✓ Item added — scan next item' : 'Align barcode or QR code inside the frame'}
        </Text>
      </View>

      {/* Animated green confirmation banner — anchored above device nav bar */}
      {addedItem && (
        <Animated.View
          style={[
            styles.confirmationBanner,
            { opacity: bannerOpacity, bottom: insets.bottom + 16 },
          ]}
        >
          <Text style={styles.confirmationIcon}>✓</Text>
          <View style={styles.confirmationTextContainer}>
            <Text style={styles.confirmationTitle} numberOfLines={1}>
              {addedItem.name}
            </Text>
            <Text style={styles.confirmationPrice}>${addedItem.price.toFixed(2)} · Added to cart</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  permissionText: { fontSize: 16, color: COLORS.textPrimary, textAlign: 'center', marginBottom: 20 },
  permissionBtn: { backgroundColor: COLORS.primaryDark, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8 },
  permissionBtnText: { color: '#FFF', fontWeight: '600' },
  topHeader: {
    zIndex: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingBottom: 16,
  },
  closeBtn: { padding: 8 },
  closeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 16 },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTargetBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#FFF',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  scanTargetBoxSuccess: {
    borderColor: COLORS.successGreen,
    borderWidth: 3,
    backgroundColor: 'rgba(46,125,50,0.1)',
  },
  instructionText: {
    color: '#FFF',
    marginTop: 20,
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    textAlign: 'center',
  },
  confirmationBanner: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: COLORS.successGreen,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmationIcon: { color: '#FFF', fontSize: 22, fontWeight: '700', marginRight: 12 },
  confirmationTextContainer: { flex: 1 },
  confirmationTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  confirmationPrice: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
});