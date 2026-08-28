import React, { useState } from 'react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { COLORS } from '../../constants/theme';
import ChangePasswordModal from './ChangePasswordModal';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Toggle this to false after testing to prevent auto-show
  const [showChangePassword, setShowChangePassword] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('cashier');
  const { login } = useAuth();

  const handleLogin = () => {
    // Triggers the state change in AuthContext to dynamically switch stacks
    login(selectedRole);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Log in</Text>
      <Text style={styles.subTitle}>Sign in to your ShopEase account</Text>

      {/* Role Selector UI */}
      <View style={styles.roleContainer}>
        <Text style={styles.label}>Select Shift Role</Text>
        <View style={styles.roleGrid}>
          <TouchableOpacity
            style={[styles.roleCard, selectedRole === 'cashier' && styles.roleCardActive]}
            onPress={() => setSelectedRole('cashier')}
          >
            <Text style={[styles.roleText, selectedRole === 'cashier' && styles.roleTextActive]}>
              Cashier
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, selectedRole === 'stocker' && styles.roleCardActive]}
            onPress={() => setSelectedRole('stocker')}
          >
            <Text style={[styles.roleText, selectedRole === 'stocker' && styles.roleTextActive]}>
              Stocker
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, selectedRole === 'guard' && styles.roleCardActive]}
            onPress={() => setSelectedRole('guard')}
          >
            <Text style={[styles.roleText, selectedRole === 'guard' && styles.roleTextActive]}>
              Guard
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="name@store.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowPassword((s) => !s)}
            style={styles.eyeButton}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Text style={styles.eyeText}>{showPassword ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fixed: Calls handleLogin instead of direct screen navigation */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>
          Log in as {selectedRole ? selectedRole.toUpperCase() : ''}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.forgotPass}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      {/* Auto-show Change Password Modal for first-login testing. Toggle showChangePassword state to false to disable. */}
      <ChangePasswordModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onConfirm={async (currentPassword, newPassword) => {
          // TODO: replace with real API call. Simulate async delay for now.
          await new Promise((r) => setTimeout(r, 800));
          console.log('Password changed (test)', { currentPassword, newPassword });
          // Return true to close the modal
          return true;
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24 },
  backButton: { marginTop: 20, marginBottom: 20 },
  backText: { fontSize: 24, color: COLORS.textPrimary },
  headerTitle: { fontSize: 28, color: COLORS.textPrimary, fontWeight: '700', marginBottom: 6 },
  subTitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 24 },
  
  roleContainer: { marginBottom: 20 },
  roleGrid: { flexDirection: 'row', gap: 8, marginTop: 8 },
  roleCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  roleCardActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: '#F0F4FF',
  },
  roleText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  roleTextActive: { color: COLORS.primaryDark, fontWeight: '700' },

  inputContainer: { marginBottom: 16 },
  label: { fontSize: 13, color: COLORS.textMuted, marginBottom: 6 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 14, fontSize: 15 },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eyeButton: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  eyeText: { fontSize: 18 },
  loginButton: { backgroundColor: COLORS.accentOrange, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  forgotPass: { marginTop: 20, alignItems: 'center' },
  forgotText: { color: COLORS.primaryDark, fontSize: 14 },
});