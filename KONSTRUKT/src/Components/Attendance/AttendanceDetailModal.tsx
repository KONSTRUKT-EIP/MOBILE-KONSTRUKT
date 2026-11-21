import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, Modal, TouchableOpacity, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { useTheme } from '../../Theme/ThemeContext';
import { ThemeColors } from '../../Theme/colors';
import attendanceService, { BackendStatus } from '../../Services/attendanceService';

export type UiStatus = 'present' | 'absent' | 'retard' | 'conge' | 'en-attente';

export interface DetailWorker {
  id: string;
  teamId: string;
  name: string;
  specialite: string;
}

export interface DetailResult {
  status: UiStatus;
  normalHours: number;
  overtimeHours: number;
}

interface Props {
  visible: boolean;
  siteId: string;
  worker: DetailWorker | null;
  date: string;
  dateLabel: string;
  currentStatus: UiStatus;
  onClose: () => void;
  onSaved: (result: DetailResult) => void;
}

const STATUS_OPTIONS: { ui: Exclude<UiStatus, 'en-attente'>; backend: BackendStatus; label: string }[] = [
  { ui: 'present', backend: 'PRESENT', label: 'Présent' },
  { ui: 'retard', backend: 'RETARD', label: 'Retard' },
  { ui: 'absent', backend: 'ABSENT', label: 'Absent' },
  { ui: 'conge', backend: 'CONGE', label: 'Congé' },
];

const parseHours = (value: string): number | null => {
  const normalized = value.trim().replace(',', '.');
  if (normalized === '') return 0;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  return amount >= 0 && amount <= 24 ? amount : null;
};

const toInput = (value: string | number | undefined): string => {
  const amount = Number(value ?? 0);
  return amount > 0 ? String(amount).replace('.', ',') : '';
};

