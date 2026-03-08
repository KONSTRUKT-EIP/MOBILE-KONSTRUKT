import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  Image, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../../../Services/authService';

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormEmpty = email.trim() === '' || password.trim() === '';

  const handleLogin = async () => {
    if (!email.includes('@')) {
      setError("L'adresse email n'est pas valide.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      console.log('Succès !', response);
      //navigation.navigate('HomePage');
      navigation.navigate('Main');
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      const displayError = Array.isArray(backendMessage) ? backendMessage[0] : backendMessage;
      setError(displayError || "Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Image 
          source={require('../../../Assets/Konstrukt_logo-removebg-preview.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <View style={styles.form}>
          <Text style={styles.title}>Connectez-vous</Text>
          <Text style={styles.inputLabel}>Adresse e-mail</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="exemple@mail.com"
            placeholderTextColor="#666"
            value={email}
            onChangeText={(text) => { setEmail(text); setError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.inputLabel}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="Votre mot de passe"
            placeholderTextColor="#666"
            value={password}
            onChangeText={(text) => { setPassword(text); setError(''); }}
            secureTextEntry
          />

          {error ? (
            <Text style={styles.errorText}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity 
            style={[styles.button, (isFormEmpty || loading) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isFormEmpty || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.noAccountText}>Pas de compte ? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Register')}
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
    width: 220,
    height: 220,
    marginBottom: 0,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },

  inputLabel: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 2,
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
    marginTop: 10,
    height: 55,
    justifyContent: 'center',
  },

  buttonDisabled: {
    backgroundColor: '#a1a1a1',
    opacity: 0.5,
  },

  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  errorText: {
    color: '#d32f2f',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 15,
    textAlign: 'center',
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
    marginTop: 30,
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