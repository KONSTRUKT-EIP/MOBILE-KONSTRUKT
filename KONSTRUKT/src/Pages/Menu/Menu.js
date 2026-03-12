import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MoreMenuPage = ({ navigation }) => {
  const menuOptions = [
    { id: 'msg', title: 'Messagerie', icon: 'message-text-outline', color: '#c2410c' },
    { id: 'team', title: 'Équipe', icon: 'account-group-outline', color: '#374151' },
    { id: 'cli', title: 'Clients', icon: 'briefcase-outline', color: '#374151' },
    { id: 'cal', title: 'Calendrier', icon: 'calendar-month-outline', color: '#374151' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plus d'options</Text>
      </View>
      
      <View style={styles.menuList}>
        {menuOptions.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.menuItem}
            onPress={() => console.log(`Vers ${item.title}`)}
          >
            <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
              <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.title}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },

  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },

  menuList: {
    padding: 15,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },

  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
});

export default MoreMenuPage;