import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet, View, Text, FlatList, TouchableOpacity,
  TextInput, LayoutAnimation, Platform, UIManager, ActivityIndicator, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../Theme/ThemeContext';
import { ThemeColors } from '../../Theme/colors';
import { useSession } from '../../Context/SessionContext';
import AddMemberModal from '../../Components/Team/AddMemberModal';
import worksiteService from '../../Services/worksiteService';
import teamService from '../../Services/teamService';
import { MemberDetail, TeamSummary } from '../../Types/Worksite';
import { formatDate } from '../../Utils/siteStatus';
import { DashboardStackParamList } from '../../Navigation/TabNavigator';

interface StatusStyle {
  bg: string;
  text: string;
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<DashboardStackParamList, 'TeamList'>;

const getStatusStyle = (status: string): StatusStyle => {
  switch (status) {
    case 'Complete': return { bg: '#e8f5e9', text: '#2e7d32' };
    case 'En attente': return { bg: '#fff3e0', text: '#ef6c00' };
    case 'Annulé': return { bg: '#ffebee', text: '#c62828' };
    case 'En cours': return { bg: '#f5f5f5', text: '#616161' };
    default: return { bg: '#e5e7eb', text: '#374151' };
  }
};

const TeamListPage: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { chantierName, siteId } = route.params;
  const { canManageTeams } = useSession();
  const tabBarHeight = useBottomTabBarHeight();

  const [members, setMembers] = useState<MemberDetail[]>([]);
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedWorkerId, setExpandedWorkerId] = useState<string | null>(null);
  const [addVisible, setAddVisible] = useState<boolean>(false);

  const load = useCallback(async () => {
    setError('');
    const [membersRes, teamsRes] = await Promise.allSettled([
      worksiteService.getMembers(siteId),
      worksiteService.getTeams(siteId),
    ]);
    if (membersRes.status === 'fulfilled') setMembers(membersRes.value);
    else setError("Impossible de charger l'équipe.");
    setTeams(teamsRes.status === 'fulfilled' ? teamsRes.value : []);
    setLoading(false);
  }, [siteId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' },
    });
    setExpandedWorkerId(expandedWorkerId === id ? null : id);
  };

  const confirmRemove = (member: MemberDetail) => {
    Alert.alert('Retirer de l\'équipe', `Retirer ${member.name} de l'équipe ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: async () => {
          try {
            await teamService.removeMember(member.teamId, member.id);
            setExpandedWorkerId(null);
            await load();
          } catch (err: any) {
            const message = err?.response?.status === 403
              ? "Votre rôle ne permet pas de retirer un membre."
              : 'Impossible de retirer ce membre pour le moment.';
            Alert.alert('Action impossible', message);
          }
        },
      },
    ]);
  };

  const filteredWorkers = members.filter(worker =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.specialite.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderWorker = ({ item }: { item: MemberDetail }) => {
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
              <MaterialCommunityIcons name="email-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{item.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="calendar-range" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>Début : {formatDate(item.dateDebut)}</Text>
            </View>
            {canManageTeams && (
              <TouchableOpacity style={styles.removeButton} onPress={() => confirmRemove(item)}>
                <MaterialCommunityIcons name="account-remove-outline" size={18} color={colors.danger} />
                <Text style={styles.removeText}>Retirer de l'équipe</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#c2410c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Équipe / {chantierName}</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.muted} />
          <TextInput
            placeholder="Chercher un ouvrier..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.muted}
          />
        </View>
        {canManageTeams && teams.length > 0 && (
          <TouchableOpacity style={styles.addButton} onPress={() => setAddVisible(true)}>
            <Text style={styles.addButtonText}>+ Nouveau</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#c2410c" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredWorkers}
          keyExtractor={item => item.id}
          renderItem={renderWorker}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + 40 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{error || (searchQuery ? 'Aucun ouvrier trouvé.' : "Aucun membre d'équipe sur ce chantier.")}</Text>
          }
        />
      )}

      <AddMemberModal
        visible={addVisible}
        teams={teams}
        memberIds={members.map(member => member.id)}
        onClose={() => setAddVisible(false)}
        onAdded={load}
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: colors.background },
  backBtn: { marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  searchSection: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: colors.background },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 40, marginRight: 10, paddingHorizontal: 12, backgroundColor: colors.background, borderRadius: 20 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: colors.text },
  addButton: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, backgroundColor: '#c2410c' },
  addButtonText: { fontSize: 13, fontWeight: 'bold', color: '#FFF' },
  listContent: { padding: 15, paddingBottom: 100 },
  workerCard: { backgroundColor: colors.surface, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', elevation: 2 },
  workerCardExpanded: { backgroundColor: colors.surface, borderColor: '#c2410c', elevation: 4 },
  mainRow: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  avatar: { width: 45, height: 45, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  workerInfo: { flex: 1, marginLeft: 15 },
  workerName: { fontSize: 15, fontWeight: 'bold', color: colors.text },
  workerSpecialty: { fontSize: 12, color: colors.muted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  detailsSection: { paddingHorizontal: 15, paddingBottom: 15, backgroundColor: colors.background },
  divider: { height: 1, marginBottom: 12, backgroundColor: colors.border },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  loader: { marginTop: 60 },
  emptyText: { textAlign: 'center', color: colors.muted, marginTop: 40, fontSize: 14 },
  removeButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 8, paddingVertical: 6 },
  removeText: { marginLeft: 6, fontSize: 13, fontWeight: '600', color: colors.danger },
  detailText: { fontSize: 13, color: colors.textSecondary, marginLeft: 10 },
});

export default TeamListPage;