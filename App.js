import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import Register from './screens/Register';
import Home from './screens/Home';
import NeighborAlert from './screens/NeighborAlert';
import Confirmation from './screens/Confirmation';

import {
  registerForPushNotifications,
  addNotificationListener,
  addResponseListener,
} from './services/push';
import { registerPushToken } from './services/api';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const navigationRef = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem('userId').then((id) => {
      setInitialRoute(id ? 'Home' : 'Register');
    });
  }, []);

  useEffect(() => {
    let notifListener;
    let responseListener;

    async function setupPush() {
      try {
        const token = await registerForPushNotifications();
        if (token) {
          const userId = await AsyncStorage.getItem('userId');
          if (userId) {
            await registerPushToken(userId, token).catch(() => {});
          }
        }
      } catch (_) {}

      notifListener = addNotificationListener((notification) => {
        const data = notification.request.content.data;
        if (data?.type === 'neighbor_alert' && navigationRef.current) {
          navigationRef.current.navigate('NeighborAlert', { person: data.person });
        }
      });

      responseListener = addResponseListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.type === 'neighbor_alert' && navigationRef.current) {
          navigationRef.current.navigate('NeighborAlert', { person: data.person });
        }
      });
    }

    setupPush();

    return () => {
      notifListener?.remove();
      responseListener?.remove();
    };
  }, []);

  if (!initialRoute) return null;

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="light" backgroundColor="#000" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '900', letterSpacing: 2, fontSize: 18 },
          contentStyle: { backgroundColor: '#000' },
        }}
      >
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NeighborAlert"
          component={NeighborAlert}
          options={{
            title: 'NEIGHBOR ALERT',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="Confirmation"
          component={Confirmation}
          options={{
            title: 'CONFIRMATION',
            headerBackVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
