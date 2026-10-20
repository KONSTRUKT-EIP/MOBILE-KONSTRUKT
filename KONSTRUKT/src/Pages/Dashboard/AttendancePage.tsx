import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../API/Api';
import { DashboardStackParamList } from '../../Navigation/TabNavigator';

// 1. Définition des types spécifiques à la présence
type AttendanceStatus = 'present' | 'absent' | 'retard' | 'conge' | 'en-attente';

interface AttendanceWorker {
  id: string;
  teamId: string;
  specialite: string;
  name: string;
  initials: string;
  color: string;
}

interface AttendanceWeekResponse {
  days: string[];
  dates: string[];
  attendances: Record<string, AttendanceStatus[]>;
}

// Ordre de cycle quand on tape sur un badge, et statut envoyé au backend
const STATUS_CYCLE: AttendanceStatus[] = ['present', 'retard', 'absent', 'conge'];
const STATUS_TO_BACKEND: Record<AttendanceStatus, string> = {
  present: 'PRESENT',
  absent: 'ABSENT',
  retard: 'RETARD',
  conge: 'CONGE',
  'en-attente': 'PRESENT', // ne devrait jamais être envoyé, garde-fou uniquement
};

type Props = NativeStackScreenProps<DashboardStackParamList, 'Attendance'>;

const AttendancePage: React.FC<Props> = ({ navigation, route }) => {
  const { chantierName, siteId } = route.params;
  const insets = useSafeAreaInsets();

  const [workers, setWorkers] = useState<AttendanceWorker[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus[]>>({});
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statusConfig: Record<AttendanceStatus, { label: string; bg: string; text: string }> = {
    present: { label: 'Présent', bg: '#e8f5e9', text: '#2e7d32' },
    absent: { label: 'Absent', bg: '#ffebee', text: '#c62828' },
    retard: { label: 'Retard', bg: '#fff3e0', text: '#ef6c00' },
    conge: { label: 'Congé', bg: '#e3f2fd', text: '#1976d2' },
    'en-attente': { label: 'En attente', bg: '#f3f4f6', text: '#6b7280' },
  };

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const [membersRes, weekRes] = await Promise.all([
        api.get<AttendanceWorker[]>(`/teams/site/${siteId}/members-details`),
        api.get<AttendanceWeekResponse>(`/teams/site/${siteId}/attendance-week`),
      ]);
      setWorkers(membersRes.data);
      setDays(weekRes.data.days);
      setDates(weekRes.data.dates);
      setAttendanceData(weekRes.data.attendances);
    } catch (err) {
      console.error('Erreur API Attendance:', err);
      Alert.alert('Erreur', 'Impossible de charger les présences.');
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleStatusPress = async (worker: AttendanceWorker) => {
    const currentStatus = attendanceData[worker.id]?.[selectedDayIndex] || 'en-attente';
    const currentIndex = STATUS_CYCLE.indexOf(currentStatus as AttendanceStatus);
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];
    const date = dates[selectedDayIndex];
    if (!date) return;

    const previousData = attendanceData;
    setAttendanceData(prev => {
      const updated = [...(prev[worker.id] || [])];
      updated[selectedDayIndex] = nextStatus;
      return { ...prev, [worker.id]: updated };
    });
    setUpdatingId(worker.id);

    try {
      await api.patch('/attendance/upsert', {
        teamId: worker.teamId,
        userId: worker.id,
        date,
        status: STATUS_TO_BACKEND[nextStatus],
      });
    } catch (err) {
      console.error('Erreur mise a jour presence:', err);
      Alert.alert('Erreur', "La mise à jour de la présence n'a pas pu être enregistrée.");
      setAttendanceData(previousData);
    } finally {
      setUpdatingId(null);
    }
  };

  const renderAttendanceCard = ({ item }: { item: AttendanceWorker }) => {
    const statusKey = attendanceData[item.id]?.[selectedDayIndex] || 'en-attente';
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
        <TouchableOpacity
          style={[styles.badge, { backgroundColor: config.bg }]}
          onPress={() => handleStatusPress(item)}
          disabled={updatingId === item.id}
        >
          {updatingId === item.id ? (
            <ActivityIndicator size="small" color={config.text} />
          ) : (
            <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const counts = workers.reduce<Record<string, number>>((acc, worker) => {
    const status = attendanceData[worker.id]?.[selectedDayIndex] || 'en-attente';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#c2410c" />
      </View>
    );
  }

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
          {days.map((day, index) => (
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
        keyExtractor={item => item.id}
        renderItem={renderAttendanceCard}
        contentContainerStyle={[styles.list, { paddingBottom: 100 + insets.bottom }]}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun membre d'équipe sur ce chantier.</Text>
        }
      />

      <View style={[styles.footer, { paddingBottom: 15 + insets.bottom }]}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#f3f4f6' },
  headerTitle: { marginLeft: 10, fontSize: 20, fontWeight: 'bold', color: '#111827' },
  selectorContainer: { paddingVertical: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  dayButton: { paddingHorizontal: 18, paddingVertical: 8, marginHorizontal: 5, borderRadius: 999, backgroundColor: '#f3f4f6' },
  dayButtonActive: { backgroundColor: '#c2410c' },
  dayText: { fontSize: 13, fontWeight: 'bold', color: '#6b7280' },
  dayTextActive: { color: '#ffffff' },
  list: { padding: 15, paddingBottom: 100 },
  emptyText: { textAlign: 'center', color: '#6b7280', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 10, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', elevation: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: 'bold' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  sub: { fontSize: 12, color: '#6b7280' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, minWidth: 70, alignItems: 'center' },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  summaryItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  summaryLabel: { fontSize: 10, color: '#6b7280', marginRight: 4 },
  summaryCount: { fontSize: 12, fontWeight: 'bold', color: '#111827' },
});

export default AttendancePage;
