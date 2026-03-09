import React from 'react';
import { StyleSheet, View, Text, ScrollView} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MenuCard from '../../Components/MenuCard';

const HomePage = ({ navigation }) => {
  
  const menuItems = [
    { id: 'dash', title: 'Dashboard', icon: 'view-dashboard', color: '#cb6516' },
    { id: 'cmd', title: 'Commandes', icon: 'cart', color: '#1E1E1E' },
    { id: 'met', title: 'Météo & Alertes', icon: 'weather-sunny-alert', color: '#1E1E1E' },
    { id: 'cha', title: 'Chantiers', icon: 'office-building', color: '#1E1E1E' },
    { id: 'pla', title: 'Plannings', icon: 'calendar-clock', color: '#1E1E1E' },
    { id: 'set', title: 'Réglages', icon: 'cog', color: '#1E1E1E' },
  ];

  const handlePress = (id) => {
    if (id === 'dash') {
      navigation.navigate('Dashboard');
    } else {
      console.log(`Bientôt disponible : ${id}`);
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bonjour,</Text>
          <Text style={styles.brandText}>Konstrukt</Text>
        </View>

        <Text style={styles.sectionTitle}>Menu principal</Text>

        <View style={styles.grid}>
          {menuItems.map((item) => (
            <MenuCard 
              key={item.id}
              title={item.title}
              icon={item.icon}
              color={item.color}
              onPress={() => handlePress(item.id)}
            />
          ))}
        </View>

      </ScrollView>
    </SafeAreaProvider>
  );
};

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f0f0',
  },

  scrollContainer: {
    padding: 20,
  },

  header: {
    marginTop: 20,
    marginBottom: 30,
  },

  welcomeText: {
    fontSize: 18,
    color: '#666666',
  },

  brandText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888888',
    letterSpacing: 1.2,
    marginBottom: 20,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default HomePage;