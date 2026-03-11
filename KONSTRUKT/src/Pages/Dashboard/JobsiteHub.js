import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StatCircle from '../../Components/Dashboard/StatCircle';

const dashboards = [
  { id: "armature",   label: "Armature",    description: "Voiles, planchers, poutres", progress: 72 },
  { id: "beton",      label: "Béton",       description: "Coulage, dosage, résistance", progress: 45 },
  { id: "charpente",  label: "Charpente",   description: "Structure bois et métal",    progress: 60 },
  { id: "electricite",label: "Électricité", description: "Câblage, tableaux, prises",  progress: 30 },
  { id: "plomberie",  label: "Plomberie",   description: "Réseaux eau, évacuations",   progress: 55 },
  { id: "finitions",  label: "Finitions",   description: "Peinture, revêtements",      progress: 10 },
];

const statusData = [
  { label: 'Complet',    count: 2, total: 8, color: '#6366f1' },
  { label: 'En cours',   count: 2, total: 8, color: '#f97316' },
  { label: 'En attente', count: 3, total: 8, color: '#374151' },
  { label: 'Annulé',     count: 1, total: 8, color: '#f472b6' },
];

const JobsiteHub = ({ route, navigation }) => {
  const { chantierName } = route.params || { chantierName: "Chantier" };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color="#cb6516" />
            <Text style={styles.backText}>Retour aux chantiers</Text>
          </TouchableOpacity>
          
          <Text style={styles.breadcrumb}>Tous les chantiers  /  <Text style={styles.breadcrumbActive}>{chantierName}</Text></Text>
          <Text style={styles.title}>{chantierName}</Text>
          <Text style={styles.subtitle}>Sélectionne un dashboard</Text>
        </View>
        
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Statistiques / {chantierName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigation.navigate('TeamList', { chantierName })}>
                  <MaterialCommunityIcons name="account-group" size={26} color="#cb6516" style={{ marginRight: 15 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Attendance', { chantierName })}>
                  <MaterialCommunityIcons name="calendar-check" size={26} color="#2e7d32" />
                </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.donutGrid}
            onPress={() => navigation.navigate('Attendance', { chantierName })}
            activeOpacity={0.8}
          >
            <View style={styles.donutRow}>
              <StatCircle percentage={50} color="#10b981" label="Présents" />
              <StatCircle percentage={50} color="#f43f5e" label="Absents" />
            </View>
            <View style={styles.donutRow}>
              <StatCircle percentage={25} color="#6366f1" label="Tâches complètes" />
              <StatCircle percentage={25} color="#f97316" label="En cours" />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.summaryTitle}>RÉSUMÉ DES STATUTS</Text>
          {statusData.map((item) => (
            <View key={item.label} style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: item.color }]} />
              <Text style={styles.statusLabel}>{item.label}</Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBg, { flex: 1 }]}>
                  <View style={[styles.progressFill, { width: `${(item.count / item.total) * 100}%`, backgroundColor: item.color }]} />
                </View>
                <Text style={styles.statusCount}>{item.count} / {item.total}</Text>
              </View>
            </View>
          ))}
        </View>

        {dashboards.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.categoryCard}
            onPress={() => navigation.navigate('TradeDashboard', { chantierName, category: item.label })}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
            </View>
            <View style={styles.cardRight}>
              <View style={styles.progressTextRow}>
                <Text style={styles.progressLabel}>Avancement</Text>
                <Text style={styles.progressValue}>{item.progress}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${item.progress}%` }]} />
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
    backgroundColor: '#f0f4f4',
  },

  content: {
    padding: 20,
    paddingBottom: 110,
  },

  header: {
    marginBottom: 25,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: -5,
  },

  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cb6516',
  },

  breadcrumb: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },

  breadcrumbActive: {
    fontWeight: 'bold',
    color: '#1E1E1E',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E1E1E',
  },

  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },

  statsCard: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 20,
    marginBottom: 25,

    elevation: 4,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E1E1E',
  },

  donutGrid: {
    marginBottom: 10,
  },

  donutRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 20,
  },

  summaryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 15,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },

  statusLabel: {
    width: 80,
    fontSize: 13,
    color: '#374151',
  },

  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    marginRight: 10,
  },

  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  statusCount: {
    width: 35,
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'right',
  },

  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,

    elevation: 2,
  },

  cardLeft: {
    flex: 1.2,
  },

  cardLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E1E1E',
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

  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  progressLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },

  progressValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6366f1',
  },

  progressBarBg: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: '#818CF8',
  },
});

export default JobsiteHub;