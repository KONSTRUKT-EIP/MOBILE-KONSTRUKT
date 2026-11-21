import React, { useMemo, useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { useSession } from '../../Context/SessionContext';
import authService from '../../Services/authService';
import { roleLabel } from '../../Utils/roles';
import { PASSWORD_HELP, isValidPassword } from '../../Utils/password';
import { useTheme, ThemePreference } from '../../Theme/ThemeContext';
import { ThemeColors } from '../../Theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SESSION_KEYS = ['userToken', 'refreshToken', 'userFirstName', 'selectedSiteId'];

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { value: 'light', label: 'Clair', icon: 'white-balance-sunny' },
  { value: 'dark', label: 'Sombre', icon: 'weather-night' },
  { value: 'system', label: 'Auto', icon: 'cellphone-cog' },
];

const Settings: React.FC<Props> = ({ navigation }) => {
  const { colors, preference, setPreference } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user, sites, selectedSite, loaded, loadSession, clearSession } = useSession();

  const [editingPassword, setEditingPassword] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirm, setConfirm] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!loaded) loadSession();
  }, [loaded, loadSession]);

  const signOut = async () => {
    try {
      await authService.logout();
    } catch {
    }
    await AsyncStorage.multiRemove(SESSION_KEYS);
    await clearSession();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: signOut },
    ]);
  };

  const closePasswordForm = () => {
    setEditingPassword(false);
    setOldPassword('');
    setNewPassword('');
    setConfirm('');
    setError('');
  };

  const handleChangePassword = async () => {
    if (!oldPassword) {
      setError('Saisissez votre mot de passe actuel.');
      return;
    }
    if (!isValidPassword(newPassword)) {
      setError(PASSWORD_HELP);
      return;
    }
    if (newPassword !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      Alert.alert(
        'Mot de passe modifié',
        'Pour votre sécurité, vous allez être déconnecté. Reconnectez-vous avec votre nouveau mot de passe.',
        [{ text: 'OK', onPress: signOut }],
        { cancelable: false }
      );
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) setError('Le mot de passe actuel est incorrect.');
      else if (status === 400) setError(PASSWORD_HELP);
      else setError('Impossible de modifier le mot de passe pour le moment.');
    } finally {
      setSubmitting(false);
    }
  };

  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?' : '?';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#c2410c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
      </View>

      {!loaded ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#c2410c" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{user ? `${user.firstName} ${user.lastName}`.trim() : 'Utilisateur'}</Text>
                <Text style={styles.email}>{user?.email ?? '—'}</Text>
              </View>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{roleLabel(user?.role)}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>CONTEXTE</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Chantier actif</Text>
              <Text style={styles.rowValue}>{selectedSite ? selectedSite.name : 'Aucun'}</Text>
            </View>
            {selectedSite && (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Ville</Text>
                <Text style={styles.rowValue}>{selectedSite.city}</Text>
              </View>
            )}
            {selectedSite && (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Votre rôle sur ce chantier</Text>
                <Text style={styles.rowValue}>{roleLabel(selectedSite.membershipRole)}</Text>
              </View>
            )}
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>Chantiers accessibles</Text>
              <Text style={styles.rowValue}>{sites.length}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>APPARENCE</Text>
          <View style={styles.card}>
            <View style={styles.themeRow}>
              {THEME_OPTIONS.map(option => {
                const active = preference === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.themeOption, active && styles.themeOptionActive]}
                    onPress={() => setPreference(option.value)}
                  >
                    <MaterialCommunityIcons name={option.icon} size={22} color={active ? '#ffffff' : colors.muted} />
                    <Text style={[styles.themeLabel, active && styles.themeLabelActive]}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.help}>
              {preference === 'system' ? "Suit le réglage de votre téléphone." : preference === 'dark' ? 'Fond sombre, repose les yeux le soir.' : 'Fond clair, idéal en journée.'}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>SÉCURITÉ</Text>
          <View style={styles.card}>
            {!editingPassword ? (
              <TouchableOpacity style={styles.actionRow} onPress={() => setEditingPassword(true)}>
                <MaterialCommunityIcons name="lock-outline" size={22} color={colors.textSecondary} />
                <Text style={styles.actionText}>Modifier le mot de passe</Text>
                <MaterialCommunityIcons name="chevron-right" size={22} color={colors.placeholder} />
              </TouchableOpacity>
            ) : (
              <View>
                <Text style={styles.label}>Mot de passe actuel</Text>
                <TextInput style={styles.input} value={oldPassword} onChangeText={setOldPassword} secureTextEntry autoCapitalize="none" placeholder="Mot de passe actuel" placeholderTextColor={colors.placeholder} />
                <Text style={styles.label}>Nouveau mot de passe</Text>
                <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry autoCapitalize="none" placeholder="Nouveau mot de passe" placeholderTextColor={colors.placeholder} />
                <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
                <TextInput style={styles.input} value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" placeholder="Confirmer" placeholderTextColor={colors.placeholder} />
                <Text style={styles.help}>{PASSWORD_HELP}</Text>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <TouchableOpacity style={[styles.primaryButton, submitting && styles.disabled]} onPress={handleChangePassword} disabled={submitting}>
                  {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryText}>Enregistrer</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.linkButton} onPress={closePasswordForm} disabled={submitting}>
                  <Text style={styles.linkText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingTop: 56, paddingBottom: 12, backgroundColor: colors.background },
  headerTitle: { marginLeft: 10, fontSize: 22, fontWeight: 'bold', color: colors.text },
  content: { padding: 16, paddingBottom: 60 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, elevation: 2, marginBottom: 20 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#c2410c', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  profileInfo: { flex: 1, marginLeft: 14 },
  name: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  email: { fontSize: 14, color: colors.muted, marginTop: 2 },
  badge: { alignSelf: 'flex-start', marginTop: 14, backgroundColor: '#ffedd5', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#c2410c', fontSize: 12, fontWeight: 'bold' },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: colors.placeholder, letterSpacing: 1.2, marginBottom: 8, marginLeft: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { fontSize: 14, color: colors.muted, flexShrink: 1, paddingRight: 12 },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.text, flexShrink: 1, textAlign: 'right' },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  actionText: { flex: 1, marginLeft: 12, fontSize: 15, color: colors.text, fontWeight: '500' },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: colors.background, color: colors.text, padding: 13, borderRadius: 8, borderWidth: 1, borderColor: colors.border, fontSize: 14, marginBottom: 6 },
  help: { fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 17 },
  errorText: { color: '#ef4444', fontSize: 13, fontWeight: '500', marginTop: 10, textAlign: 'center' },
  primaryButton: { backgroundColor: '#c2410c', paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  primaryText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  linkButton: { marginTop: 12, alignItems: 'center' },
  linkText: { color: colors.muted, fontSize: 14 },
  disabled: { opacity: 0.6 },
  themeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  themeOption: { flex: 1, alignItems: 'center', paddingVertical: 12, marginHorizontal: 4, borderRadius: 12, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  themeOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  themeLabel: { marginTop: 6, fontSize: 13, fontWeight: '600', color: colors.muted },
  themeLabelActive: { color: '#ffffff' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: '#fecaca' },
  logoutText: { marginLeft: 8, color: '#ef4444', fontSize: 15, fontWeight: 'bold' },
});

export default Settings;
