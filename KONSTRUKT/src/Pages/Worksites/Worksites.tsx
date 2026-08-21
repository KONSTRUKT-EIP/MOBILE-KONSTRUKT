import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../../Navigation/TabNavigator'; // Import du type des onglets

// 1. Typage des Props pour l'onglet Chantiers
type Props = BottomTabScreenProps<TabParamList, 'Chantiers'>;

const WorksitesPage: React.FC<Props> = () => (
  <View style={styles.container}>
    {/* Banner orange assortie au frontend /worksites */}
    <View style={styles.banner}>
      <Text style={styles.brandText}>KONSTRUKT</Text>
      <Text style={styles.bannerTitle}>Chantiers</Text>
      <Text style={styles.bannerSub}>Consultez et gérez vos chantiers</Text>
    </View>

    <ScrollView contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.createBtn} activeOpacity={0.85}>
        <MaterialCommunityIcons name="plus" size={18} color="#ffffff" />
        <Text style={styles.createBtnText}>Créer un chantier</Text>
      </TouchableOpacity>

      <View style={styles.emptyCard}>
        <MaterialCommunityIcons name="office-building-outline" size={56} color="#e5e7eb" />
        <Text style={styles.emptyTitle}>Aucun chantier</Text>
        <Text style={styles.emptyText}>Cette fonctionnalité sera bientôt disponible.</Text>
      </View>
    </ScrollView>
  </View>
);

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
  emptyCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6', elevation: 1 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
});

export default WorksitesPage;