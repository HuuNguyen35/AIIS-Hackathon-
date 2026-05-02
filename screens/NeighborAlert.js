import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateStatus } from '../services/api';

export default function NeighborAlert({ route, navigation }) {
  const person = route.params?.person || {};
  const [loading, setLoading] = useState(false);

  const lat = person.lat ?? 37.7749;
  const lng = person.lng ?? -122.4194;

  async function handleGoingPress() {
    setLoading(true);
    try {
      const myId = await AsyncStorage.getItem('userId');
      if (!myId) throw new Error('Your user ID not found.');
      await updateStatus(myId, 'neighbor_en_route', null, null);
      navigation.replace('Confirmation', { person });
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not update status. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.alertBanner}>NEIGHBOR NEEDS HELP</Text>

      <View style={styles.infoCard}>
        <Text style={styles.personName}>{person.name || 'Unknown'}</Text>

        {person.disability ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DISABILITY</Text>
            <Text style={styles.infoValue}>{person.disability}</Text>
          </View>
        ) : null}

        {person.medications ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>MEDICATIONS</Text>
            <Text style={styles.infoValue}>{person.medications}</Text>
          </View>
        ) : null}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>FLOOR</Text>
          <Text style={styles.infoValueLarge}>{person.floor ?? '?'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ADDRESS</Text>
          <Text style={styles.infoValue}>{person.address || 'Unknown'}</Text>
        </View>

        {person.phone ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PHONE</Text>
            <Text style={styles.infoValue}>{person.phone}</Text>
          </View>
        ) : null}
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
      >
        <Marker
          coordinate={{ latitude: lat, longitude: lng }}
          title={person.name || 'Person in Need'}
          description={`Floor ${person.floor ?? '?'}`}
          pinColor="#ff0000"
        />
      </MapView>

      <TouchableOpacity
        style={[styles.goingBtn, loading && styles.btnDisabled]}
        onPress={handleGoingPress}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="I am going to help"
      >
        {loading ? (
          <ActivityIndicator color="#000" size="large" />
        ) : (
          <Text style={styles.goingBtnText}>I AM GOING</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 24,
  },
  alertBanner: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ff4444',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 24,
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: '#111',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    padding: 20,
    marginBottom: 24,
  },
  personName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: '#666',
    letterSpacing: 2,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  infoValueLarge: {
    fontSize: 28,
    color: '#ffaa00',
    fontWeight: '900',
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  goingBtn: {
    backgroundColor: '#ffaa00',
    borderRadius: 8,
    padding: 22,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  goingBtnText: {
    color: '#000',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 3,
  },
});
