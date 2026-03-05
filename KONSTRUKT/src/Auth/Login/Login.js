import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  Image, KeyboardAvoidingView, Platform 
} from 'react-native';

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isFormEmpty = email.trim() === '' || password.trim() === '';

  const handleLogin = () => {
    if (!email.includes('@')) {
      setError("L'adresse email n'est pas valide.");
      return;
    }
    setError('');
    console.log('Connexion...');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Image 
          source={require('../assets/Konstrukt_logo-removebg-preview.png')}
          style={styles.logo}
          resizeMode="contain"
          accessible={true}
          accessibilityLabel="Logo Konstrukt"
        />
        
        <View style={styles.form}>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
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
            style={[styles.button, isFormEmpty && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isFormEmpty}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Se connecter"
            accessibilityState={{ disabled: isFormEmpty }}
          >
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            accessibilityRole="button"
            accessibilityLabel="Réinitialiser le mot de passe"
          >
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.noAccountText}>Pas de compte ? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Register')}
              accessibilityRole="button"
              accessibilityLabel="S'inscrire"
              style={styles.linkTouchZone}
            >
              <Text style={styles.registerText}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f0f0',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  form: {
    width: '100%',
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 20,
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
  inputError: {
    borderColor: '#d32f2f',
  },
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
  errorText: {
    color: '#d32f2f',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 15,
  },
  forgotPasswordContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#666',
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noAccountText: {
    color: '#666',
    fontSize: 14,
  },
  registerText: {
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

export default LoginPage;