/*import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginPage from './src/Auth/Login/Login'; 
import RegisterPage from './src/Auth/Register/Register';
import SuccessPage from './src/Auth/Success/Success';
import HomePage from './src/HomePage/HomePage';
import DashboardPage from './src/Dashboard/Dashboard';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Register" component={RegisterPage} />
        <Stack.Screen name="Success" component={SuccessPage} />
        <Stack.Screen name="HomePage" component={HomePage} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={DashboardPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
*/

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginPage from './src/Pages/Auth/Login/Login';
import RegisterPage from './src/Pages/Auth/Register/Register';
import SuccessPage from './src/Pages/Auth/Success/Success';
import TabNavigator from './src/Navigation/TabNavigator';
import WelcomePage from './src/Pages/Welcome/Welcome'; 

const Stack = createNativeStackNavigator();

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