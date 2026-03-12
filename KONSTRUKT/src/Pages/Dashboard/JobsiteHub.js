import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../API/Api';
import StatCircle from '../../Components/Dashboard/StatCircle';

const JobsiteHub = ({ route, navigation }) => {
  const { chantierName } = route.params || { chantierName: "Tour Horizon" };
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const teamStats = [
    { id: 1, label: 'Présents', percentage: 50, color: '#10b981', sub: '4 / 8' }, 
    { id: 2, label: 'Absents',  percentage: 50, color: '#f43f5e', sub: '4 / 8' },   
    { id: 3, label: 'Tâches',   percentage: 25, color: '#6366f1', sub: '2 / 8' }, 
    { id: 4, label: 'En cours', percentage: 25, color: '#f97316', sub: '2 / 8' },   
  ];

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/armature/summary', {
          params: {
            startDate: '2024-01-01', 
            endDate: '2026-12-31'
          }
        });
        setData(response.data); 
      } catch (err) {
        console.error("Erreur API Summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color="#c2410c" />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={32} color="#c2410c" />
          </TouchableOpacity>
          <Text style={styles.title}>{chantierName}</Text>
        </View>
    
        <View style={styles.whiteCard}>
          <Text style={styles.sectionTitle}>Statistiques / {chantierName}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalRow}>
            {teamStats.map((item) => (
              <View key={item.id} style={styles.statWrapper}>
                <StatCircle 
                  percentage={item.percentage} 
                  color={item.color} 
                />
                <View style={styles.statTextContainer}>
                    <Text style={styles.statLabelText}>{item.label}</Text>
                    <Text style={styles.statSubText}>{item.sub}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('TeamList', { chantierName })}
          >
            <View style={[styles.iconCircle, {backgroundColor: '#e0e7ff'}]}>
              <MaterialCommunityIcons name="account-group" size={26} color="#4f46e5" />
            </View>
            <Text style={styles.actionLabel}>Équipe</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('Attendance', { chantierName })}
          >
            <View style={[styles.iconCircle, {backgroundColor: '#e8f5e9'}]}>
              <MaterialCommunityIcons name="calendar-check" size={26} color="#2e7d32" />
            </View>
            <Text style={styles.actionLabel}>Présences</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Suivi par catégorie</Text>
        {data?.categories.map((cat) => (
          <TouchableOpacity 
            key={cat.id} 
            style={styles.categoryCard}
            onPress={() => navigation.navigate('TradeDashboard', { chantierName, category: cat.name })}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.cardLabel}>{cat.name}</Text>
              <Text style={styles.cardDesc}>{cat.spent || 0} € dépensés</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.progressValue}>{cat.progress || 0}%</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${cat.progress || 0}%` }]} />
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#333" />
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    padding: 20,
    paddingBottom: 110,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  backButton: {
    marginRight: 10,
    marginLeft: -10,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 14,
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
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  horizontalRow: {
    flexDirection: 'row',
    paddingVertical: 10,
  },

  statWrapper: {
    width: 100,
    marginRight: 10,
    alignItems: 'center',
  },

  statTextContainer: {
    marginTop: 8,
    alignItems: 'center',
  },

  statLabelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },

  statSubText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },

  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },

  cardLeft: {
    flex: 1.2,
  },

  cardLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  cardDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  cardRight: {
    flex: 1,
    paddingHorizontal: 10,
  },

  progressValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6366f1',
    textAlign: 'right',
  },

  progressBarBg: {
    height: 6,
    marginTop: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },

  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#818CF8',
  },
});

export default JobsiteHub;