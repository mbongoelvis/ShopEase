import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { COLORS } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <View style={styles.logoSquare} />
        <Text style={styles.brandTitle}>ShopEase</Text>
        <Text style={styles.taglineBold}>Every item, accounted for</Text>
        <Text style={styles.taglineSub}>Scan in. Sell. Verify out.</Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={styles.orangeButton} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.orangeButtonText}>Log in</Text>
        </TouchableOpacity>

  
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24, justifyContent: 'space-between' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoSquare: { width: 72, height: 72, backgroundColor: COLORS.primaryDark, borderRadius: 16, marginBottom: 24 },
  brandTitle: { fontSize: 28, color: COLORS.primaryDark, fontWeight: '700', marginBottom: 12 },
  taglineBold: { fontSize: 16, color: COLORS.textPrimary, fontWeight: '600', marginBottom: 4 },
  taglineSub: { fontSize: 14, color: COLORS.textMuted },
  bottomSection: { width: '100%', marginBottom: 20 },
  orangeButton: { backgroundColor: COLORS.accentOrange, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  orangeButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  demoLink: { textAlign: 'center', color: COLORS.primaryDark, fontSize: 14 },
});