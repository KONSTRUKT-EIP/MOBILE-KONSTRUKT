import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  Image, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import authService from '../../../Services/authService';
import { RootStackParamList } from '../../../../App'; // Vérifie que le chemin remonte bien à la racine

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginPage: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const isFormEmpty = email.trim() === '' || password.trim() === '';

  const handleLogin = async () => {
    if (!email.includes('@')) {
      setError("L'adresse email n'est pas valide.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { access_token, refresh_token } = await authService.login(email, password);

      if (!access_token || !refresh_token) {
        setError("Le serveur n'a pas renvoyé de jeton d'accès.");
        return;
      }

      await AsyncStorage.multiSet([
        ['userToken', access_token],
        ['refreshToken', refresh_token],
      ]);

      let firstName = 'Utilisateur';
      try {
        const me = await authService.getCurrentUser();
        if (me?.firstName) firstName = me.firstName;
      } catch {
      }
      await AsyncStorage.setItem('userFirstName', firstName);
      navigation.navigate('Main');

    } catch (err: any) {
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
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={(text) => { setEmail(text); setError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="Votre mot de passe"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={(text) => { setPassword(text); setError(''); }}
            secureTextEntry
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  form: { width: '100%', backgroundColor: '#ffffff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#f3f4f6', elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12 },
  logo: { width: 160, height: 160, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 24, textAlign: 'center' },
  inputLabel: { color: '#374151', fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  input: { backgroundColor: '#f3f4f6', color: '#111827', padding: 13, borderRadius: 8, marginBottom: 14, borderWidth: 1, borderColor: '#e5e7eb', fontSize: 14 },
  inputError: { borderColor: '#ef4444' },
  button: { backgroundColor: '#c2410c', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 8, height: 52, justifyContent: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  errorText: { color: '#ef4444', fontSize: 13, fontWeight: '500', marginBottom: 12, textAlign: 'center' },
  forgotPasswordContainer: { marginTop: 14, alignItems: 'center' },
  forgotPasswordText: { color: '#6b7280', fontSize: 14 },
});

export default LoginPage;