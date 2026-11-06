import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../../Navigation/TabNavigator'; // Import du type des onglets
import { useSession } from '../../Context/SessionContext';

// 1. Typage des Props pour l'onglet Chantiers
type Props = BottomTabScreenProps<TabParamList, 'Chantiers'>;

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  PLANIFIE: { label: 'Planifié', bg: '#e0e7ff', text: '#4338ca' },
  EN_COURS: { label: 'En cours', bg: '#dcfce7', text: '#15803d' },
  SUSPENDU: { label: 'Suspendu', bg: '#fef3c7', text: '#b45309' },
  TERMINE: { label: 'Terminé', bg: '#f3f4f6', text: '#4b5563' },
  ANNULE: { label: 'Annulé', bg: '#fee2e2', text: '#b91c1c' },
};

const WorksitesPage: React.FC<Props> = ({ navigation }) => {
  const { sites, loaded, error, loadSession, selectSite, canCreateSite } = useSession();

  useEffect(() => {
    if (!loaded) loadSession();
  }, [loaded, loadSession]);

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
        ) : (
          sites.map(site => {
            const status = STATUS_LABELS[site.status];
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
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  banner: { backgroundColor: '#c2410c', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  brandText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 2, color: '#fed7aa', marginBottom: 4 },
  bannerTitle: { fontSize: 26, fontWeight: 'bold', color: '#ffffff' },
  bannerSub: { fontSize: 13, color: '#fed7aa', marginTop: 4 },
  content: { padding: 16, paddingBottom: 110 },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#c2410c', borderRadius: 999, paddingVertical: 13, paddingHorizontal: 24, marginBottom: 24, alignSelf: 'flex-start', elevation: 2 },
  createBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14, marginLeft: 6 },
  loader: { marginTop: 40 },
  siteCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#f3f4f6', elevation: 2 },
  siteIcon: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#fff7ed', justifyContent: 'center', alignItems: 'center' },
  siteInfo: { flex: 1, marginLeft: 12 },
  siteName: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  siteLocation: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  emptyCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6', elevation: 1 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
});

export default WorksitesPage;