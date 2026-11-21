import React, { useMemo, useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../../Navigation/TabNavigator';
import { useSession } from '../../Context/SessionContext';
import siteService, { SiteStatus } from '../../Services/siteService';
import worksiteService from '../../Services/worksiteService';
import { useTheme } from '../../Theme/ThemeContext';
import { ThemeColors } from '../../Theme/colors';

type Props = NativeStackScreenProps<DashboardStackParamList, 'CreateSite'>;

const STATUS_OPTIONS: { value: SiteStatus; label: string }[] = [
  { value: 'PLANIFIE', label: 'Planifié' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'SUSPENDU', label: 'Suspendu' },
  { value: 'TERMINE', label: 'Terminé' },
  { value: 'ANNULE', label: 'Annulé' },
];

const isValidDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const todayIso = (): string => new Date().toISOString().slice(0, 10);

const CreateSite: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { organizationId, loadSession, selectSite } = useSession();
  const editingId = route.params?.siteId;
  const isEditing = !!editingId;
  const [loadingSite, setLoadingSite] = useState<boolean>(isEditing);

  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(todayIso());
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<SiteStatus>('EN_COURS');
  const [budget, setBudget] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!editingId) return;
    worksiteService
      .getDetail(editingId)
      .then(site => {
        setName(site.name);
        setAddress(site.address);
        setCity(site.city);
        setPostalCode(site.postalCode);
        setStartDate(site.startDate ? site.startDate.slice(0, 10) : '');
        setEndDate(site.endDate ? site.endDate.slice(0, 10) : '');
        setStatus(site.status as SiteStatus);
        setBudget(site.budget !== null && site.budget !== undefined ? String(site.budget) : '');
      })
      .catch(() => setError('Impossible de charger le chantier.'))
      .finally(() => setLoadingSite(false));
  }, [editingId]);

  const validate = (): string => {
    if (!name.trim()) return 'Le nom du chantier est obligatoire.';
    if (!address.trim()) return "L'adresse est obligatoire.";
    if (!city.trim()) return 'La ville est obligatoire.';
    if (!postalCode.trim()) return 'Le code postal est obligatoire.';
    if (!isValidDate(startDate.trim())) return 'La date de début doit être au format AAAA-MM-JJ.';
    if (endDate.trim() && !isValidDate(endDate.trim())) return 'La date de fin doit être au format AAAA-MM-JJ.';
    if (endDate.trim() && endDate.trim() < startDate.trim()) return 'La date de fin doit être après la date de début.';
    const amount = Number(budget.replace(',', '.'));
    if (!budget.trim() || Number.isNaN(amount) || amount < 0) return 'Le budget doit être un nombre positif.';
    if (!isEditing && !organizationId) return 'Organisation introuvable, reconnectez-vous.';
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await siteService.updateSite(editingId, {
          name: name.trim(),
          address: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          startDate: startDate.trim(),
          endDate: endDate.trim() || undefined,
          status,
          budget: Number(budget.replace(',', '.')),
        });
        await loadSession();
        navigation.popTo('JobsiteHub', { chantierName: updated.name ?? name.trim(), siteId: editingId });
        return;
      }
      const site = await siteService.createSite({
        organizationId: organizationId as string,
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim() || undefined,
        status,
        budget: Number(budget.replace(',', '.')),
      });
      await loadSession();
      await selectSite(site.id);
      navigation.replace('JobsiteHub', { chantierName: site.name, siteId: site.id });
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError(isEditing ? "Votre rôle ne permet pas de modifier ce chantier." : "Votre rôle ne permet pas de créer un chantier.");
      } else {
        const message = err.response?.data?.message;
        setError((Array.isArray(message) ? message[0] : message) || (isEditing ? 'Impossible de modifier le chantier.' : 'Impossible de créer le chantier.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#c2410c" />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Modifier le chantier' : 'Nouveau chantier'}</Text>
      </View>

      {loadingSite ? (
        <ActivityIndicator size="large" color="#c2410c" style={styles.loader} />
      ) : (
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nom du chantier</Text>
        <TextInput style={styles.input} placeholder="Ex : Tour Horizon" placeholderTextColor={colors.placeholder} value={name} onChangeText={setName} />

        <Text style={styles.label}>Adresse</Text>
        <TextInput style={styles.input} placeholder="Ex : 12 rue de la Paix" placeholderTextColor={colors.placeholder} value={address} onChangeText={setAddress} />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Ville</Text>
            <TextInput style={styles.input} placeholder="Ex : Paris" placeholderTextColor={colors.placeholder} value={city} onChangeText={setCity} />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Code postal</Text>
            <TextInput style={styles.input} placeholder="Ex : 75012" placeholderTextColor={colors.placeholder} value={postalCode} onChangeText={setPostalCode} keyboardType="number-pad" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Date de début</Text>
            <TextInput style={styles.input} placeholder="AAAA-MM-JJ" placeholderTextColor={colors.placeholder} value={startDate} onChangeText={setStartDate} keyboardType="numbers-and-punctuation" autoCapitalize="none" />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Date de fin</Text>
            <TextInput style={styles.input} placeholder="AAAA-MM-JJ" placeholderTextColor={colors.placeholder} value={endDate} onChangeText={setEndDate} keyboardType="numbers-and-punctuation" autoCapitalize="none" />
          </View>
        </View>

        <Text style={styles.label}>Statut</Text>
        <View style={styles.chips}>
          {STATUS_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.chip, status === option.value && styles.chipActive]}
              onPress={() => setStatus(option.value)}
            >
              <Text style={[styles.chipText, status === option.value && styles.chipTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Budget (€)</Text>
        <TextInput style={styles.input} placeholder="Ex : 500000" placeholderTextColor={colors.placeholder} value={budget} onChangeText={setBudget} keyboardType="decimal-pad" />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={submitting}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.submitButton, submitting && styles.submitDisabled]} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.submitText}>{isEditing ? 'Enregistrer' : 'Créer'}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8 },
  backButton: { marginRight: 6, marginLeft: -8 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  loader: { marginTop: 60 },
  form: { padding: 16, paddingBottom: 140 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: colors.surface, color: colors.text, padding: 13, borderRadius: 10, borderWidth: 1, borderColor: colors.border, fontSize: 14 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: '#c2410c', borderColor: '#c2410c' },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  chipTextActive: { color: '#ffffff' },
  errorText: { color: '#ef4444', fontSize: 13, fontWeight: '500', marginTop: 14, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelButton: { flex: 1, paddingVertical: 15, borderRadius: 12, alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  cancelText: { fontSize: 15, fontWeight: 'bold', color: colors.textSecondary },
  submitButton: { flex: 1, paddingVertical: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#c2410c' },
  submitDisabled: { opacity: 0.6 },
  submitText: { fontSize: 15, fontWeight: 'bold', color: '#ffffff' },
});

export default CreateSite;
