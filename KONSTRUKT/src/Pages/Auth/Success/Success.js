import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';

const SuccessPage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../../Assets/success1.png')} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.message}>Votre compte a été créé avec succès !</Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Retour à l'accueil"
        >
          <Text style={styles.buttonText}>Retour à la page d'accueil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFF',
    width: '100%',
    paddingVertical: 50,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: 220,
    height: 220,
  },
  message: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 28,
  },
  button: {
    backgroundColor: '#cb6516ff',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SuccessPage;