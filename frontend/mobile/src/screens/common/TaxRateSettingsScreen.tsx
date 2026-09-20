import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { COLORS } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';

type Props = NativeStackScreenProps<RootStackParamList, 'TaxRateSettings'>;

export const TaxRateSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { taxRate, setTaxRate } = useSettings();
  const [rate, setRate] = useState(String((taxRate * 100).toFixed(2)));

  React.useEffect(() => {
    setRate(String((taxRate * 100).toFixed(2)));
  }, [taxRate]);

  const handleSave = () => {
    const parsed = parseFloat(rate);
    if (isNaN(parsed) || parsed < 0) {
      Alert.alert('Invalid rate', 'Please enter a valid non-negative number');
      return;
    }

    setTaxRate(parsed / 100);
    Alert.alert('Success', `Tax rate updated to ${parsed}%`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Tax Rate</Text>

      <View style={styles.displayCard}>
        <Text style={styles.currentRateLabel}>Current rate display</Text>
        <Text style={styles.currentRateVal}>{rate}%</Text>
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={rate}
          onChangeText={setRate}
        />
        <Text style={styles.percentSuffix}>%</Text>
      </View>

      <Text style={styles.helperText}>This rate is applied to all transactions at checkout.</Text>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>SAVE</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  backBtn: { marginTop: 20, marginBottom: 16 },
  backText: { fontSize: 16, color: COLORS.primaryDark },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 20 },
  displayCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', marginBottom: 20 },
  currentRateLabel: { fontSize: 13, color: COLORS.textMuted, marginBottom: 4 },
  currentRateVal: { fontSize: 32, fontWeight: '700', color: COLORS.primaryDark },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 12 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16 },
  percentSuffix: { fontSize: 16, color: COLORS.textMuted },
  helperText: { fontSize: 13, color: COLORS.textMuted, marginTop: 8, marginBottom: 24 },
  saveBtn: { backgroundColor: COLORS.primaryDark, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});