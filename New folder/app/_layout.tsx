import { Stack } from "expo-router";
import React from 'react';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <Stack screenOptions={{headerShown: false}} initialRouteName="loginPage">
      <Stack.Screen name="loginPage" options={{ headerShown: false }} />
      <Stack.Screen name="signInPage" options={{ headerShown: true, headerTitle: 'Sign-In', headerTitleStyle: { color: '#fff' }, headerTintColor: '#2C3E50', headerBackground: () => <View style={{ flex: 1, backgroundColor: '#fff' }} /> }}  />
      <Stack.Screen name="signUpPage" options={{ headerShown: true, headerTitle: 'Sign-Up', headerTitleStyle: { color: '#fff' }, headerTintColor: '#2C3E50', headerBackground: () => <View style={{ flex: 1, backgroundColor: '#fff' }} /> }}  />
    </Stack>
  );
}
