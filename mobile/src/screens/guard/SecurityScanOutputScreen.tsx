import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, CartItem } from '../../types';
import { COLORS } from '../../constants/theme';
import { useTransactions } from '../../context/TransactionContext';

type Props = NativeStackScreenProps<RootStackParamList, 'SecurityScanOutput'>;

export const SecurityScanOutputScreen: React.FC<Props> = ({ navigation, route }) => {
  const { status, items, transactionId } = route.params ?? { status: 'invalid', items: [] as CartItem[] };
  const { updateTransactionStatus } = useTransactions();
  const [modalVisible, setModalVisible] = useState(false);
  const [discrepancyText, setDiscrepancyText] = useState('');

  const isValid = status === 'valid';

  const handleExit = () => {
    if (transactionId) {
      updateTransactionStatus(transactionId, 'Collected');
    }
    navigation.navigate('GuardHome');
  };

  const handleSendDiscrepancy = () => {
    if (!discrepancyText.trim()) return;
    setModalVisible(false);
    if (transactionId) {
      updateTransactionStatus(transactionId, 'Discrepancy — Held');
    }
    Alert.alert('Discrepancy submitted', 'Your report has been sent to the security team.');
    setDiscrepancyText('');
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.itemRow}>
      <View>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQuantity}>Qty {item.quantity}</Text>
      </View>
      <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerUser}>Jane M. · Lekki</Text>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => navigation.navigate('TaxRateSettings')}
          >
            <Text style={styles.avatarText}>JM</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Receipt Validity</Text>
          <View style={[styles.statusPill, isValid ? styles.validPill : styles.invalidPill]}>
            <Text style={[styles.statusLabel, isValid ? styles.validText : styles.invalidText]}>
              {isValid ? 'Valid' : 'Invalid'}
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Items on Receipt</Text>
          <View style={styles.itemsCard}>
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No items were decoded from this QR receipt.</Text>
              }
            />
          </View>

          {!isValid && (
            <TouchableOpacity style={styles.discrepancyPanel} onPress={() => setModalVisible(true)}>
              <Text style={styles.discrepancyTitle}>Discrepancy found</Text>
              <Text style={styles.discrepancyHint}>Tap to report the issue</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          {isValid ? (
            <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
              <Text style={styles.exitButtonText}>Exit Customer</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.invalidNote}>Receipt is invalid. Please report the discrepancy.</Text>
          )}
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <View />
          </Pressable>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Discrepancy</Text>
            <Text style={styles.modalDescription}>
              Describe the problem you found on the receipt.
            </Text>
            <TextInput
              style={styles.modalInput}
              value={discrepancyText}
              onChangeText={setDiscrepancyText}
              placeholder="Enter issue details..."
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.modalSendButton, !discrepancyText.trim() && styles.modalSendDisabled]}
              onPress={handleSendDiscrepancy}
              disabled={!discrepancyText.trim()}
            >
              <Text style={styles.modalSendText}>Send Report</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, justifyContent: 'space-between' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#FFF',
  },
  headerUser: { fontSize: 16, color: COLORS.textPrimary, fontWeight: '700' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  statusPill: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  validPill: { backgroundColor: '#E6F4EA' },
  invalidPill: { backgroundColor: '#FDEDEA' },
  statusLabel: { fontSize: 16, fontWeight: '700' },
  validText: { color: '#1B7D3D' },
  invalidText: { color: '#B92D2D' },
  itemsCard: {
    marginTop: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  itemName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  itemQuantity: { marginTop: 4, color: COLORS.textMuted, fontSize: 13 },
  itemPrice: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  divider: { height: 1, backgroundColor: COLORS.border },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', paddingVertical: 24 },
  discrepancyPanel: {
    marginTop: 24,
    backgroundColor: '#FFF4F4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3C6C6',
    padding: 16,
  },
  discrepancyTitle: { fontSize: 16, fontWeight: '700', color: '#B92D2D' },
  discrepancyHint: { marginTop: 6, color: COLORS.textMuted, fontSize: 13 },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: '#FFF',
  },
  exitButton: {
    backgroundColor: COLORS.accentOrange,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  exitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  invalidNote: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalContent: {
    height: '50%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  modalDescription: { marginTop: 8, color: COLORS.textMuted, fontSize: 14 },
  modalInput: {
    marginTop: 20,
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
  },
  modalSendButton: {
    marginTop: 16,
    backgroundColor: COLORS.accentOrange,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalSendDisabled: {
    backgroundColor: COLORS.border,
  },
  modalSendText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
