import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardPage = ({ navigation }) => {
  const [userName, setUserName] = useState('Utilisateur');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userFirstName');
        if (storedName) {
          setUserName(storedName);
        }
      } catch (e) {
        console.error("Erreur lors de la récupération du prénom", e);
      }
    };
    fetchUserData();
  }, []);

  const stats = [
    { id: 1, label: 'Chantiers actifs', value: '12', icon: 'crane', color: '#cb6516' },
    { id: 2, label: 'Commandes doutes', value: '3', icon: 'alert-circle', color: '#d32f2f' },
    { id: 3, label: 'Ouvriers sur site', value: '24', icon: 'account-group', color: '#1E1E1E' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcomeText}>Bonjour, {userName} </Text>
        <Text style={styles.subtitle}>Voici l'état actuel de vos chantiers</Text>
        
        <View style={styles.statsGrid}>
          {stats.map((item) => (
            <View key={item.id} style={styles.statCard}>
              <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Dernière alerte météo</Text>
          <View style={styles.alertRow}>
            <MaterialCommunityIcons name="weather-windy" size={30} color="#cb6516" />
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertBold}>Vents violents prévus</Text>
              <Text style={styles.alertSub}>Arrêt des grues conseillé à 14h00 sur le site.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f0f0',
  },

  content: {
    padding: 20,
    paddingBottom: 100,
  },

  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 25,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  statCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },

  statLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },

  infoBox: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
  },

  infoTitle: {
    color: '#cb6516',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  alertTextContainer: {
    flex: 1,
    marginLeft: 15,
  },

  alertBold: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  alertSub: {
    color: '#BBBBBB',
    fontSize: 13,
    marginTop: 4,
  },
});


export default DashboardPage;