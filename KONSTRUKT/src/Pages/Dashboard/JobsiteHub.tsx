import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../API/Api';
import StatCircle from '../../Components/Dashboard/StatCircle';
import SiteSwitcher from '../../Components/SiteSwitcher';
import { useSession } from '../../Context/SessionContext';
import worksiteService from '../../Services/worksiteService';
import siteService from '../../Services/siteService';
import { MemberDetail, SiteDetail, SiteStats, TeamSummary } from '../../Types/Worksite';
import { formatBudget, formatDate, siteStatus } from '../../Utils/siteStatus';
import { roleLabel } from '../../Utils/roles';
import { DashboardStackParamList } from '../../Navigation/TabNavigator';

// 1. Définition des interfaces pour les données de l'API
interface Category {
  id: string | number;
  name: string;
  spent: number;
  progress: number;
}

interface SummaryData {
  categories: Category[];
}

interface TeamStat {
  id: number;
  label: string;
  percentage: number;
  color: string;
  sub: string;
}

// 2. Typage des Props de navigation
type Props = NativeStackScreenProps<DashboardStackParamList, 'JobsiteHub'>;

const percentOf = (count: number, total: number): number => (total > 0 ? Math.round((count / total) * 100) : 0);

const JobsiteHub: React.FC<Props> = ({ route, navigation }) => {
  const { chantierName, siteId } = route.params;
  const { sites, selectedSite, selectSite, canCreateSite, canDeleteSite, loadSession } = useSession();
  const [switcherVisible, setSwitcherVisible] = useState<boolean>(false);
  const canSwitchSite = sites.length > 1;
  const sessionSite = sites.find(site => site.id === siteId) ?? null;

  const [data, setData] = useState<SummaryData | null>(null);
  const [detail, setDetail] = useState<SiteDetail | null>(null);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [members, setMembers] = useState<MemberDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);

  const teamStats: TeamStat[] = stats
    ? [
        { id: 1, label: 'Présents', percentage: percentOf(stats.complete, stats.totalEmployees), color: '#10b981', sub: `${stats.complete} / ${stats.totalEmployees}` },
        { id: 2, label: 'Retards', percentage: percentOf(stats.retards, stats.totalEmployees), color: '#f97316', sub: `${stats.retards} / ${stats.totalEmployees}` },
        { id: 3, label: 'Absents', percentage: percentOf(stats.annule, stats.totalEmployees), color: '#f43f5e', sub: `${stats.annule} / ${stats.totalEmployees}` },
        { id: 4, label: 'En attente', percentage: percentOf(stats.enAttente, stats.totalEmployees), color: '#6366f1', sub: `${stats.enAttente} / ${stats.totalEmployees}` },
      ]
    : [];

  useFocusEffect(useCallback(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [summaryRes, detailRes, statsRes, teamsRes, membersRes] = await Promise.allSettled([
        api.get<SummaryData>('/dashboard/armature/summary', {
          params: { startDate: '2024-01-01', endDate: '2026-12-31' },
        }),
        worksiteService.getDetail(siteId),
        worksiteService.getStats(siteId),
        worksiteService.getTeams(siteId),
        worksiteService.getMembers(siteId),
      ]);
      setData(summaryRes.status === 'fulfilled' ? summaryRes.value.data : null);
      setDetail(detailRes.status === 'fulfilled' ? detailRes.value : null);
      setStats(statsRes.status === 'fulfilled' ? statsRes.value : null);
      setTeams(teamsRes.status === 'fulfilled' ? teamsRes.value : []);
      setMembers(membersRes.status === 'fulfilled' ? membersRes.value : []);
      setLoading(false);
    };
    fetchAll();
  }, [siteId]));

  const confirmDelete = () => {
    Alert.alert(
      'Supprimer le chantier',
      `Voulez-vous vraiment supprimer « ${chantierName} » ? Cette action est définitive.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: handleDelete },
      ]
    );
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await siteService.deleteSite(siteId);
      if (selectedSite?.id === siteId) await selectSite(null);
      await loadSession();
      navigation.reset({ index: 0, routes: [{ name: 'DashboardList' }] });
    } catch (err: any) {
      const status = err?.response?.status;
      let message = 'Impossible de supprimer ce chantier pour le moment.';
      if (status === 403) message = "Votre rôle ne permet pas de supprimer un chantier.";
      else if (status === 404) message = 'Ce chantier est introuvable, il a peut-être déjà été supprimé.';
      else if (status === 409 || status === 500) message = 'Ce chantier contient encore des données liées et ne peut pas être supprimé.';
      Alert.alert('Suppression impossible', message);
    } finally {
      setDeleting(false);
    }
  };

  const info = detail ?? sessionSite;
  const status = siteStatus(info?.status);

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color="#c2410c" />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          {navigation.getState().routes.length > 1 && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialCommunityIcons name="chevron-left" size={32} color="#c2410c" />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{chantierName}</Text>
          {canSwitchSite && (
            <TouchableOpacity onPress={() => setSwitcherVisible(true)} style={styles.switchButton}>
              <MaterialCommunityIcons name="swap-horizontal" size={26} color="#c2410c" />
            </TouchableOpacity>
          )}
          {canCreateSite && (
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateSite')}
              style={canSwitchSite ? styles.createIcon : styles.switchButton}
            >
              <MaterialCommunityIcons name="plus-circle-outline" size={26} color="#c2410c" />
            </TouchableOpacity>
          )}
        </View>

        <SiteSwitcher
          visible={switcherVisible}
          sites={sites}
          selectedSiteId={siteId}
          onClose={() => setSwitcherVisible(false)}
          onSelect={async (site) => {
            setSwitcherVisible(false);
            if (site.id === siteId) return;
            await selectSite(site.id);
            navigation.setParams({ chantierName: site.name, siteId: site.id });
          }}
        />
    
        {info && (
          <View style={styles.whiteCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.sectionTitle}>Informations</Text>
              <View style={styles.infoActions}>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: status.text }]}>{status.label}</Text>
                </View>
                {canCreateSite && (
                  <TouchableOpacity onPress={() => navigation.navigate('CreateSite', { siteId })} style={styles.editButton}>
                    <MaterialCommunityIcons name="pencil-outline" size={20} color="#c2410c" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={18} color="#6b7280" />
              <Text style={styles.infoText}>{info.address}, {info.postalCode} {info.city}</Text>
            </View>
            {detail && (
              <>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="calendar-range" size={18} color="#6b7280" />
                  <Text style={styles.infoText}>{formatDate(detail.startDate)} → {formatDate(detail.endDate)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="cash" size={18} color="#6b7280" />
                  <Text style={styles.infoText}>Budget : {formatBudget(detail.budget)}</Text>
                </View>
                {detail.organization && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="domain" size={18} color="#6b7280" />
                    <Text style={styles.infoText}>{detail.organization.name}</Text>
                  </View>
                )}
              </>
            )}
            {sessionSite?.membershipRole && (
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <MaterialCommunityIcons name="account-key" size={18} color="#6b7280" />
                <Text style={styles.infoText}>Votre rôle : {roleLabel(sessionSite.membershipRole)}</Text>
              </View>
            )}
          </View>
        )}

        {stats && (
          <View style={styles.whiteCard}>
            <Text style={styles.sectionTitle}>Présences / {chantierName}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalRow}>
              {teamStats.map((item) => (
                <View key={item.id} style={styles.statWrapper}>
                  <StatCircle percentage={item.percentage} color={item.color} />
                  <View style={styles.statTextContainer}>
                      <Text style={styles.statLabelText}>{item.label}</Text>
                      <Text style={styles.statSubText}>{item.sub}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <Text style={styles.statNote}>Dernier jour pointé de la semaine</Text>
          </View>
        )}

        <View style={styles.actionGrid}>
          {/* On transmet les paramètres requis par DashboardStackParamList */}
          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('TeamList', { chantierName, siteId })}
          >
            <View style={[styles.iconCircle, {backgroundColor: '#e0e7ff'}]}>
              <MaterialCommunityIcons name="account-group" size={26} color="#4f46e5" />
            </View>
            <Text style={styles.actionLabel}>Équipe</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('Attendance', { chantierName, siteId })}
          >
            <View style={[styles.iconCircle, {backgroundColor: '#e8f5e9'}]}>
              <MaterialCommunityIcons name="calendar-check" size={26} color="#2e7d32" />
            </View>
            <Text style={styles.actionLabel}>Présences</Text>
          </TouchableOpacity>
        </View>

        {teams.length > 0 && (
          <View style={styles.whiteCard}>
            <Text style={styles.sectionTitle}>Équipes ({teams.length})</Text>
            {teams.map((team, index) => (
              <View key={team.id} style={[styles.listRow, index === teams.length - 1 && styles.listRowLast]}>
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{team.name}</Text>
                  <Text style={styles.listSub}>
                    {team.leader ? `Chef d'équipe : ${team.leader.firstName} ${team.leader.lastName}` : "Pas de chef d'équipe"}
                  </Text>
                </View>
                <Text style={styles.listCount}>{team._count.members} membre{team._count.members > 1 ? 's' : ''}</Text>
              </View>
            ))}
          </View>
        )}

        {members.length > 0 && (
          <View style={styles.whiteCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.sectionTitle}>Membres ({members.length})</Text>
              <TouchableOpacity onPress={() => navigation.navigate('TeamList', { chantierName, siteId })}>
                <Text style={styles.linkText}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            {members.slice(0, 5).map((member, index, list) => (
              <View key={member.id} style={[styles.listRow, index === list.length - 1 && styles.listRowLast]}>
                <View style={[styles.avatar, { backgroundColor: member.color }]}>
                  <Text style={styles.avatarText}>{member.initials}</Text>
                </View>
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{member.name}</Text>
                  <Text style={styles.listSub}>{member.specialite}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

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

        {canDeleteSite && (
          <TouchableOpacity style={[styles.deleteButton, deleting && styles.deleteDisabled]} onPress={confirmDelete} disabled={deleting}>
            {deleting ? (
              <ActivityIndicator color="#ef4444" />
            ) : (
              <>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
                <Text style={styles.deleteText}>Supprimer le chantier</Text>
              </>
            )}
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
};

// ... Styles identiques à ta version JS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 10, marginLeft: -10 },
  switchButton: { marginLeft: 'auto', padding: 6 },
  createIcon: { padding: 6 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 14 },
  whiteCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#f3f4f6', elevation: 2 },
  horizontalRow: { flexDirection: 'row', paddingVertical: 10 },
  statWrapper: { width: 100, marginRight: 10, alignItems: 'center' },
  statTextContainer: { marginTop: 8, alignItems: 'center' },
  statLabelText: { fontSize: 12, fontWeight: 'bold', color: '#111827' },
  statSubText: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionCard: { width: '48%', padding: 20, alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', elevation: 2 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  categoryCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 10, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', elevation: 2 },
  cardLeft: { flex: 1.2 },
  cardLabel: { fontSize: 16, fontWeight: 'bold' },
  cardDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  cardRight: { flex: 1, paddingHorizontal: 10 },
  infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  infoActions: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  editButton: { marginLeft: 10, padding: 2 },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  statusBadgeText: { fontSize: 12, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoRowLast: { borderBottomWidth: 0 },
  infoText: { flex: 1, marginLeft: 10, fontSize: 14, color: '#111827' },
  statNote: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  listRowLast: { borderBottomWidth: 0 },
  listInfo: { flex: 1 },
  listName: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  listSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  listCount: { fontSize: 12, fontWeight: '600', color: '#4f46e5' },
  linkText: { fontSize: 13, fontWeight: '600', color: '#c2410c' },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, paddingVertical: 14, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#fecaca' },
  deleteDisabled: { opacity: 0.6 },
  deleteText: { marginLeft: 8, color: '#ef4444', fontSize: 15, fontWeight: 'bold' },
  progressValue: { fontSize: 11, fontWeight: 'bold', color: '#6366f1', textAlign: 'right' },
  progressBarBg: { height: 6, marginTop: 5, borderRadius: 3, backgroundColor: '#E5E7EB' },
  progressBarFill: { height: '100%', borderRadius: 3, backgroundColor: '#818CF8' },
});

export default JobsiteHub;