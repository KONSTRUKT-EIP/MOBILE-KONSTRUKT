import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 60) / 2;

const MenuCard = ({ title, icon, color, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: color }]} 
      onPress={onPress}
    >
      <MaterialCommunityIcons 
        name={icon} 
        size={40} 
        color={color === '#cb6516' ? '#FFF' : '#cb6516'} 
      />
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: COLUMN_WIDTH,
    height: 140,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardTitle: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
});

export default MenuCard;