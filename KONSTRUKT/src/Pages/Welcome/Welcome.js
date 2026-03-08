import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 

const WelcomePage = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Bienvenue sur KONSTRUKT</Text>
        <Text style={styles.subDescription}>
          Connectez-vous ou créez un compte pour commencer à explorer votre tableau de bord !
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.signInText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.signUpText}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.footerText}>© 2026 KONSTRUKT. Tous droits réservés.</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFF',
    width: '92%',
    maxWidth: 400,
    padding: 35,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FF6B00',
    textAlign: 'center',
    marginBottom: 25,
    textTransform: 'uppercase',
  },
  subDescription: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 35,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
  },
  signInButton: {
    backgroundColor: '#FF6B00',
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
    marginBottom: 12,
    alignItems: 'center',
  },
  signInText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FF6B00',
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  signUpText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    position: 'absolute',
    bottom: 30,
    color: '#888',
    fontSize: 12,
  },
});

export default WelcomePage;