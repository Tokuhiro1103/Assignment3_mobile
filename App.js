

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './navigation/AuthStack';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const linking = {
  prefixes: ['yourapp://', 'https://ifn666.com'],
  config: {
    screens: {
      Home: {
        screens: {
          Home: 'home',
          Artists: 'artists',
          Songs: 'songs',
          Playlists: 'playlists',
        },
      },
    },
  },
};

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);

  const registerForPushNotificationsAsync = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        alert('Notification permissions not granted!');
      }
    } else {
      alert('Must use physical device for notifications');
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer linking={linking}>
        <AuthStack />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

