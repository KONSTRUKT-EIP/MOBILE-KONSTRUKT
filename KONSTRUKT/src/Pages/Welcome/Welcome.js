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
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: 400,
    padding: 36,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#c2410c',
    textAlign: 'center',
    marginBottom: 16,
  },
  subDescription: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
  },
  signInButton: {
    backgroundColor: '#c2410c',
    paddingVertical: 15,
    borderRadius: 999,
    width: '100%',
    marginBottom: 12,
    alignItems: 'center',
  },
  signInText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#c2410c',
    paddingVertical: 15,
    borderRadius: 999,
    width: '100%',
    alignItems: 'center',
  },
  signUpText: {
    color: '#c2410c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    position: 'absolute',
    bottom: 30,
    color: '#9ca3af',
    fontSize: 12,
  },
});

export default WelcomePage;