import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const attendanceDays = ['Lun 3', 'Mar 4', 'Mer 5', 'Jeu 6', 'Ven 7'];

const attendanceData = {
  1: ['present', 'present', 'retard',  'present', 'present'],
  2: ['absent',  'present', 'present', 'absent',  'present'],
  3: ['present', 'present', 'present', 'present', 'present'],
  4: ['conge',   'conge',   'absent',  'absent',  'conge'  ],
  5: ['present', 'retard',  'present', 'present', 'present'],
  7: ['retard',  'present', 'present', 'present', 'present'],
  8: ['present', 'present', 'absent',  'retard',  'present'],
};

const workers = [
  { id: 1, specialite: 'Menuisier',  name: 'Arrora Gaur', initials: 'AG', color: '#f97316' },
  { id: 2, specialite: 'Menuisier',  name: 'James Mullican', initials: 'JM', color: '#6366f1' },
  { id: 3, specialite: 'Architecte', name: 'Robert Bacins', initials: 'RB', color: '#10b981' },
  { id: 4, specialite: 'Carreleur',  name: 'Bethany Jackson', initials: 'BJ', color: '#f43f5e' },
  { id: 5, specialite: 'Carreleur',  name: 'Anne Jacob', initials: 'AJ', color: '#8b5cf6' },
  { id: 7, specialite: 'Maçon',      name: 'James Mullican', initials: 'JM', color: '#6366f1' },
  { id: 8, specialite: 'Maçon',      name: 'Jhon Deo', initials: 'JD', color: '#0ea5e9' },
];

const AttendancePage = ({ navigation, route }) => {
  const { chantierName } = route.params || { chantierName: "Chantier" };
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const statusConfig = {
    present: { label: 'Présent', bg: '#e8f5e9', text: '#2e7d32' },
    absent: { label: 'Absent', bg: '#ffebee', text: '#c62828' },
    retard: { label: 'Retard', bg: '#fff3e0', text: '#ef6c00' },
    conge: { label: 'Congé', bg: '#e3f2fd', text: '#1976d2' },
  };

  const renderAttendanceCard = ({ item }) => {
    const statusKey = attendanceData[item.id]?.[selectedDayIndex] || 'absent';
    const config = statusConfig[statusKey];

    return (
      <View style={styles.card}>
        <View style={[styles.avatar, { backgroundColor: item.color }]}>
          <Text style={styles.avatarText}>{item.initials}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>{item.specialite}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
          <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
        </View>
      </View>
    );
  };

  const counts = Object.values(attendanceData).reduce((acc, current) => {
    const status = current[selectedDayIndex];
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#cb6516" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Présences</Text>
      </View>

      <View style={styles.selectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {attendanceDays.map((day, index) => (
            <TouchableOpacity 
              key={day} 
              style={[styles.dayButton, selectedDayIndex === index && styles.dayButtonActive]}
              onPress={() => setSelectedDayIndex(index)}
            >
              <Text style={[styles.dayText, selectedDayIndex === index && styles.dayTextActive]}>{day}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={workers}
        keyExtractor={item => item.id.toString()}
        renderItem={renderAttendanceCard}
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        {Object.entries(statusConfig).map(([key, config]) => (
          <View key={key} style={styles.summaryItem}>
            <View style={[styles.dot, { backgroundColor: config.bg }]} />
            <Text style={styles.summaryLabel}>{config.label}</Text>
            <Text style={styles.summaryCount}>{counts[key] || 0}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
  },

  headerTitle: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },

  selectorContainer: {
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },

  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,

    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },

  dayButtonActive: {
    backgroundColor: '#c2410c',
  },

  dayText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666',
  },

  dayTextActive: {
    color: '#FFF',
  },

  list: {
    padding: 15,
    paddingBottom: 100,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',

    padding: 15,
    marginBottom: 10,

    backgroundColor: '#FFF',
    borderRadius: 15,

    elevation: 2,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,

    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#FFF',
    fontWeight: 'bold',
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },

  sub: {
    fontSize: 12,
    color: '#999',
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    padding: 15,

    flexDirection: 'row',
    justifyContent: 'space-around',

    backgroundColor: '#FFF',

    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },

  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },

  summaryLabel: {
    fontSize: 10,
    color: '#666',
    marginRight: 4,
  },

  summaryCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default AttendancePage;