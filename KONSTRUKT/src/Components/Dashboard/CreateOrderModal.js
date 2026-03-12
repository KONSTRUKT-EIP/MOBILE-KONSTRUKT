import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, Modal, TextInput, 
  TouchableOpacity, KeyboardAvoidingView, Platform 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CreateOrderModal = ({ visible, onClose, onCreate }) => {
  const [productName, setProductName] = useState('');
  const [productIcon, setProductIcon] = useState('');
  const [price, setPrice] = useState('1');
  const [quantity, setQuantity] = useState('1');
  const totalEuro = (parseFloat(price) || 0) * (parseFloat(quantity) || 0);

  const handleCreate = () => {
    onCreate({ productName, productIcon, price, quantity, totalEuro });
    setProductName('');
    setProductIcon('');
    setPrice('1');
    setQuantity('1');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Créer une commande</Text>

          <Text style={styles.inputLabel}>Nom du produit <Text style={{color: 'red'}}>*</Text></Text>
          <TextInput 
            style={styles.input} 
            value={productName} 
            onChangeText={setProductName} 
            placeholder="Ex: Acier HA12" 
          />

          <Text style={styles.inputLabel}>Icône produit (URL)</Text>
          <TextInput 
            style={styles.input} 
            value={productIcon} 
            onChangeText={setProductIcon} 
            placeholder="http://..." 
          />

          <View style={styles.row}>
            <View style={{flex: 1, marginRight: 10}}>
              <Text style={styles.inputLabel}>Prix (€) <Text style={{color: 'red'}}>*</Text></Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={price} 
                onChangeText={setPrice} 
              />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.inputLabel}>Total Order <Text style={{color: 'red'}}>*</Text></Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={quantity} 
                onChangeText={setQuantity} 
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Total (€) <Text style={{color: 'red'}}>*</Text></Text>
          <View style={styles.totalBox}>
            <Text style={styles.totalText}>{totalEuro.toFixed(2)}</Text>
            <MaterialCommunityIcons name="unfold-more-horizontal" size={20} color="#999" />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.createBtn, !productName && {backgroundColor: '#CCC'}]} 
              onPress={handleCreate}
              disabled={!productName}
            >
              <Text style={styles.createBtnText}>Créer</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    padding: 20 
  },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 25
  },
  modalTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#111827', 
    marginBottom: 20 
  },
  inputLabel: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#374151', 
    marginBottom: 5, 
    marginTop: 10    
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 10, 
    padding: 12,
    fontSize: 16, 
    color: '#111827' 
  },
  row: { 
    flexDirection: 'row' 
  },
  totalBox: { 
    borderWidth: 1, 
    borderColor: '#93C5FD', 
    borderRadius: 10, 
    padding: 20,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFF',
    marginBottom: 24
  },
  totalText: { 
    fontSize: 16, 
    color: '#111827' 
  },
  modalActions: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    alignItems: 'center', 
    marginTop: 30
  },
  cancelBtn: {
    paddingVertical: 10,
    marginRight: 25
  },
  cancelText: { 
    fontSize: 18, 
    color: '#6B7280',
    marginTop: -35
  },
  createBtn: { 
    backgroundColor: '#c2410c', 
    paddingHorizontal: 25, 
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: -50
  },
  createBtnText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold'
  }
});

export default CreateOrderModal;