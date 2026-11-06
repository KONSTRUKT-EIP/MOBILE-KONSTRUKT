import React from 'react';
import { StyleSheet, View, Text, Modal, FlatList, TouchableOpacity, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AccessibleSite } from '../Types/Auth';

interface Props {
  visible: boolean;
  sites: AccessibleSite[];
  selectedSiteId: string | null;
  onSelect: (site: AccessibleSite) => void;
  onClose: () => void;
}

const SiteSwitcher: React.FC<Props> = ({ visible, sites, selectedSiteId, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={styles.sheet}>
        <Text style={styles.title}>Changer de chantier</Text>
        <FlatList
          data={sites}
          keyExtractor={site => site.id}
          renderItem={({ item }) => {
            const active = item.id === selectedSiteId;
            return (
              <TouchableOpacity
                style={[styles.row, active && styles.rowActive]}
                onPress={() => onSelect(item)}
              >
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.location}>{item.city}, {item.postalCode}</Text>
                </View>
                {active && <MaterialCommunityIcons name="check" size={22} color="#c2410c" />}
              </TouchableOpacity>
            );
          }}
        />
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Fermer</Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, maxHeight: '70%' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12 },
  rowActive: { backgroundColor: '#fff7ed' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#111827' },
  location: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  closeButton: { marginTop: 12, paddingVertical: 12, alignItems: 'center', borderRadius: 12, backgroundColor: '#f3f4f6' },
  closeText: { fontSize: 14, fontWeight: 'bold', color: '#374151' },
});

export default SiteSwitcher;
