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
      <Text style={styles.sectionTitle}>Mes Chantiers Actifs</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('JobsiteHub', { chantierName: item.name })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="office-building" size={24} color="#cb6516" />
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
    backgroundColor: '#f0f4f4' 
  },
  list: { 
    padding: 20, 
    paddingBottom: 100 
  },
  headerContainer: {
    marginBottom: 10
  },
  welcomeText: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1E1E1E' 
  },
  subtitle: { 
    fontSize: 15, 
    color: '#666', 
    marginTop: 4,
    marginBottom: 30
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 15 
  },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 18, 
    padding: 15, 
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  iconBox: { 
    width: 50, 
    height: 50, 
    borderRadius: 12, 
    backgroundColor: '#fff4eb', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  info: { 
    flex: 1, 
    marginLeft: 15 
  },
  name: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4 
  },
  location: { 
    fontSize: 13, 
    color: '#666', 
    marginLeft: 4 
  },
});

export default DashboardList;