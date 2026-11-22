import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from '../../API/Api'; 
import AnalyticsGraph from '../../Components/Dashboard/AnalyticsGraph'; 
import CreateOrderModal from '../../Components/Dashboard/CreateOrderModal';
import { useTheme } from '../../Theme/ThemeContext';
import { ThemeColors } from '../../Theme/colors';
import { DashboardStackParamList } from '../../Navigation/TabNavigator'; //

// 1. Interfaces pour les données
interface KPICard {
  label: string;
  percentage: number;
  spent: number;
}

interface AnalyticsReport {
  kpiCards: KPICard[];
  overallPercentage: number;
  chartData: any; 
  totalBudget: number;
  totalSpent: number;
  filters: { id: number; label: string }[];
}

interface Order {
  id: string | number;
  productName: string;
  totalOrder: number;
  total: number;
}

// 2. Typage des Props de navigation
type Props = NativeStackScreenProps<DashboardStackParamList, 'TradeDashboard'>;

const TradeDashboard: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { category, chantierName } = route.params; //
  const [reportData, setReportData] = useState<AnalyticsReport | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const loadTradeData = async () => {
      try {
        setLoading(true);
        const [analyticsRes, ordersRes] = await Promise.all([
          api.get<AnalyticsReport>('/dashboard/armature/analytics', {
            params: {
              startDate: '2024-01-01', 
              endDate: '2024-12-31',   
              categories: 'voiles,planchers' 
            }
          }),
          api.get<{ orders: Order[] }>('/dashboard/armature/orders/recent')
        ]);

        setReportData(analyticsRes.data);
        setRecentOrders(ordersRes.data.orders);
      } catch (err) {
        console.error("Erreur Dashboard Analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTradeData();
  }, []);

  const handleCreateOrder = async (orderDto: any) => {
    try {
      await api.post('/dashboard/armature/orders', orderDto);
      Alert.alert("Succès", "Livraison enregistrée !");
      setModalVisible(false);
      const updatedOrders = await api.get<{ orders: Order[] }>('/dashboard/armature/orders/recent');
      setRecentOrders(updatedOrders.data.orders);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de créer la commande.");
    }
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#c2410c" /></View>;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          {/* L'erreur TS2339 venait d'ici car backBtn n'était pas dans styles */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={30} color="#c2410c" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics / {category}</Text>
        </View>

        <View style={styles.kpiRow}>
          {reportData?.kpiCards.map((kpi, i) => (
            <View key={i} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <Text style={styles.kpiValue}>{kpi.percentage}%</Text>
              <Text style={styles.kpiSpent}>{kpi.spent} €</Text>
            </View>
          ))}
        </View>

        <View style={styles.whiteCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Suivi Temporel</Text>
            <Text style={styles.overallText}>{reportData?.overallPercentage}% Avancement</Text>
          </View>
          <AnalyticsGraph data={reportData?.chartData} labels={["Jan", "Fév", "Mar", "Avr", "Mai"]} />
        </View>

        <View style={styles.budgetCard}>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Budget Prévu</Text>
            <Text style={styles.budgetValue}>{reportData?.totalBudget} €</Text>
          </View>
          <View style={styles.budgetDivider} />
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Consommé</Text>
            <Text style={[styles.budgetValue, {color: '#c2410c'}]}>{reportData?.totalSpent} €</Text>
          </View>
        </View>
    
        <View style={styles.whiteCard}>
          <Text style={styles.cardTitle}>Éléments Analysés</Text>
          <View style={styles.filterGrid}>
            {reportData?.filters.map(f => (
              <View key={f.id} style={styles.filterItem}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#c2410c" />
                <Text style={styles.filterLabel}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.whiteCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.cardTitle}>Livraisons</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.addBtnText}>+ Nouvelle</Text>
            </TouchableOpacity>
          </View>
          {recentOrders.map((order) => (
            <View key={order.id} style={styles.orderRow}>
              <View>
                <Text style={styles.orderName}>{order.productName}</Text>
                <Text style={styles.orderSub}>{order.totalOrder} unités</Text>
              </View>
              <Text style={styles.orderTotal}>{order.total} €</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <CreateOrderModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onCreate={handleCreateOrder} 
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 15, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { marginRight: 10 }, // CORRECTION : backBtn est maintenant présent
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  kpiCard: { width: '31%', padding: 10, alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, elevation: 2 },
  kpiLabel: { fontSize: 10, fontWeight: 'bold', color: colors.muted },
  kpiValue: { fontSize: 18, fontWeight: 'bold', color: '#c2410c' },
  kpiSpent: { fontSize: 9, color: colors.placeholder },
  whiteCard: { padding: 15, marginBottom: 15, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  overallText: { fontSize: 12, fontWeight: 'bold', color: '#c2410c' },
  budgetCard: { flexDirection: 'row', padding: 20, marginBottom: 15, backgroundColor: '#1E1E1E', borderRadius: 15 },
  budgetItem: { flex: 1, alignItems: 'center' },
  budgetLabel: { fontSize: 11, marginBottom: 5, color: '#AAA' },
  budgetValue: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  budgetDivider: { width: 1, backgroundColor: '#444' },
  filterGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  filterItem: { flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 10 },
  filterLabel: { marginLeft: 8, fontSize: 14, color: colors.text },
  orderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  addBtn: { padding: 8, borderRadius: 8, backgroundColor: '#c2410c' },
  addBtnText: { fontSize: 12, fontWeight: 'bold', color: '#FFF' },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  orderName: { fontSize: 14, fontWeight: '600' },
  orderSub: { fontSize: 12, color: colors.muted },
  orderTotal: { fontWeight: 'bold', color: colors.text },
});

export default TradeDashboard;