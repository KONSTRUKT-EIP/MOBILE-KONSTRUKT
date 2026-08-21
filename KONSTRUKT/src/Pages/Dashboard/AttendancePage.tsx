import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../../Navigation/TabNavigator';

// 1. Définition des types spécifiques à la présence
type AttendanceStatus = 'present' | 'absent' | 'retard' | 'conge';

interface AttendanceWorker {
  id: number;
  specialite: string;
  name: string;
  initials: string;
  color: string;
}

const attendanceDays: string[] = ['Lun 3', 'Mar 4', 'Mer 5', 'Jeu 6', 'Ven 7'];

// Record<ID_Ouvrier, Statuts[]>
const attendanceData: Record<number, AttendanceStatus[]> = {
  1: ['present', 'present', 'retard',  'present', 'present'],
  2: ['absent',  'present', 'present', 'absent',  'present'],
  3: ['present', 'present', 'present', 'present', 'present'],
  4: ['conge',   'conge',   'absent',  'absent',  'conge'  ],
  5: ['present', 'retard',  'present', 'present', 'present'],
  7: ['retard',  'present', 'present', 'present', 'present'],
  8: ['present', 'present', 'absent',  'retard',  'present'],
};

const workers: AttendanceWorker[] = [
  { id: 1, specialite: 'Menuisier',  name: 'Arrora Gaur', initials: 'AG', color: '#f97316' },
  { id: 2, specialite: 'Menuisier',  name: 'James Mullican', initials: 'JM', color: '#6366f1' },
  { id: 3, specialite: 'Architecte', name: 'Robert Bacins', initials: 'RB', color: '#10b981' },
  { id: 4, specialite: 'Carreleur',  name: 'Bethany Jackson', initials: 'BJ', color: '#f43f5e' },
  { id: 5, specialite: 'Carreleur',  name: 'Anne Jacob', initials: 'AJ', color: '#8b5cf6' },
  { id: 7, specialite: 'Maçon',      name: 'James Mullican', initials: 'JM', color: '#6366f1' },
  { id: 8, specialite: 'Maçon',      name: 'Jhon Deo', initials: 'JD', color: '#0ea5e9' },
];

type Props = NativeStackScreenProps<DashboardStackParamList, 'Attendance'>;

const AttendancePage: React.FC<Props> = ({ navigation, route }) => {
  const { chantierName } = route.params;
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  const statusConfig: Record<AttendanceStatus, { label: string; bg: string; text: string }> = {
    present: { label: 'Présent', bg: '#e8f5e9', text: '#2e7d32' },
    absent: { label: 'Absent', bg: '#ffebee', text: '#c62828' },
    retard: { label: 'Retard', bg: '#fff3e0', text: '#ef6c00' },
    conge: { label: 'Congé', bg: '#e3f2fd', text: '#1976d2' },
  };

  const renderAttendanceCard = ({ item }: { item: AttendanceWorker }) => {
    const statusKey = attendanceData[item.id]?.[selectedDayIndex] || 'absent';
    const config = statusConfig[statusKey];

    return (
      <View style={styles.card}>
        <View style={[styles.avatar, { backgroundColor: item.color }]}>
          <Text style={styles.avatarText}>{item.initials}</Text>
        </View>
        <div style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>{item.specialite}</Text>
        </div>
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
          <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
        </View>
      </View>
    );
  };

  // Calcul dynamique des compteurs typés
  const counts = Object.values(attendanceData).reduce((acc: Record<string, number>, current) => {
    const status = current[selectedDayIndex];
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#c2410c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Présences / {chantierName}</Text>
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
        {(Object.entries(statusConfig) as [AttendanceStatus, any][]).map(([key, config]) => (
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

// ... Styles identiques
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#f3f4f6' },
  headerTitle: { marginLeft: 10, fontSize: 20, fontWeight: 'bold', color: '#111827' },
  selectorContainer: { paddingVertical: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  dayButton: { paddingHorizontal: 18, paddingVertical: 8, marginHorizontal: 5, borderRadius: 999, backgroundColor: '#f3f4f6' },
  dayButtonActive: { backgroundColor: '#c2410c' },
  dayText: { fontSize: 13, fontWeight: 'bold', color: '#6b7280' },
  dayTextActive: { color: '#ffffff' },
  list: { padding: 15, paddingBottom: 100 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 10, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', elevation: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: 'bold' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  sub: { fontSize: 12, color: '#6b7280' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  summaryItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  summaryLabel: { fontSize: 10, color: '#6b7280', marginRight: 4 },
  summaryCount: { fontSize: 12, fontWeight: 'bold', color: '#111827' },
});

export default AttendancePage;