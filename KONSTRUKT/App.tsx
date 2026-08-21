import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginPage from './src/Pages/Auth/Login/Login';
import RegisterPage from './src/Pages/Auth/Register/Register';
import SuccessPage from './src/Pages/Auth/Success/Success';
import TabNavigator from './src/Navigation/TabNavigator';
import WelcomePage from './src/Pages/Welcome/Welcome'; 

// 1. Définition des routes et de leurs paramètres
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Success: undefined;
  Main: undefined; // Le TabNavigator
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomePage} />
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Register" component={RegisterPage} />
        <Stack.Screen name="Success" component={SuccessPage} />
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}