import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StatCircle from '../../Components/Dashboard/StatCircle'; //

const DashboardPage = ({ route, navigation }) => {
  const { chantierName } = route.params || { chantierName: "Chantier" };
  const [userName, setUserName] = useState('Utilisateur');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userFirstName'); //
        if (storedName) setUserName(storedName);
      } catch (e) {
        console.error("Erreur prénom", e);
      }
    };
    fetchUserData();
  }, []);

  const attendanceStats = [
    { id: 1, label: 'Présents', percentage: 75, color: '#10b981' }, 
    { id: 2, label: 'Tâches', percentage: 45, color: '#6366f1' },   
    { id: 3, label: 'En cours', percentage: 60, color: '#f97316' }, 
    { id: 4, label: 'Absents', percentage: 15, color: '#f43f5e' },   
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#c2410c" />
          <Text style={styles.backText}>Liste des chantiers</Text>
        </TouchableOpacity>

        <View style={styles.welcomeHeader}>
          <Text style={styles.welcomeText}>{chantierName}</Text> 
          <Text style={styles.subtitle}>Bonjour {userName}, voici le suivi d'aujourd'hui</Text>
        </View>
    
        <View style={styles.whiteCard}>
          <Text style={styles.sectionTitle}>Statistiques d'équipe</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalRow}>
            {attendanceStats.map((item) => (
              <StatCircle 
                key={item.id} 
                percentage={item.percentage} 
                color={item.color} 
                label={item.label} 
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.actionGrid}>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('TeamList', { chantierName })}
          >
            <View style={[styles.iconCircle, {backgroundColor: '#ffedd5'}]}>
              <MaterialCommunityIcons name="account-group" size={26} color="#c2410c" />
            </View>
            <Text style={styles.actionLabel}>Équipe</Text>
            <Text style={styles.actionSub}>24 membres</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Attendance', { chantierName })}
          >
            <View style={[styles.iconCircle, {backgroundColor: '#e8f5e9'}]}>
              <MaterialCommunityIcons name="calendar-check" size={26} color="#2e7d32" />
            </View>
            <Text style={styles.actionLabel}>Présences</Text>
            <Text style={styles.actionSub}>Saisie du jour</Text>
          </TouchableOpacity>

        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.miniCard}>
            <Text style={[styles.miniVal, {color: '#d32f2f'}]}>3</Text>
            <Text style={styles.miniLabel}>Urgences</Text>
          </View>
          <View style={styles.miniCard}>
            <Text style={styles.miniVal}>12</Text>
            <Text style={styles.miniLabel}>Lots validés</Text>
          </View>
        </View>

        <View style={styles.placeholderCard}>
          <MaterialCommunityIcons name="crane" size={24} color="#CCC" />
          <Text style={styles.placeholderText}>Suivi béton & armature (bientôt)</Text>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },

  content: {
    padding: 20,
    paddingBottom: 110,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginLeft: -5,
  },

  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c2410c',
  },

  welcomeHeader: {
    marginBottom: 20,
  },

  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },

  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },

  whiteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },

  horizontalRow: {
    flexDirection: 'row',
  },

  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  actionCard: {
    width: '48%',
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 2,
  },

  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 10,
  },

  actionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },

  actionSub: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  miniCard: {
    width: '48%',
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 2,
  },

  miniVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },

  miniLabel: {
    fontSize: 12,
    color: '#6b7280',
  },

  placeholderCard: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 20,
    padding: 25,

    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DDD',
  },

  placeholderText: {
    fontSize: 13,
    color: '#AAA',
    marginLeft: 10,
  },
});

export default DashboardPage;