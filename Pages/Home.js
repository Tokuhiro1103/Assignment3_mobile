import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E0F7FA' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Welcome to the Home Screen!</Text>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Enjoy your music playlist!!!</Text>

      <TouchableOpacity
        onPress={goToLogin}
        style={{
          backgroundColor: '#1e90ff',
          padding: 10,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Login as another user</Text>
      </TouchableOpacity>
    </View>
  );
}
