import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSession } from '../../Context/SessionContext';
import { useTheme } from '../../Theme/ThemeContext';
import { ThemeColors } from '../../Theme/colors';
import { DashboardStackParamList } from '../../Navigation/TabNavigator'; // On récupère le typage du Stack

// 1. Définition de l'interface pour un Chantier
interface Worksite {
  id: string;
  name: string;
  location: string;
}

// 2. Typage des Props du composant pour la navigation
type Props = NativeStackScreenProps<DashboardStackParamList, 'DashboardList'>;

const DashboardList: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [userName, setUserName] = useState<string>('Utilisateur');
  const { sites, loaded, error, loadSession, selectSite, canCreateSite } = useSession();
  const hasSingleSite = loaded && sites.length === 1;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userFirstName');
        if (storedName) setUserName(storedName);
      } catch (e) {
        console.error("Erreur lors de la récupération du prénom", e);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!loaded) loadSession();
  }, [loaded, loadSession]);

  useEffect(() => {
    if (!hasSingleSite) return;
    const [site] = sites;
    selectSite(site.id);
    navigation.replace('JobsiteHub', { chantierName: site.name, siteId: site.id });
  }, [hasSingleSite, sites, selectSite, navigation]);

  const chantiers: Worksite[] = sites.map(site => ({
    id: site.id,
    name: site.name,
    location: `${site.city}, ${site.postalCode}`,
  }));

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.welcomeText}>Bonjour, {userName}</Text>
      <Text style={styles.subtitle}>Sélectionnez un chantier pour commencer</Text>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Mes Chantiers Actifs</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{chantiers.length}</Text>
        </View>
        {canCreateSite && (
          <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateSite')}>
            <MaterialCommunityIcons name="plus" size={18} color="#ffffff" />
            <Text style={styles.createButtonText}>Nouveau</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // 3. Typage de l'item dans le renderItem
  const renderItem = ({ item }: { item: Worksite }) => (
    <TouchableOpacity 
      style={styles.card} 
      // MISE À JOUR : On passe siteId car il est requis par le DashboardStackParamList
      onPress={() => {
        selectSite(item.id);
        navigation.navigate('JobsiteHub', { chantierName: item.name, siteId: item.id });
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="office-building" size={24} color="#4f46e5" />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={14} color={colors.muted} />
            <Text style={styles.location}>{item.location}</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.brandText}>KONSTRUKT</Text>
        <Text style={styles.bannerTitle}>Mes Chantiers</Text>
      </View>
      {!loaded || hasSingleSite ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : error ? (
        <View style={styles.loader}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={chantiers}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.errorText}>Aucun chantier pour le moment.</Text>
          }
        />
      )}
    </View>
  );
};

// ... Les styles restent identiques
const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: colors.muted, fontSize: 14, textAlign: 'center' },
  banner: { backgroundColor: '#4f46e5', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  brandText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 2, color: '#c7d2fe', marginBottom: 4 },
  bannerTitle: { fontSize: 26, fontWeight: 'bold', color: '#ffffff' },
  list: { padding: 16, paddingBottom: 110 },
  headerContainer: { marginBottom: 8, paddingTop: 8 },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 4, marginBottom: 24 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  countBadge: { marginLeft: 8, backgroundColor: '#e0e7ff', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  createButton: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', backgroundColor: '#c2410c', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  createButtonText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginLeft: 4 },
  countBadgeText: { color: '#4f46e5', fontSize: 12, fontWeight: 'bold' },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#e0e7ff', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 14 },
  name: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  location: { fontSize: 13, color: colors.muted, marginLeft: 4 },
});

export default DashboardList;