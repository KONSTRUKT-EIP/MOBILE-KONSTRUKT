import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  Image, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';

const RegisterPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isFormIncomplete = !email.trim() || !profession.trim() || !telephone.trim() || !password.trim();

  const handleRegister = () => {
    if (!email.includes('@')) {
      setError("Format d'email invalide.");
      return;
    }
    setError('');
    console.log('Inscription...');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.inner}>
          <Image
            source={require('../assets/Konstrukt_logo-removebg-preview.png')}
            style={styles.logo}
            resizeMode="contain"
            accessible={true}
            accessibilityLabel="Logo Konstrukt"
          />

          <View style={styles.form}>
            <Text style={styles.title}>Créer un compte</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => { setEmail(text); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              accessible={true}
              accessibilityLabel="Champ Email"
            />

            <TextInput
              style={styles.input}
              placeholder="Profession"
              placeholderTextColor="#999"
              value={profession}
              onChangeText={(text) => { setProfession(text); setError(''); }}
              accessible={true}
              accessibilityLabel="Champ Profession"
            />

            <TextInput
              style={styles.input}
              placeholder="Téléphone"
              placeholderTextColor="#999"
              value={telephone}
              onChangeText={(text) => { setTelephone(text); setError(''); }}
              keyboardType="phone-pad"
              accessible={true}
              accessibilityLabel="Champ Téléphone"
            />

            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#999"
              value={password}
              onChangeText={(text) => { setPassword(text); setError(''); }}
              secureTextEntry
              accessible={true}
              accessibilityLabel="Champ Mot de passe"
            />

            {error ? (
              <Text style={styles.errorText} accessibilityLiveRegion="assertive">
                {error}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[styles.button, isFormIncomplete && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isFormIncomplete}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="S'inscrire"
              accessibilityState={{ disabled: isFormIncomplete }}
            >
              <Text style={styles.buttonText}>S'inscrire</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.alreadyAccountText}>Déjà un compte ? </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Login')}
                accessibilityRole="button"
                accessibilityLabel="Se connecter"
                style={styles.linkTouchZone}
              >
                <Text style={styles.loginLinkText}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f0f0',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inner: {
    padding: 20,
    alignItems: 'center',
  },
  form: {
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },

  // --- SECTION 4 : BOUTONS ---
  button: {
    backgroundColor: '#cb6516ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonDisabled: {
    backgroundColor: '#a1a1a1',
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // --- SECTION 5 : TEXTES & NAVIGATION ---
  errorText: {
    color: '#d32f2f',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 15,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  alreadyAccountText: {
    color: '#666',
    fontSize: 14,
  },
  loginLinkText: {
    color: '#cb6516ff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  linkTouchZone: {
    paddingVertical: 5,
    paddingHorizontal: 2,
  },
});

export default RegisterPage;