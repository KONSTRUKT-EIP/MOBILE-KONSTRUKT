import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../../Navigation/TabNavigator'; // Import du type des onglets
import { useSession } from '../../Context/SessionContext';
import siteService, { SiteProgressMap } from '../../Services/siteService';
import { useTheme } from '../../Theme/ThemeContext';
import { ThemeColors } from '../../Theme/colors';

// 1. Typage des Props pour l'onglet Chantiers
type Props = BottomTabScreenProps<TabParamList, 'Chantiers'>;

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  PLANIFIE: { label: 'Planifié', bg: '#e0e7ff', text: '#4338ca' },
  EN_COURS: { label: 'En cours', bg: '#dcfce7', text: '#15803d' },
  SUSPENDU: { label: 'Suspendu', bg: '#fef3c7', text: '#b45309' },
  TERMINE: { label: 'Terminé', bg: '#f3f4f6', text: '#4b5563' },
  ANNULE: { label: 'Annulé', bg: '#fee2e2', text: '#b91c1c' },
};

type SortKey = 'recent' | 'name' | 'status';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Récents' },
  { key: 'name', label: 'Nom' },
  { key: 'status', label: 'Statut' },
];

const STATUS_ORDER = ['EN_COURS', 'PLANIFIE', 'SUSPENDU', 'TERMINE', 'ANNULE'];

const normalize = (value: string): string =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const WorksitesPage: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { sites, loaded, error, loadSession, selectSite, canCreateSite } = useSession();
  const [query, setQuery] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [progress, setProgress] = useState<SiteProgressMap>({});

  useEffect(() => {
    if (!loaded) loadSession();
  }, [loaded, loadSession]);

  useEffect(() => {
    if (!loaded) return;
    siteService
      .getProgress()
      .then(setProgress)
      .catch(() => setProgress({}));
  }, [loaded, sites]);

  const visibleSites = useMemo(() => {
    const needle = normalize(query);
    const filtered = needle
      ? sites.filter(site => normalize(`${site.name} ${site.city}`).includes(needle))
      : sites;
    if (sortKey === 'name') return [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    if (sortKey === 'status') {
      return [...filtered].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
    }
    return filtered;
  }, [sites, query, sortKey]);

  return (
    <View style={styles.container}>
      {/* Banner orange assortie au frontend /worksites */}
      <View style={styles.banner}>
        <Text style={styles.brandText}>KONSTRUKT</Text>
        <Text style={styles.bannerTitle}>Chantiers</Text>
        <Text style={styles.bannerSub}>Consultez et gérez vos chantiers</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {canCreateSite && (
          <TouchableOpacity
            style={styles.createBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Dashboard', { screen: 'CreateSite' })}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#ffffff" />
            <Text style={styles.createBtnText}>Créer un chantier</Text>
          </TouchableOpacity>
        )}

        {loaded && sites.length > 0 && (
          <View style={styles.searchBlock}>
            <View style={styles.searchBox}>
              <MaterialCommunityIcons name="magnify" size={20} color={colors.placeholder} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un chantier ou une ville…"
                placeholderTextColor={colors.placeholder}
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <MaterialCommunityIcons name="close-circle" size={18} color={colors.placeholder} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.sortRow}>
              <Text style={styles.sortLabel}>Trier :</Text>
              {SORT_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.sortChip, sortKey === option.key && styles.sortChipActive]}
                  onPress={() => setSortKey(option.key)}
                >
                  <Text style={[styles.sortChipText, sortKey === option.key && styles.sortChipTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {!loaded ? (
          <ActivityIndicator size="large" color="#c2410c" style={styles.loader} />
        ) : error ? (
          <Text style={styles.emptyText}>{error}</Text>
        ) : sites.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="office-building-outline" size={56} color="#e5e7eb" />
            <Text style={styles.emptyTitle}>Aucun chantier</Text>
            <Text style={styles.emptyText}>Aucun chantier ne vous est affecté pour le moment.</Text>
          </View>
        ) : visibleSites.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="magnify-close" size={56} color="#e5e7eb" />
            <Text style={styles.emptyTitle}>Aucun chantier trouvé</Text>
            <Text style={styles.emptyText}>Essayez un autre nom ou une autre ville.</Text>
          </View>
        ) : (
          visibleSites.map(site => {
            const status = STATUS_LABELS[site.status];
            const percent = progress[site.id];
            return (
              <TouchableOpacity
                key={site.id}
                style={styles.siteCard}
                activeOpacity={0.85}
                onPress={() => {
                  selectSite(site.id);
                  navigation.navigate('Dashboard', {
                    screen: 'JobsiteHub',
                    params: { chantierName: site.name, siteId: site.id },
                  });
                }}
              >
                <View style={styles.siteIcon}>
                  <MaterialCommunityIcons name="office-building" size={24} color="#c2410c" />
                </View>
                <View style={styles.siteInfo}>
                  <Text style={styles.siteName}>{site.name}</Text>
                  <Text style={styles.siteLocation}>{site.city}, {site.postalCode}</Text>
                  {percent !== undefined && percent !== null && (
                    <View style={styles.progressRow}>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${Math.min(Math.max(percent, 0), 100)}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{percent}%</Text>
                    </View>
                  )}
                </View>
                {status && (
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                  </View>
                )}
                <MaterialCommunityIcons name="chevron-right" size={22} color="#cccccc" />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

// ... Styles identiques à la version JS
const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  banner: { backgroundColor: '#c2410c', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  brandText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 2, color: '#fed7aa', marginBottom: 4 },
  bannerTitle: { fontSize: 26, fontWeight: 'bold', color: '#ffffff' },
  bannerSub: { fontSize: 13, color: '#fed7aa', marginTop: 4 },
  content: { padding: 16, paddingBottom: 110 },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#c2410c', borderRadius: 999, paddingVertical: 13, paddingHorizontal: 24, marginBottom: 24, alignSelf: 'flex-start', elevation: 2 },
  createBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14, marginLeft: 6 },
  loader: { marginTop: 40 },
  searchBlock: { marginBottom: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 },
  searchInput: { flex: 1, paddingVertical: 12, marginLeft: 8, fontSize: 14, color: colors.text },
  sortRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  sortLabel: { fontSize: 13, color: colors.muted, marginRight: 8 },
  sortChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: 6 },
  sortChipActive: { backgroundColor: '#c2410c', borderColor: '#c2410c' },
  sortChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  sortChipTextActive: { color: '#ffffff' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#e5e7eb', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: '#c2410c' },
  progressText: { marginLeft: 8, fontSize: 11, fontWeight: 'bold', color: colors.textSecondary },
  siteCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border, elevation: 2 },
  siteIcon: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#fff7ed', justifyContent: 'center', alignItems: 'center' },
  siteInfo: { flex: 1, marginLeft: 12 },
  siteName: { fontSize: 15, fontWeight: 'bold', color: colors.text },
  siteLocation: { fontSize: 12, color: colors.muted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  emptyCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: colors.border, elevation: 1 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
});

export default WorksitesPage;