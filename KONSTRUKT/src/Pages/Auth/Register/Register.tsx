import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import authService from '../../../Services/authService';
import { RootStackParamList } from '../../../../App'; // Chemin corrigé pour remonter à la racine

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterPage: React.FC<Props> = ({ navigation }) => {
  const [lastName, setLastName] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Vérification de la complétude du formulaire
  const isFormIncomplete = !firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim();

  const handleRegister = async () => {
    // 1. Validations locales
    if (!email.includes('@')) {
      setError("Format d'email invalide.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    
    // Regex pour la complexité du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).+$/;
    if (!passwordRegex.test(password)) {
      setError("Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&#).");
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      // 2. Appel au service d'authentification
      await authService.register({
        firstName,
        lastName,
        email,
        password,
      });
      // 3. Navigation vers l'écran de succès si tout est OK
      navigation.navigate('Success');
    } catch (err: any) {
      const apiError = err.response?.data?.message || "Erreur de connexion avec le serveur.";
      setError(Array.isArray(apiError) ? apiError[0] : apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.inner}>
          <Image
            source={require('../../../Assets/Konstrukt_logo-removebg-preview.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.form}>
            <Text style={styles.title}>Créer un compte</Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.inputLabel}>Prénom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Prénom"
                  placeholderTextColor="#9ca3af"
                  value={firstName}
                  onChangeText={(text) => { setFirstName(text); setError(''); }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Nom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nom"
                  placeholderTextColor="#9ca3af"
                  value={lastName}
                  onChangeText={(text) => { setLastName(text); setError(''); }}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Adresse e-mail</Text>
            <TextInput
              style={styles.input}
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
              placeholder="Mot de passe"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={(text) => { setPassword(text); setError(''); }}
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Confirmer</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirmer"
              placeholderTextColor="#9ca3af"
              value={confirmPassword}
              onChangeText={(text) => { setConfirmPassword(text); setError(''); }}
              secureTextEntry
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, (isFormIncomplete || loading) && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isFormIncomplete || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>S'inscrire</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.alreadyAccountText}>Déjà un compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLinkText}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ... styles identiques
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  inner: {
    padding: 24,
    alignItems: 'center',
  },

  form: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  inputLabel: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 5,
    marginLeft: 2,
  },

  input: {
    backgroundColor: '#f3f4f6',
    color: '#111827',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 14,
  },

  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    justifyContent: 'space-between',
  },

  roleBadge: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 8,
    minWidth: '30%',
    alignItems: 'center',
  },

  roleBadgeActive: {
    backgroundColor: '#c2410c',
    borderColor: '#c2410c',
  },

  roleBadgeText: {
    color: '#6b7280',
  },

  roleBadgeTextActive: {
    color: '#FFF',
  },

  button: {
    backgroundColor: '#c2410c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    height: 50,
    justifyContent: 'center',
  },

  buttonDisabled: {
    opacity: 0.4,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },

  alreadyAccountText: {
    color: '#6b7280',
    fontSize: 14,
  },

  loginLinkText: {
    color: '#c2410c',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default RegisterPage;