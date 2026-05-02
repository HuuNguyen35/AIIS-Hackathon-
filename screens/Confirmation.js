import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateStatus } from '../services/api';

export default function Confirmation({ route, navigation }) {
  const person = route.params?.person || {};
  const [loading, setLoading] = useState(false);
  const [marked, setMarked] = useState(false);

  async function handleMarkSafe() {
    setLoading(true);
    try {
      const myId = await AsyncStorage.getItem('userId');
      if (!myId) throw new Error('Your user ID not found.');
      await updateStatus(person.id || myId, 'safe', null, null);
      setMarked(true);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not mark as safe. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (marked) {
    return (
      <View style={styles.container}>
        <Text style={styles.checkmark}>✓</Text>
        <Text style={styles.successTitle}>MARKED SAFE</Text>
        <Text style={styles.successSub}>
          {person.name || 'Neighbor'} has been marked as safe.
        </Text>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate('Home')}
          accessibilityRole="button"
          accessibilityLabel="Done"
        >
          <Text style={styles.doneBtnText}>DONE</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>EN ROUTE</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>GOING TO HELP</Text>
        <Text style={styles.personName}>{person.name || 'Unknown'}</Text>
        <Text style={styles.address}>{person.address || 'Unknown address'}</Text>
        {person.floor != null && (
          <Text style={styles.floor}>FLOOR {person.floor}</Text>
        )}
      </View>

      <Text style={styles.instruction}>
        Once you have confirmed they are safe, press the button below.
      </Text>

      <TouchableOpacity
        style={[styles.safeBtn, loading && styles.btnDisabled]}
        onPress={handleMarkSafe}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Mark as safe"
      >
        {loading ? (
          <ActivityIndicator color="#000" size="large" />
        ) : (
          <Text style={styles.safeBtnText}>MARKED SAFE</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffaa00',
    letterSpacing: 4,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    padding: 24,
    width: '100%',
    marginBottom: 32,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 3,
    marginBottom: 8,
  },
  personName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  address: {
    fontSize: 18,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 8,
  },
  floor: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffaa00',
    letterSpacing: 2,
  },
  instruction: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  safeBtn: {
    backgroundColor: '#00aa33',
    borderRadius: 8,
    padding: 22,
    width: '100%',
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  safeBtnText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 3,
  },
  checkmark: {
    fontSize: 100,
    color: '#00cc44',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#00cc44',
    letterSpacing: 4,
    marginBottom: 16,
  },
  successSub: {
    fontSize: 20,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 48,
  },
  doneBtn: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 3,
  },
});
