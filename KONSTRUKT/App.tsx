import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginPage from './src/Pages/Auth/Login/Login';
import TabNavigator from './src/Navigation/TabNavigator';
import WelcomePage from './src/Pages/Welcome/Welcome';
import SettingsPage from './src/Pages/Settings/Settings';
import AcceptInvitationPage from './src/Pages/Auth/AcceptInvitation/AcceptInvitation';
import { navigationRef } from './src/Navigation/navigationRef';
import { SessionProvider } from './src/Context/SessionContext';
import { ThemeProvider, useTheme } from './src/Theme/ThemeContext';

// 1. Définition des routes et de leurs paramètres
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  AcceptInvitation: { token?: string } | undefined;
  Main: undefined; // Le TabNavigator
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigation() {
  const { colors, isDark } = useTheme();
  const base = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomePage} />
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="AcceptInvitation" component={AcceptInvitationPage} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Settings" component={SettingsPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <AppNavigation />
      </SessionProvider>
    </ThemeProvider>
  );
}
