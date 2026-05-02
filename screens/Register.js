import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { registerUser } from '../services/api';
import { getLocation } from '../services/location';

const DISABILITY_OPTIONS = [
  { label: 'Select disability type (optional)', value: '' },
  { label: 'Mobility Impairment', value: 'Mobility Impairment' },
  { label: 'Visual Impairment', value: 'Visual Impairment' },
  { label: 'Hearing Impairment', value: 'Hearing Impairment' },
  { label: 'Cognitive Disability', value: 'Cognitive Disability' },
  { label: 'Medical Equipment Dependent', value: 'Medical Equipment Dependent' },
  { label: 'Other', value: 'Other' },
];

export default function Register({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    address: '',
    floor: '',
    disability: '',
    medications: '',
    phone: '',
    neighborPhone: '',
  });
  const [loading, setLoading] = useState(false);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim()) return Alert.alert('Required', 'Please enter your full name.');
    if (!form.address.trim()) return Alert.alert('Required', 'Please enter your address.');
    if (!form.phone.trim()) return Alert.alert('Required', 'Please enter your phone number.');
    if (!form.neighborPhone.trim()) return Alert.alert('Required', 'Please enter a neighbor phone number.');

    setLoading(true);
    try {
      let lat = 0;
      let lng = 0;
      try {
        const loc = await getLocation();
        lat = loc.lat;
        lng = loc.lng;
      } catch (e) {
        Alert.alert('Location', 'Could not get GPS location. Using 0,0 as fallback.');
      }

      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        floor: parseInt(form.floor, 10) || 1,
        disability: form.disability || '',
        medications: form.medications.trim(),
        phone: form.phone.trim(),
        neighborPhone: form.neighborPhone.trim(),
        lat,
        lng,
      };

      const result = await registerUser(payload);
      await AsyncStorage.setItem('userId', result.id);
      await AsyncStorage.setItem('userData', JSON.stringify({ ...payload, id: result.id }));
      navigation.replace('Home');
    } catch (e) {
      Alert.alert('Error', e.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>BLOCK</Text>
        <Text style={styles.subtitle}>Emergency Registration</Text>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(v) => set('name', v)}
          placeholder="John Smith"
          placeholderTextColor="#666"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={styles.input}
          value={form.address}
          onChangeText={(v) => set('address', v)}
          placeholder="123 Main St, Apt 4B"
          placeholderTextColor="#666"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Floor Number *</Text>
        <TextInput
          style={styles.input}
          value={form.floor}
          onChangeText={(v) => set('floor', v)}
          placeholder="1"
          placeholderTextColor="#666"
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Disability Type</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.disability}
            onValueChange={(v) => set('disability', v)}
            style={styles.picker}
            dropdownIconColor="#fff"
            itemStyle={{ color: '#fff' }}
          >
            {DISABILITY_OPTIONS.map((opt) => (
              <Picker.Item
                key={opt.value}
                label={opt.label}
                value={opt.value}
                color={Platform.OS === 'ios' ? '#fff' : '#000'}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Medications (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.medications}
          onChangeText={(v) => set('medications', v)}
          placeholder="List any medications or medical notes"
          placeholderTextColor="#666"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Your Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={form.phone}
          onChangeText={(v) => set('phone', v)}
          placeholder="+1 555-555-5555"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Neighbor Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={form.neighborPhone}
          onChangeText={(v) => set('neighborPhone', v)}
          placeholder="+1 555-555-5555"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Register"
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <Text style={styles.submitText}>REGISTER</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 24 },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 36,
    letterSpacing: 2,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 16,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    height: 52,
  },
  submitBtn: {
    backgroundColor: '#c00',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginTop: 32,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
  },
});
