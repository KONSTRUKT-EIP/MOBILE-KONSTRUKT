import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../Theme/ThemeContext';
import { ThemeColors } from '../../Theme/colors';
import teamService, { TeamRole } from '../../Services/teamService';
import { OrgUser, TeamSummary } from '../../Types/Worksite';

interface Props {
  visible: boolean;
  teams: TeamSummary[];
  memberIds: string[];
  onClose: () => void;
  onAdded: () => void;
}

const ROLE_OPTIONS: { value: TeamRole; label: string }[] = [
  { value: 'WORKER', label: 'Travailleur' },
  { value: 'CHEF_EQUIPE', label: "Chef d'équipe" },
];

const AddMemberModal: React.FC<Props> = ({ visible, teams, memberIds, onClose, onAdded }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [users, setUsers] = useState<OrgUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [role, setRole] = useState<TeamRole>('WORKER');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!visible) return;
    setUserId(null);
    setRole('WORKER');
    setError('');
    setTeamId(teams.length === 1 ? teams[0].id : null);
    setLoading(true);
    teamService
      .getUsers()
      .then(setUsers)
      .catch(() => setError('Impossible de charger les utilisateurs.'))
      .finally(() => setLoading(false));
  }, [visible, teams]);

  const available = users.filter(user => user.isActive && !memberIds.includes(user.id));

  const handleSave = async () => {
    if (!userId || !teamId) {
      setError('Choisissez un utilisateur et une équipe.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await teamService.addMember(teamId, userId, role);
      onAdded();
      onClose();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) setError("Votre rôle ne permet pas d'ajouter un membre.");
      else if (status === 409) setError('Cet utilisateur est déjà dans cette équipe.');
      else setError("Impossible d'ajouter ce membre pour le moment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.title}>Ajouter un membre</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#c2410c" style={styles.loader} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Utilisateur</Text>
              {available.length === 0 ? (
                <Text style={styles.empty}>Tous les utilisateurs actifs sont déjà dans une équipe de ce chantier.</Text>
              ) : (
                available.map(user => (
                  <TouchableOpacity
                    key={user.id}
                    style={[styles.option, userId === user.id && styles.optionActive]}
                    onPress={() => setUserId(user.id)}
                  >
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionName}>{user.firstName} {user.lastName}</Text>
                      <Text style={styles.optionSub}>{user.email}</Text>
                    </View>
                    {userId === user.id && <MaterialCommunityIcons name="check" size={20} color="#c2410c" />}
                  </TouchableOpacity>
                ))
              )}

              {teams.length > 1 && (
                <>
                  <Text style={styles.label}>Équipe</Text>
                  {teams.map(team => (
                    <TouchableOpacity
                      key={team.id}
                      style={[styles.option, teamId === team.id && styles.optionActive]}
                      onPress={() => setTeamId(team.id)}
                    >
                      <Text style={styles.optionName}>{team.name}</Text>
                      {teamId === team.id && <MaterialCommunityIcons name="check" size={20} color="#c2410c" />}
                    </TouchableOpacity>
                  ))}
                </>
              )}

              <Text style={styles.label}>Rôle dans l'équipe</Text>
              <View style={styles.chips}>
                {ROLE_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.chip, role === option.value && styles.chipActive]}
                    onPress={() => setRole(option.value)}
                  >
                    <Text style={[styles.chipText, role === option.value && styles.chipTextActive]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={saving}>
                  <Text style={styles.cancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveButton, saving && styles.disabled]} onPress={handleSave} disabled={saving}>
                  {saving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveText}>Ajouter</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, maxHeight: '85%' },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  loader: { marginVertical: 40 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 14 },
  empty: { fontSize: 13, color: colors.muted },
  option: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 6, backgroundColor: colors.background },
  optionActive: { borderColor: '#c2410c' },
  optionInfo: { flex: 1 },
  optionName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  optionSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: '#c2410c', borderColor: '#c2410c' },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  chipTextActive: { color: '#ffffff' },
  errorText: { color: colors.danger, fontSize: 13, fontWeight: '500', marginTop: 14, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  cancelText: { fontSize: 15, fontWeight: 'bold', color: colors.textSecondary },
  saveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#c2410c' },
  saveText: { fontSize: 15, fontWeight: 'bold', color: '#ffffff' },
  disabled: { opacity: 0.6 },
});

export default AddMemberModal;
