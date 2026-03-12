import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialChantiers = [
  { id: "1", name: "Tour Horizon",       location: "Paris, 75008" },
  { id: "2", name: "Résidence Les Pins", location: "Lyon, 69003" },
  { id: "3", name: "Pont Sud",           location: "Marseille, 13002" },
  { id: "4", name: "Centre Commercial",  location: "Bordeaux, 33000" },
  { id: "5", name: "Immeuble Lumière",   location: "Nantes, 44000" },
  { id: "6", name: "Stade Municipal",    location: "Toulouse, 31000" },
];

const DashboardList = ({ navigation }) => {
  const [userName, setUserName] = useState('Utilisateur');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userFirstName');
        if (storedName) setUserName(storedName);
      } catch (e) {
        console.error("Erreur lors de la récupération du prénom", e);
      }
    };
    fetchUserData();
  }, []);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.welcomeText}>Bonjour, {userName}</Text>
      <Text style={styles.subtitle}>Sélectionnez un chantier pour commencer</Text>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Mes Chantiers Actifs</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{initialChantiers.length}</Text>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('JobsiteHub', { chantierName: item.name })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="office-building" size={24} color="#4f46e5" />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={14} color="#666" />
            <Text style={styles.location}>{item.location}</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Indigo banner matching frontend /dashboard */}
      <View style={styles.banner}>
        <Text style={styles.brandText}>KONSTRUKT</Text>
        <Text style={styles.bannerTitle}>Mes Chantiers</Text>
      </View>
      <FlatList
        data={initialChantiers}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f3f4f6',
  },
  banner: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  brandText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#c7d2fe',
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  list: { 
    padding: 16, 
    paddingBottom: 110,
  },
  headerContainer: {
    marginBottom: 8,
    paddingTop: 8,
  },
  welcomeText: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#111827',
  },
  subtitle: { 
    fontSize: 14, 
    color: '#6b7280', 
    marginTop: 4,
    marginBottom: 24,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#111827',
  },
  countBadge: {
    marginLeft: 8,
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: {
    color: '#4f46e5',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  iconBox: { 
    width: 48, 
    height: 48, 
    borderRadius: 12, 
    backgroundColor: '#e0e7ff', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  info: { 
    flex: 1, 
    marginLeft: 14,
  },
  name: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#111827',
  },
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4,
  },
  location: { 
    fontSize: 13, 
    color: '#6b7280', 
    marginLeft: 4,
  },
});

export default DashboardList;