const AttendanceDetailModal: React.FC<Props> = ({
  visible, siteId, worker, date, dateLabel, currentStatus, onClose, onSaved,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [status, setStatus] = useState<Exclude<UiStatus, 'en-attente'>>('present');
  const [normalHours, setNormalHours] = useState<string>('');
  const [overtimeHours, setOvertimeHours] = useState<string>('');
  const [minutesLate, setMinutesLate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [recordId, setRecordId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!visible || !worker) return;
    let cancelled = false;
    setError('');
    setLoading(true);
    setStatus(currentStatus === 'en-attente' ? 'present' : currentStatus);
    setNormalHours('');
    setOvertimeHours('');
    setMinutesLate('');
    setNotes('');
    setRecordId(null);
    attendanceService
      .getRecord(worker.teamId, worker.id, date)
      .then(record => {
        if (cancelled || !record) return;
        setRecordId(record.id);
        setNormalHours(toInput(record.normalHours));
        setOvertimeHours(toInput(record.overtimeHours));
        setMinutesLate(record.minutesLate ? String(record.minutesLate) : '');
        setNotes(record.notes ?? '');
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger le détail de cette présence.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, worker, date, currentStatus]);

  const handleSave = async () => {
    if (!worker) return;
    const normal = parseHours(normalHours);
    const overtime = parseHours(overtimeHours);
    if (normal === null || overtime === null) {
      setError('Les heures doivent être comprises entre 0 et 24 (2 décimales maximum).');
      return;
    }
    const late = minutesLate.trim() === '' ? undefined : Number(minutesLate);
    if (status === 'retard' && late !== undefined && (!Number.isInteger(late) || late < 1)) {
      setError('Les minutes de retard doivent être un nombre entier positif.');
      return;
    }

    setError('');
    setSaving(true);
    let statusSaved = false;
    try {
      const option = STATUS_OPTIONS.find(item => item.ui === status) as (typeof STATUS_OPTIONS)[number];
      const record = await attendanceService.upsertStatus(worker.teamId, worker.id, date, option.backend);
      statusSaved = true;
      await attendanceService.saveHours(siteId, {
        teamId: worker.teamId,
        userId: worker.id,
        date,
        normalHours: normal,
        overtimeHours: overtime,
      });
      const details: { notes?: string; minutesLate?: number } = {};
      if (notes.trim()) details.notes = notes.trim();
      if (status === 'retard' && late !== undefined) details.minutesLate = late;
      if (Object.keys(details).length > 0) {
        await attendanceService.updateDetails(record.id, details);
      }
      onSaved({ status, normalHours: normal, overtimeHours: overtime });
      onClose();
    } catch (err: any) {
      if (statusSaved) onSaved({ status, normalHours: Number(normal) || 0, overtimeHours: Number(overtime) || 0 });
      const code = err?.response?.status;
      if (code === 403) setError("Votre rôle ne permet pas d'enregistrer ces informations.");
      else setError("L'enregistrement n'est pas complet. Vérifiez le détail puis réessayez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.sheet}>
            <Text style={styles.title}>{worker?.name}</Text>
            <Text style={styles.subtitle}>{worker?.specialite} · {dateLabel}</Text>

            {loading ? (
              <ActivityIndicator size="large" color="#c2410c" style={styles.loader} />
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Statut</Text>
                <View style={styles.chips}>
                  {STATUS_OPTIONS.map(option => (
                    <TouchableOpacity
                      key={option.ui}
                      style={[styles.chip, status === option.ui && styles.chipActive]}
                      onPress={() => setStatus(option.ui)}
                    >
                      <Text style={[styles.chipText, status === option.ui && styles.chipTextActive]}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {status === 'retard' && (
                  <>
                    <Text style={styles.label}>Minutes de retard</Text>
                    <TextInput
                      style={styles.input}
                      value={minutesLate}
                      onChangeText={setMinutesLate}
                      keyboardType="number-pad"
                      placeholder="Ex : 15"
                      placeholderTextColor={colors.placeholder}
                    />
                  </>
                )}

                <View style={styles.row}>
                  <View style={styles.half}>
                    <Text style={styles.label}>Heures normales</Text>
                    <TextInput
                      style={styles.input}
                      value={normalHours}
                      onChangeText={setNormalHours}
                      keyboardType="decimal-pad"
                      placeholder="Ex : 7,5"
                      placeholderTextColor={colors.placeholder}
                    />
                  </View>
                  <View style={styles.half}>
                    <Text style={styles.label}>Heures sup.</Text>
                    <TextInput
                      style={styles.input}
                      value={overtimeHours}
                      onChangeText={setOvertimeHours}
                      keyboardType="decimal-pad"
                      placeholder="Ex : 1"
                      placeholderTextColor={colors.placeholder}
                    />
                  </View>
                </View>

                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.notes]}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  placeholder="Remarque sur cette journée (optionnel)"
                  placeholderTextColor={colors.placeholder}
                />
                {recordId && <Text style={styles.hint}>Une note vide ne remplace pas la note déjà enregistrée.</Text>}

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <View style={styles.actions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={saving}>
                    <Text style={styles.cancelText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.saveButton, saving && styles.disabled]} onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveText}>Enregistrer</Text>}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, maxHeight: '88%' },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 2, marginBottom: 6 },
  loader: { marginVertical: 40 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: '#c2410c', borderColor: '#c2410c' },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  chipTextActive: { color: '#ffffff' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  input: { backgroundColor: colors.background, color: colors.text, padding: 13, borderRadius: 10, borderWidth: 1, borderColor: colors.border, fontSize: 14 },
  notes: { minHeight: 80, textAlignVertical: 'top' },
  hint: { fontSize: 11, color: colors.placeholder, marginTop: 6 },
  errorText: { color: colors.danger, fontSize: 13, fontWeight: '500', marginTop: 14, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  cancelText: { fontSize: 15, fontWeight: 'bold', color: colors.textSecondary },
  saveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#c2410c' },
  saveText: { fontSize: 15, fontWeight: 'bold', color: '#ffffff' },
  disabled: { opacity: 0.6 },
});

export default AttendanceDetailModal;
