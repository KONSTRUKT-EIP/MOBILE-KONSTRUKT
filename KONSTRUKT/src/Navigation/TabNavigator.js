import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import DashboardPage from '../Pages/Dashboard/Dashboard';
import WorksitesPage from '../Pages/Worksites/Worksites';
import OrdersPage from '../Pages/Orders/Orders';
import PlanningPage from '../Pages/Planning/Planning';
import WeatherPage from '../Pages/Weather/Weather';

const Tab = createBottomTabNavigator();

const TabNavigator = ({ navigation }) => {
  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Se déconnecter", onPress: async () => { await AsyncStorage.clear(); navigation.replace('Login'); }, style: "destructive" }
    ]);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: '#FFF', elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { fontWeight: 'bold', color: '#333' },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 20 }}>
            <MaterialCommunityIcons name="cog" size={30} color="#cb6516" />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: '#FF5722',
        tabBarInactiveTintColor: '#607D8B',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          height: 95,
          position: 'absolute',
          paddingBottom: 20,
          elevation: 10,
        },
        tabBarIcon: ({ color }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'view-grid';
          else if (route.name === 'Commandes') iconName = 'cart';
          else if (route.name === 'Chantiers') iconName = 'office-building';
          else if (route.name === 'Planning') iconName = 'calendar-clock';
          else if (route.name === 'Météo') iconName = 'weather-sunny-alert';
          return <MaterialCommunityIcons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardPage} />
      <Tab.Screen name="Commandes" component={OrdersPage} />
      <Tab.Screen name="Chantiers" component={WorksitesPage} />
      <Tab.Screen name="Planning" component={PlanningPage} />
      <Tab.Screen name="Météo" component={WeatherPage} />
    </Tab.Navigator>
  );
};

export default TabNavigator;