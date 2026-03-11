import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AnalyticsGraph from '../../Components/Dashboard/AnalyticsGraph'; 
import CreateOrderModal from '../../Components/Dashboard/CreateOrderModal';

const TradeDashboard = ({ route, navigation }) => {
  const { category } = route.params || { category: "Armature" };

  const [filters, setFilters] = useState([
    { id: 1, label: 'Voiles', checked: true, color: '#818CF8' },
    { id: 2, label: 'Planchers', checked: true, color: '#C084FC' },
    { id: 3, label: 'Poutres', checked: true, color: '#60A5FA' },
    { id: 4, label: 'Superstructure', checked: false, color: '#9CA3AF' },
  ]);

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleFilter = (id) => {
    setFilters(prevFilters => 
      prevFilters.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={30} color="#cb6516" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard / {category}</Text>
        </View>

        <View style={styles.whiteCard}>
          <Text style={styles.cardTitle}>Reports</Text>
          <AnalyticsGraph data={{voiles: [60,45,62,40,52,48,40,42,65,72], planchers: [35,48,60,38,25,20,38,42,60,68]}} labels={["10am", "", "12am", "", "2am", "", "4am", "", "6am", ""]} />
        </View>

        <View style={styles.whiteCard}>
          <Text style={styles.cardTitle}>Filtres de vue</Text>
          <View style={styles.filterGrid}>
            {filters.map(filter => (
              <TouchableOpacity key={filter.id} style={styles.filterItem} onPress={() => toggleFilter(filter.id)}>
                <MaterialCommunityIcons 
                  name={filter.checked ? "checkbox-marked" : "checkbox-blank-outline"} 
                  size={26} 
                  color={filter.checked ? filter.color : "#999"} 
                />
                <Text style={[styles.filterLabel, { color: filter.checked ? '#333' : '#999' }]}>{filter.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.whiteCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.cardTitle}>Commande Recents</Text>
            <TouchableOpacity style={styles.addOrderBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.addOrderText}>+ Créer une commande</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.emptyTable}>
            <MaterialCommunityIcons name="clipboard-text-search-outline" size={40} color="#EEE" />
            <Text style={styles.emptyTableText}>Aucune commande récente</Text>
          </View>
        </View>

      </ScrollView>

      <CreateOrderModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onCreate={(data) => console.log("Nouvelle commande :", data)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f4',
  },

  scrollContent: {
    padding: 15,
    paddingBottom: 110,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  backBtn: {
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E1E1E',
  },

  whiteCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,

    elevation: 2,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },

  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 15,
  },

  filterLabel: {
    marginLeft: 12,
    fontSize: 15,
  },

  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  addOrderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#c2410c',
  },

  addOrderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },

  emptyTable: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  emptyTableText: {
    marginTop: 10,
    fontSize: 13,
    color: '#999',
  },
});

export default TradeDashboard;