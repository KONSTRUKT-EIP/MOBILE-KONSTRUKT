import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OrdersPage = () => (
  <View style={styles.container}><Text style={styles.text}>Commandes</Text></View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9f0f0',
  },

  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
});

export default OrdersPage;