import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../../Navigation/TabNavigator'; // Import du typage des onglets

// 1. Définition des Props pour la navigation
type Props = BottomTabScreenProps<TabParamList, 'Commandes'>;

const OrdersPage: React.FC<Props> = () => (
  <View style={styles.container}>
    {/* Banner orange assortie au frontend /orders */}
    <View style={styles.banner}>
      <Text style={styles.brandText}>KONSTRUKT</Text>
      <Text style={styles.bannerTitle}>Commandes</Text>
      <Text style={styles.bannerSub}>Suivi de vos commandes de matériaux</Text>
    </View>

    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.emptyCard}>
        <MaterialCommunityIcons name="cart-outline" size={56} color="#e5e7eb" />
        <Text style={styles.emptyTitle}>Aucune commande</Text>
        <Text style={styles.emptyText}>Cette fonctionnalité sera bientôt disponible.</Text>
      </View>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  banner: {
    backgroundColor: '#c2410c', // Couleur orange principale
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  brandText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#fed7aa',
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bannerSub: {
    fontSize: 13,
    color: '#fed7aa',
    marginTop: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 110,
    alignItems: 'center',
  },
  emptyCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginTop: 8,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default OrdersPage;