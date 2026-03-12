import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const defaultWorkers = [
  { id: 1, specialite: 'Menuisier',  name: 'Arrora Gaur',     email: 'arroragaur@gmail.com',     dateDebut: '12 Dec, 2025', status: 'En attente', initials: 'AG', color: '#f97316' },
  { id: 2, specialite: 'Menuisier',  name: 'James Mullican',  email: 'jamesmullican@gmail.com',  dateDebut: '10 Dec, 2025', status: 'En attente', initials: 'JM', color: '#6366f1' },
  { id: 3, specialite: 'Architecte', name: 'Robert Bacins',   email: 'robertbacins@gmail.com',   dateDebut: '09 Dec, 2025', status: 'Complete',   initials: 'RB', color: '#10b981' },
  { id: 4, specialite: 'Carreleur',  name: 'Bethany Jackson', email: 'bethanyjackson@gmail.com', dateDebut: '09 Dec, 2025', status: 'Annulé',     initials: 'BJ', color: '#f43f5e' },
  { id: 5, specialite: 'Carreleur',  name: 'Anne Jacob',      email: 'annejacob@gmail.com',      dateDebut: '10 Dec, 2025', status: 'Complete',   initials: 'AJ', color: '#8b5cf6' },
  { id: 7, specialite: 'Maçon',      name: 'James Mullican',  email: 'jamesmullican@gmail.com',  dateDebut: '10 Dec, 2025', status: 'En cours',   initials: 'JM', color: '#6366f1' },
  { id: 8, specialite: 'Maçon',      name: 'Jhon Deo',        email: 'jhondeo32@gmail.com',      dateDebut: '10 Dec, 2025', status: 'En cours',   initials: 'JD', color: '#0ea5e9' },
];

const TeamListPage = ({ navigation, route }) => {
  const { chantierName } = route.params || { chantierName: "Chantier" };
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedWorkerId, setExpandedWorkerId] = useState(null);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' },
    });
    setExpandedWorkerId(expandedWorkerId === id ? null : id);
  };

  const filteredWorkers = defaultWorkers.filter(worker =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.specialite.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Complete': return { bg: '#e8f5e9', text: '#2e7d32' };
      case 'En attente': return { bg: '#fff3e0', text: '#ef6c00' };
      case 'Annulé': return { bg: '#ffebee', text: '#c62828' };
      case 'En cours': return { bg: '#f5f5f5', text: '#616161' };
      default: return { bg: '#eee', text: '#333' };
    }
  };

  const renderWorker = ({ item }) => {
    const isExpanded = expandedWorkerId === item.id;
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity 
        style={[styles.workerCard, isExpanded && styles.workerCardExpanded]} 
        onPress={() => toggleExpand(item.id)}
        activeOpacity={1}
      >
        <View style={styles.mainRow}>
          <View style={[styles.avatar, { backgroundColor: item.color }]}>
            <Text style={styles.avatarText}>{item.initials}</Text>
          </View>
          <View style={styles.workerInfo}>
            <Text style={styles.workerName}>{item.name}</Text>
            <Text style={styles.workerSpecialty}>{item.specialite}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.detailsSection}>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="email-outline" size={16} color="#555" />
              <Text style={styles.detailText}>{item.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="calendar-range" size={16} color="#555" />
              <Text style={styles.detailText}>Début : {item.dateDebut}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#cb6516" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Équipe / {chantierName}</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#999" />
          <TextInput 
            placeholder="Chercher un ouvrier..." 
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Nouveau</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredWorkers}
        keyExtractor={item => item.id.toString()}
        renderItem={renderWorker}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
  },

  backBtn: {
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
  },

  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,

    marginRight: 10,
    paddingHorizontal: 12,

    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },

  addButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#c2410c',
  },

  addButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
  },

  listContent: {
    padding: 15,
    paddingBottom: 100,
  },

  workerCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,

    marginBottom: 10,

    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',

    elevation: 2,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  workerCardExpanded: {
    backgroundColor: '#FFF',
    borderColor: '#c2410c',

    elevation: 5,
    shadowOpacity: 0.15,
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,

    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },

  workerInfo: {
    flex: 1,
    marginLeft: 15,
  },

  workerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  workerSpecialty: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  detailsSection: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#fafafa',
  },

  divider: {
    height: 1,
    marginBottom: 12,
    backgroundColor: '#EEE',
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  detailText: {
    fontSize: 13,
    color: '#444',
    marginLeft: 10,
  },
});

export default TeamListPage;