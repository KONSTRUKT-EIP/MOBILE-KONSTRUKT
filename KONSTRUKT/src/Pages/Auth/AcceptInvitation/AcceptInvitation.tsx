import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../App';
import { useSession } from '../../../Context/SessionContext';
import invitationService, { InvitationError, InvitationInfo } from '../../../Services/invitationService';
import { extractInvitationToken } from '../../../Utils/invitation';

type Props = NativeStackScreenProps<RootStackParamList, 'AcceptInvitation'>;

type Phase = 'input' | 'loading' | 'ready' | 'invalid' | 'unavailable' | 'network';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  CHEF_PROJET: 'Chef de projet',
  CONDUCTEUR_TRAVAUX: 'Conducteur de travaux',
  COLLABORATEUR: 'Collaborateur',
  CLIENT: 'Client',
};

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).+$/;

const AcceptInvitation: React.FC<Props> = ({ navigation, route }) => {
  const { loadSession } = useSession();

  const [phase, setPhase] = useState<Phase>(route.params?.token ? 'loading' : 'input');
  const [token, setToken] = useState<string>(route.params?.token ?? '');
  const [pasted, setPasted] = useState<string>('');
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirm, setConfirm] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const verify = useCallback(async (value: string) => {
    setPhase('loading');
    setError('');
    try {
      const info = await invitationService.getInvitation(value);
      setInvitation(info);
      setPhase('ready');
    } catch (err) {
      const reason = err instanceof InvitationError ? err.reason : 'network';
      setPhase(reason === 'invalid' ? 'invalid' : reason === 'unavailable' ? 'unavailable' : 'network');
    }
  }, []);

  useEffect(() => {
    if (route.params?.token) verify(route.params.token);
  }, [route.params?.token, verify]);

  const handleVerify = () => {
    const extracted = extractInvitationToken(pasted);
    if (!extracted) {
      setError("Collez le lien ou le code reçu dans l'invitation.");
      return;
    }
    setToken(extracted);
    verify(extracted);
  };

  const restart = () => {
    setPasted('');
    setToken('');
    setInvitation(null);
    setError('');
    setPhase('input');
  };

  const validateForm = (): string => {
    if (!firstName.trim()) return 'Le prénom est obligatoire.';
    if (!lastName.trim()) return 'Le nom est obligatoire.';
    if (password.length < 8 || !PASSWORD_RULE.test(password)) {
      return 'Le mot de passe doit contenir 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&#).';
    }
    if (password !== confirm) return 'Les mots de passe ne correspondent pas.';
    return '';
  };

  const handleAccept = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const result = await invitationService.acceptInvitation(token, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });
      await AsyncStorage.multiSet([
        ['userToken', result.access_token],
        ['refreshToken', result.refresh_token],
        ['userFirstName', result.user.firstName || 'Utilisateur'],
      ]);
      await loadSession();
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      if (err instanceof InvitationError) {
        if (err.reason === 'unavailable') setPhase('unavailable');
        else if (err.reason === 'invalid') setPhase('invalid');
        else setError(err.reason === 'email-taken' ? 'Un compte existe déjà avec cette adresse e-mail.' : err.message);
      } else {
        setError('Impossible de créer le compte.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatus = (icon: string, color: string, title: string, text: string, retry?: () => void) => (
    <View style={styles.card}>
      <MaterialCommunityIcons name={icon as any} size={52} color={color} style={styles.statusIcon} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardText}>{text}</Text>
      {retry && (
        <TouchableOpacity style={styles.primaryButton} onPress={retry}>
          <Text style={styles.primaryText}>Réessayer</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.secondaryButton} onPress={restart}>
        <Text style={styles.secondaryText}>Saisir un autre lien</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Retour à la connexion</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.screenTitle}>Invitation</Text>

        {phase === 'input' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rejoindre un chantier</Text>
            <Text style={styles.cardText}>
              Collez le lien ou le code reçu par e-mail pour vérifier votre invitation.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Lien ou code d'invitation"
              placeholderTextColor="#9ca3af"
              value={pasted}
              onChangeText={text => { setPasted(text); setError(''); }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity style={styles.primaryButton} onPress={handleVerify}>
              <Text style={styles.primaryText}>Vérifier l'invitation</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Retour à la connexion</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'loading' && (
          <View style={styles.card}>
            <ActivityIndicator size="large" color="#c2410c" />
            <Text style={styles.cardText}>Vérification de l'invitation…</Text>
          </View>
        )}

        {phase === 'invalid' &&
          renderStatus(
            'link-variant-off',
            '#ef4444',
            'Invitation introuvable',
            "Ce lien n'est pas valide. Vérifiez que vous avez copié le lien complet reçu par e-mail."
          )}

        {phase === 'unavailable' &&
          renderStatus(
            'clock-alert-outline',
            '#f59e0b',
            'Invitation expirée ou déjà utilisée',
            "Cette invitation n'est plus valable. Demandez-en une nouvelle à votre administrateur."
          )}

        {phase === 'network' &&
          renderStatus(
            'wifi-off',
            '#6b7280',
            'Serveur injoignable',
            "Impossible de vérifier l'invitation pour le moment. Vérifiez votre connexion.",
            () => verify(token)
          )}

        {phase === 'ready' && invitation && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Vous êtes invité(e)</Text>
            <Text style={styles.cardText}>
              {invitation.organization.name} vous invite à rejoindre le chantier{' '}
              <Text style={styles.bold}>{invitation.site.name}</Text> ({invitation.site.city}) en tant que{' '}
              <Text style={styles.bold}>{ROLE_LABELS[invitation.role] ?? invitation.role}</Text>.
            </Text>

            <Text style={styles.label}>Adresse e-mail</Text>
            <TextInput style={[styles.input, styles.inputDisabled]} value={invitation.email} editable={false} />

            <Text style={styles.label}>Prénom</Text>
            <TextInput style={styles.input} placeholder="Prénom" placeholderTextColor="#9ca3af" value={firstName} onChangeText={setFirstName} />

            <Text style={styles.label}>Nom</Text>
            <TextInput style={styles.input} placeholder="Nom" placeholderTextColor="#9ca3af" value={lastName} onChangeText={setLastName} />

            <Text style={styles.label}>Mot de passe</Text>
            <TextInput style={styles.input} placeholder="Mot de passe" placeholderTextColor="#9ca3af" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />

            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput style={styles.input} placeholder="Confirmer" placeholderTextColor="#9ca3af" value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={[styles.primaryButton, submitting && styles.disabled]} onPress={handleAccept} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryText}>Créer mon compte</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton} onPress={restart} disabled={submitting}>
              <Text style={styles.linkText}>Utiliser un autre lien</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 60 },
  screenTitle: { fontSize: 28, fontWeight: 'bold', color: '#c2410c', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 22, borderWidth: 1, borderColor: '#f3f4f6', elevation: 3 },
  statusIcon: { alignSelf: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 10 },
  cardText: { fontSize: 14, color: '#4b5563', textAlign: 'center', lineHeight: 21, marginBottom: 14 },
  bold: { fontWeight: 'bold', color: '#111827' },
  label: { color: '#374151', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: '#f3f4f6', color: '#111827', padding: 13, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', fontSize: 14, marginBottom: 6 },
  inputDisabled: { color: '#6b7280' },
  errorText: { color: '#ef4444', fontSize: 13, fontWeight: '500', marginVertical: 10, textAlign: 'center' },
  primaryButton: { backgroundColor: '#c2410c', paddingVertical: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  primaryText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  secondaryButton: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10, backgroundColor: '#f3f4f6' },
  secondaryText: { color: '#374151', fontSize: 14, fontWeight: 'bold' },
  linkButton: { marginTop: 14, alignItems: 'center' },
  linkText: { color: '#6b7280', fontSize: 14 },
  disabled: { opacity: 0.6 },
});

export default AcceptInvitation;
