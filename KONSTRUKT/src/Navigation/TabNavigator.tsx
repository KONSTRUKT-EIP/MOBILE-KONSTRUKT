import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../App'; // On importe le type défini dans App.tsx
import authService from '../Services/authService';

// Import des pages
import DashboardList from '../Pages/Dashboard/DashboardList';
import DashboardPage from '../Pages/Dashboard/Dashboard';
import WorksitesPage from '../Pages/Worksites/Worksites';
import OrdersPage from '../Pages/Orders/Orders';
import PlanningPage from '../Pages/Planning/Planning';
import WeatherPage from '../Pages/Weather/Weather';
import TeamListPage from '../Pages/Dashboard/TeamList';
import AttendancePage from '../Pages/Dashboard/AttendancePage';
import JobsiteHub from '../Pages/Dashboard/JobsiteHub';
import TradeDashboard from '../Pages/Dashboard/TradeDashboard';

// 1. Types pour le Stack du Dashboard
export type DashboardStackParamList = {
  DashboardList: undefined;
  JobsiteHub: { chantierName: string; siteId: string };
  TradeDashboard: { chantierName: string; category: string };
  DashboardDetail: { chantierName: string; siteId: string };
  TeamList: { chantierName: string; siteId: string };
  Attendance: { chantierName: string; siteId: string };
};

// 2. Types pour le TabNavigator
export type TabParamList = {
  Dashboard: undefined;
  Commandes: undefined;
  Chantiers: undefined;
  Planning: undefined;
  Météo: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();

// Sous-navigation pour le Dashboard
function DashboardStackScreen() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      {/* On utilise 'as any' temporairement pour les composants non encore convertis en .tsx */}
      <DashboardStack.Screen name="DashboardList" component={DashboardList as any} />
      <DashboardStack.Screen name="JobsiteHub" component={JobsiteHub as any} />
      <DashboardStack.Screen name="TradeDashboard" component={TradeDashboard as any} />
      <DashboardStack.Screen name="DashboardDetail" component={DashboardPage as any} />
      <DashboardStack.Screen name="TeamList" component={TeamListPage as any} />
      <DashboardStack.Screen name="Attendance" component={AttendancePage as any} />
    </DashboardStack.Navigator>
  );
}

// Typage des props du TabNavigator pour accéder à navigation.replace
type TabNavigatorProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>;
};

const TabNavigator: React.FC<TabNavigatorProps> = ({ navigation }) => {
  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { 
        text: "Se déconnecter", 
        onPress: async () => {
          try {
            await authService.logout();
          } catch {
            // Déconnexion locale même si le serveur est injoignable.
          }
          await AsyncStorage.clear();
          navigation.replace('Login'); // Maintenant typé grâce à RootStackParamList
        }, 
        style: "destructive" 
      }
    ]);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: '#f3f4f6' },
        headerTitleStyle: { fontWeight: 'bold', color: '#111827' },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 20 }}>
            <MaterialCommunityIcons name="cog" size={30} color="#c2410c" />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: '#c2410c',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 88,
          position: 'absolute',
          paddingBottom: 16,
          paddingTop: 8,
          elevation: 8,
        },
        tabBarIcon: ({ color }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap; // Type strict pour les icônes
          if (route.name === 'Dashboard') iconName = 'view-grid';
          else if (route.name === 'Commandes') iconName = 'cart';
          else if (route.name === 'Chantiers') iconName = 'office-building';
          else if (route.name === 'Planning') iconName = 'calendar-clock';
          else if (route.name === 'Météo') iconName = 'weather-sunny-alert';
          else iconName = 'help-circle';
          
          return <MaterialCommunityIcons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStackScreen} />
      <Tab.Screen name="Commandes" component={OrdersPage as any} />
      <Tab.Screen name="Chantiers" component={WorksitesPage as any} />
      <Tab.Screen name="Planning" component={PlanningPage as any} />
      <Tab.Screen name="Météo" component={WeatherPage as any} />
    </Tab.Navigator>
  );
};

export default TabNavigator;