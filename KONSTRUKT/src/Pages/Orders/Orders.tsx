import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../Theme/ThemeContext';
import { ThemeColors } from '../../Theme/colors';
import orderService from '../../Services/orderService';
import { Order } from '../../Types/Order';
import { formatAmount } from '../../Utils/money';
import { TabParamList } from '../../Navigation/TabNavigator';

type Props = BottomTabScreenProps<TabParamList, 'Commandes'>;

const OrdersPage: React.FC<Props> = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const load = useCallback(async () => {
    try {
      setError('');
      setOrders(await orderService.getAll());
    } catch {
      setError('Impossible de charger les commandes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.iconBox}>
        {item.productIcon ? (
          <Image source={{ uri: item.productIcon }} style={styles.iconImage} resizeMode="contain" />
        ) : (
          <MaterialCommunityIcons name="package-variant-closed" size={24} color="#c2410c" />
        )}
      </View>
      <View style={styles.orderInfo}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.orderDetail}>{item.totalOrder} × {formatAmount(item.price)}</Text>
      </View>
      <Text style={styles.orderTotal}>{formatAmount(item.total)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.brandText}>KONSTRUKT</Text>
        <Text style={styles.bannerTitle}>Commandes</Text>
        <Text style={styles.bannerSub}>Suivi de vos commandes de matériaux</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#c2410c" style={styles.loader} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor="#c2410c"
            />
          }
          ListHeaderComponent={
            orders.length > 0 ? (
              <Text style={styles.summary}>{orders.length} commande{orders.length > 1 ? 's' : ''}</Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="cart-outline" size={56} color={colors.border} />
              <Text style={styles.emptyTitle}>{error ? 'Erreur' : 'Aucune commande'}</Text>
              <Text style={styles.emptyText}>{error || "Aucune commande n'a encore été passée."}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  banner: {
    backgroundColor: '#c2410c',
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
  list: { padding: 16, paddingBottom: 110 },
  summary: { fontSize: 13, color: colors.muted, marginBottom: 12, marginLeft: 4 },
  orderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border, elevation: 2 },
  iconBox: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#fff7ed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  iconImage: { width: 46, height: 46 },
  orderInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 15, fontWeight: 'bold', color: colors.text },
  orderDetail: { fontSize: 12, color: colors.muted, marginTop: 2 },
  orderTotal: { fontSize: 15, fontWeight: 'bold', color: '#c2410c' },
  loader: { marginTop: 40 },
  emptyCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default OrdersPage;