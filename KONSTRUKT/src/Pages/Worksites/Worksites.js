import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WorksitesPage = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Chantiers</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#e9f0f0' 
  },
  text: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333' 
  }
});

export default WorksitesPage;