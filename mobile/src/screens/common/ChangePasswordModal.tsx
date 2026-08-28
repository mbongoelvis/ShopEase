import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  /**
   * Called when user confirms the change.
   * If it returns a Promise the modal will show a loading indicator until it resolves.
   * Return value truthy indicates success and will close the modal automatically; returning false keeps it open.
   */
  onConfirm?: (currentPassword: string, newPassword: string) => void | Promise<boolean | void> | boolean;
};

export const ChangePasswordModal: React.FC<Props> = ({ visible, onClose, onConfirm }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      const result = onConfirm ? onConfirm(currentPassword, newPassword) : true;
      if (result && typeof (result as Promise<any>)?.then === 'function') {
        setLoading(true);
        const resolved = await (result as Promise<boolean | void>);
        setLoading(false);
        if (resolved === false) return;
        setCurrentPassword('');
        setNewPassword('');
        onClose();
        return;
      }

      if (result === false) return;
      setCurrentPassword('');
      setNewPassword('');
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Failed to change password');
    }
  };

  const handleClose = () => {
    if (loading) return;
    setError(null);
    setCurrentPassword('');
    setNewPassword('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <Text style={styles.title}>Change password</Text>

          <Text style={styles.label}>Current password</Text>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder="Current password"
            style={styles.input}
            editable={!loading}
            autoCapitalize="none"
          />

          <Text style={[styles.label, { marginTop: 12 }]}>New password</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="New password"
            style={styles.input}
            editable={!loading}
            autoCapitalize="none"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={handleClose} disabled={loading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.confirmBtn]} onPress={handleConfirm} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Confirm change</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  container: { width: '100%', maxWidth: 520, backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  label: { color: COLORS.textMuted, marginBottom: 8 },
  input: { backgroundColor: '#F6F7F5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 },
  cancelBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border },
  cancelText: { color: COLORS.textMuted },
  confirmBtn: { backgroundColor: COLORS.primaryDark },
  confirmText: { color: '#fff', fontWeight: '700' },
  error: { color: '#D32F2F', marginTop: 8 },
});

export default ChangePasswordModal;
