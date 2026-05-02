import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateStatus, getAllUsers } from '../services/api';
import { getLocation } from '../services/location';

const STATUS_LABELS = {
  uncontacted: { text: 'HELP REQUESTED', color: '#ff4444' },
  neighbor_en_route: { text: 'NEIGHBOR EN ROUTE', color: '#ffaa00' },
  safe: { text: 'MARKED SAFE', color: '#00cc44' },
  unknown: { text: 'STANDING BY', color: '#888' },
};

export default function Home() {
  const [userId, setUserId] = useState(null);
  const [status, setStatus] = useState('unknown');
  const [pressing, setPressing] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem('userId').then((id) => {
      if (id) setUserId(id);
    });
  }, []);

  const fetchStatus = useCallback(async () => {
    if (!userId) return;
    try {
      const users = await getAllUsers();
      const me = users.find((u) => u.id === userId);
      if (me) setStatus(me.status || 'unknown');
    } catch (_) {}
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 10000);
    return () => clearInterval(pollRef.current);
  }, [userId, fetchStatus]);

  async function handleHelpPress() {
    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please restart the app.');
      return;
    }
    setPressing(true);
    try {
      let lat = null;
      let lng = null;
      try {
        const loc = await getLocation();
        lat = loc.lat;
        lng = loc.lng;
      } catch (_) {}

      await updateStatus(userId, 'uncontacted', lat, lng);
      setStatus('uncontacted');
      Alert.alert('HELP REQUESTED', 'Your neighbors have been notified. Stay where you are.');
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not send help request. Try again.');
    } finally {
      setPressing(false);
    }
  }

  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.unknown;

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>BLOCK</Text>

      <View style={styles.centerArea}>
        <TouchableOpacity
          style={[styles.helpBtn, pressing && styles.helpBtnPressed]}
          onPress={handleHelpPress}
          disabled={pressing}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="I need help"
        >
          {pressing ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <Text style={styles.helpBtnText}>I NEED{'\n'}HELP</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.statusArea}>
        <Text style={styles.statusLabel}>CURRENT STATUS</Text>
        <Text style={[styles.statusValue, { color: statusInfo.color }]}>
          {statusInfo.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 10,
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpBtn: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#cc0000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#ff4444',
    shadowColor: '#ff0000',
    shadowOpacity: 0.8,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  helpBtnPressed: {
    backgroundColor: '#990000',
    shadowOpacity: 0.4,
  },
  helpBtnText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 3,
    lineHeight: 44,
  },
  statusArea: {
    alignItems: 'center',
    paddingTop: 20,
  },
  statusLabel: {
    color: '#555',
    fontSize: 13,
    letterSpacing: 3,
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
});
