import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TextInput,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../API/Api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_COL_WIDTH = Math.max(SCREEN_WIDTH * 0.36, 130);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const toISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const DAYS_FR    = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const DAYS_SHORT = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const MONTHS_FR  = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'];

const STATUS_STYLES = {
  done:           { bg: '#f0fdf4', border: '#4ade80', text: '#16a34a', label: 'Terminé'     },
  'weather-risk': { bg: '#fefce8', border: '#facc15', text: '#ca8a04', label: 'Risque météo' },
  late:           { bg: '#fef2f2', border: '#f87171', text: '#dc2626', label: 'En retard'   },
  'in-progress':  { bg: '#eff6ff', border: '#60a5fa', text: '#2563eb', label: 'En cours'    },
};

const BADGE_STYLES = {
  'En retard': { bg: '#fee2e2', text: '#dc2626' },
  'À décaler': { bg: '#fef9c3', text: '#b45309' },
  'À risque':  { bg: '#ffedd5', text: '#ea580c' },
};

const WEATHER_BY_OFFSET = [
  { label: 'Beau',     icon: '☀️'  },
  { label: 'Variable', icon: '🌤️' },
  { label: 'Nuageux',  icon: '☁️'  },
  { label: 'Pluie',    icon: '🌧️' },
  { label: 'Variable', icon: '⛅'  },
  { label: 'Accalmie', icon: '🌥️' },
  { label: 'Repos',    icon: '🌙'  },
];

const TASK_TYPES    = ['GENIE_CIVIL','ELECTRICITE','PLOMBERIE','PEINTURE','MENUISERIE','AUTRE'];
const STATUS_OPTIONS = ['TODO','IN_PROGRESS','DONE','CANCELLED'];
const STATUS_LABELS  = { TODO: 'À faire', IN_PROGRESS: 'En cours', DONE: 'Terminé', CANCELLED: 'Annulé' };

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('access_token');
  return { Authorization: `Bearer ${token}` };
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, color }) => (
  <View style={[styles.statCard, { backgroundColor: color || '#fff' }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel} numberOfLines={2}>{label}</Text>
  </View>
);

// ─── ActionItem ───────────────────────────────────────────────────────────────

const ActionItem = ({ action }) => {
  const badge = BADGE_STYLES[action.badge] || BADGE_STYLES['À risque'];
  return (
    <View style={styles.actionItem}>
      <View style={[styles.actionIconBox, { backgroundColor: action.iconBg || '#f3f4f6' }]}>
        <Text style={styles.actionIconText}>{action.icon}</Text>
      </View>
      <View style={styles.actionBody}>
        <Text style={styles.actionLabel} numberOfLines={1}>{action.label}</Text>
        <Text style={styles.actionSub}   numberOfLines={1}>{action.sublabelIcon} {action.sublabel}</Text>
      </View>
      <View style={[styles.actionBadge, { backgroundColor: badge.bg }]}>
        <Text style={[styles.actionBadgeText, { color: badge.text }]}>{action.badge}</Text>
      </View>
    </View>
  );
};

// ─── TaskCard ─────────────────────────────────────────────────────────────────

const TaskCard = ({ task, onPress }) => {
  const s = STATUS_STYLES[task.status] || STATUS_STYLES['in-progress'];
  return (
    <TouchableOpacity
      style={[styles.taskCard, { backgroundColor: s.bg, borderLeftColor: s.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {task.time ? <Text style={[styles.taskTime, { color: s.text }]}>{task.time}</Text> : null}
      <Text style={[styles.taskLabel, { color: s.text }]} numberOfLines={3}>{task.label}</Text>
    </TouchableOpacity>
  );
};

// ─── DayColumn ────────────────────────────────────────────────────────────────

const DayColumn = ({ date, tasks, weather, isToday, onTaskPress }) => {
  const isoDate  = toISO(date);
  const dayTasks = tasks.filter((t) => t.date === isoDate);

  return (
    <View style={[styles.dayColumn, isToday && styles.dayColumnToday]}>
      <View style={[styles.dayHeader, isToday && styles.dayHeaderToday]}>
        <Text style={styles.dayWeatherIcon}>{weather.icon}</Text>
        <Text style={[styles.dayName, isToday && styles.dayNameToday]}>{DAYS_FR[date.getDay()]}</Text>
        <Text style={[styles.dayDate, isToday && styles.dayDateToday]}>{date.getDate()}</Text>
      </View>
      <View style={styles.dayTasks}>
        {dayTasks.length === 0 ? (
          <Text style={styles.noTasksText}>—</Text>
        ) : (
          dayTasks.map((task) => (
            <TaskCard key={task.id} task={task} onPress={() => onTaskPress(task.id)} />
          ))
        )}
      </View>
    </View>
  );
};

// ─── DetailRow ────────────────────────────────────────────────────────────────

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailRowLabel}>{label}</Text>
    <Text style={styles.detailRowValue}>{value}</Text>
  </View>
);

// ─── TaskDetailModal ──────────────────────────────────────────────────────────

const TaskDetailModal = ({ visible, taskId, onClose, onUpdate }) => {
  const [task,     setTask]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (visible && taskId) {
      setEditMode(false);
      loadTask();
    }
  }, [visible, taskId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const res = await api.get(`/planning/tasks/${taskId}`, { headers });
      setTask(res.data);
      setEditData({
        name:        res.data.name        || '',
        description: res.data.description || '',
        status:      res.data.status      || 'TODO',
        priority:    String(res.data.priority || 3),
      });
    } catch {
      Alert.alert('Erreur', 'Impossible de charger la tâche.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editData.name.trim()) {
      Alert.alert('Erreur', 'Le nom est requis.');
      return;
    }
    try {
      setSaving(true);
      const headers = await getAuthHeaders();
      await api.put(
        `/planning/tasks/${taskId}`,
        {
          name:        editData.name,
          description: editData.description,
          status:      editData.status,
          priority:    parseInt(editData.priority),
        },
        { headers },
      );
      setEditMode(false);
      await loadTask();
      onUpdate?.();
    } catch (e) {
      const msg = e.response?.data?.message;
      Alert.alert('Erreur', Array.isArray(msg) ? msg.join('\n') : msg || 'Impossible de sauvegarder.');
    } finally {
      setSaving(false);
    }
  };

  const priorityStars = (n) =>
    '★'.repeat(parseInt(n || 0)) + '☆'.repeat(5 - parseInt(n || 0));

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={2}>
              {task ? task.name : 'Chargement…'}
            </Text>
            <View style={styles.modalHeaderActions}>
              {task && !editMode && (
                <TouchableOpacity style={styles.editIconBtn} onPress={() => setEditMode(true)}>
                  <MaterialCommunityIcons name="pencil-outline" size={18} color="#c2410c" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons name="close" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator color="#c2410c" size="large" style={{ margin: 40 }} />
          ) : task ? (
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {!editMode ? (
                // ── Read mode ───────────────────────────────────────────────
                <>
                  <View style={styles.badgeRow}>
                    <View style={[styles.typeBadge, { backgroundColor: '#f3f4f6' }]}>
                      <Text style={styles.typeBadgeText}>{task.type}</Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: task.status === 'DONE' ? '#dcfce7' : task.status === 'IN_PROGRESS' ? '#dbeafe' : '#f3f4f6' },
                    ]}>
                      <Text style={[
                        styles.statusBadgeText,
                        { color: task.status === 'DONE' ? '#16a34a' : task.status === 'IN_PROGRESS' ? '#2563eb' : '#374151' },
                      ]}>
                        {STATUS_LABELS[task.status] || task.status}
                      </Text>
                    </View>
                  </View>

                  <DetailRow label="Priorité"  value={priorityStars(task.priority)} />
                  {task.siteZone   && <DetailRow label="Zone"      value={task.siteZone.name} />}
                  {task.plannedEnd && (
                    <DetailRow
                      label="Échéance"
                      value={new Date(task.plannedEnd).toLocaleDateString('fr-FR')}
                    />
                  )}
                  {task.time && <DetailRow label="Heure" value={task.time} />}

                  {task.description ? (
                    <View style={styles.detailDesc}>
                      <Text style={styles.detailDescLabel}>Description</Text>
                      <Text style={styles.detailDescText}>{task.description}</Text>
                    </View>
                  ) : null}

                  {task.assignments?.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Assignés</Text>
                      {task.assignments.map((a, i) => (
                        <Text key={i} style={styles.assigneeText}>
                          👤 {a.user?.firstName} {a.user?.lastName}
                          {a.user?.email ? ` · ${a.user.email}` : ''}
                        </Text>
                      ))}
                    </View>
                  )}

                  {task.alerts?.filter((a) => !a.isRead).length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Alertes actives</Text>
                      {task.alerts
                        .filter((a) => !a.isRead)
                        .map((a, i) => (
                          <View key={i} style={styles.alertItem}>
                            <MaterialCommunityIcons name="alert-outline" size={16} color="#f59e0b" />
                            <Text style={styles.alertText}>{a.message}</Text>
                          </View>
                        ))}
                    </View>
                  )}
                </>
              ) : (
                // ── Edit mode ────────────────────────────────────────────────
                <>
                  <Text style={styles.editLabel}>Nom</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editData.name}
                    onChangeText={(v) => setEditData((p) => ({ ...p, name: v }))}
                    placeholderTextColor="#9ca3af"
                  />

                  <Text style={styles.editLabel}>Description</Text>
                  <TextInput
                    style={[styles.editInput, { height: 80, textAlignVertical: 'top' }]}
                    value={editData.description}
                    onChangeText={(v) => setEditData((p) => ({ ...p, description: v }))}
                    multiline
                    placeholder="Description optionnelle"
                    placeholderTextColor="#9ca3af"
                  />

                  <Text style={styles.editLabel}>Statut</Text>
                  <View style={styles.chipRow}>
                    {STATUS_OPTIONS.map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.chip, editData.status === s && styles.chipActive]}
                        onPress={() => setEditData((p) => ({ ...p, status: s }))}
                      >
                        <Text style={[styles.chipText, editData.status === s && styles.chipTextActive]}>
                          {STATUS_LABELS[s]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.editLabel}>Priorité</Text>
                  <View style={styles.priorityRow}>
                    {[1, 2, 3, 4, 5].map((p) => (
                      <TouchableOpacity
                        key={p}
                        style={[styles.priorityBtn, editData.priority === String(p) && styles.priorityBtnActive]}
                        onPress={() => setEditData((prev) => ({ ...prev, priority: String(p) }))}
                      >
                        <Text style={[styles.priorityBtnText, editData.priority === String(p) && styles.priorityBtnTextActive]}>
                          {p}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.editActions}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditMode(false)}>
                      <Text style={styles.cancelBtnText}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                      onPress={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.saveBtnText}>Enregistrer</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
              <View style={{ height: 32 }} />
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

// ─── CreateTaskModal ──────────────────────────────────────────────────────────

const CreateTaskModal = ({ visible, onClose, onCreated }) => {
  const [form, setForm] = useState({
    name: '', description: '', type: 'AUTRE', priority: '3', plannedEnd: '', time: '',
  });
  const [loading,         setLoading]         = useState(false);
  const [users,           setUsers]           = useState([]);
  const [zones,           setZones]           = useState([]);
  const [selectedZoneId,  setSelectedZoneId]  = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  useEffect(() => {
    if (visible) {
      loadOptions();
      setForm({ name: '', description: '', type: 'AUTRE', priority: '3', plannedEnd: '', time: '' });
      setSelectedZoneId('');
      setSelectedUserIds([]);
    }
  }, [visible]);

  const loadOptions = async () => {
    try {
      const headers = await getAuthHeaders();
      const [usersRes, sitesRes] = await Promise.all([
        api.get('/users',  { headers }),
        api.get('/sites',  { headers }),
      ]);
      setUsers(usersRes.data || []);
      const allZones = [];
      for (const site of sitesRes.data || []) {
        try {
          const siteDetail = await api.get(`/sites/${site.id}`, { headers });
          (siteDetail.data.siteZones || []).forEach((z) =>
            allZones.push({ ...z, siteName: site.name }),
          );
        } catch { /* skip */ }
      }
      setZones(allZones);
    } catch (e) {
      console.error('CreateTaskModal loadOptions error:', e);
    }
  };

  const toggleUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert('Erreur', 'Le nom de la tâche est requis.');
      return;
    }
    if (!form.plannedEnd.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Erreur', 'La date doit être au format YYYY-MM-DD.');
      return;
    }
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const payload = {
        name:     form.name.trim(),
        type:     form.type,
        priority: parseInt(form.priority),
        plannedEnd: new Date(form.plannedEnd).toISOString(),
        ...(form.description.trim()              && { description:   form.description.trim() }),
        ...(form.time.match(/^\d{2}:\d{2}$/)    && { time:          form.time }),
        ...(selectedZoneId                        && { siteZoneId:    selectedZoneId }),
        ...(selectedUserIds.length > 0            && { assignedToIds: selectedUserIds }),
      };
      await api.post('/planning/tasks', payload, { headers });
      onCreated?.();
      onClose();
    } catch (e) {
      const msg = e.response?.data?.message;
      Alert.alert('Erreur', Array.isArray(msg) ? msg.join('\n') : msg || 'Création impossible.');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { maxHeight: '93%' }]}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouvelle tâche</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.editLabel}>Nom *</Text>
              <TextInput
                style={styles.editInput}
                value={form.name}
                onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="Nom de la tâche"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.editLabel}>Description</Text>
              <TextInput
                style={[styles.editInput, { height: 70, textAlignVertical: 'top' }]}
                value={form.description}
                onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
                multiline
                placeholder="Description optionnelle"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.editLabel}>Date d'échéance * (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.editInput}
                value={form.plannedEnd}
                onChangeText={(v) => setForm((p) => ({ ...p, plannedEnd: v }))}
                placeholder="ex: 2026-03-15"
                placeholderTextColor="#9ca3af"
                keyboardType="numbers-and-punctuation"
              />

              <Text style={styles.editLabel}>Heure (HH:MM)</Text>
              <TextInput
                style={styles.editInput}
                value={form.time}
                onChangeText={(v) => setForm((p) => ({ ...p, time: v }))}
                placeholder="ex: 08:30"
                placeholderTextColor="#9ca3af"
                keyboardType="numbers-and-punctuation"
              />

              <Text style={styles.editLabel}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {TASK_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, form.type === t && styles.chipActive, { marginRight: 8 }]}
                    onPress={() => setForm((p) => ({ ...p, type: t }))}
                  >
                    <Text style={[styles.chipText, form.type === t && styles.chipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.editLabel}>Priorité</Text>
              <View style={styles.priorityRow}>
                {[1, 2, 3, 4, 5].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.priorityBtn, form.priority === String(p) && styles.priorityBtnActive]}
                    onPress={() => setForm((prev) => ({ ...prev, priority: String(p) }))}
                  >
                    <Text style={[styles.priorityBtnText, form.priority === String(p) && styles.priorityBtnTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {zones.length > 0 && (
                <>
                  <Text style={styles.editLabel}>Zone de chantier</Text>
                  <View style={styles.selectableList}>
                    {zones.map((z) => (
                      <TouchableOpacity
                        key={z.id}
                        style={[styles.selectableRow, selectedZoneId === z.id && styles.selectableRowActive]}
                        onPress={() => setSelectedZoneId(selectedZoneId === z.id ? '' : z.id)}
                      >
                        <Text style={[styles.selectableText, selectedZoneId === z.id && styles.selectableTextActive]}>
                          {z.name}{z.siteName ? ` · ${z.siteName}` : ''}
                        </Text>
                        {selectedZoneId === z.id && (
                          <MaterialCommunityIcons name="check-circle" size={16} color="#c2410c" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {users.length > 0 && (
                <>
                  <Text style={styles.editLabel}>Assigner à</Text>
                  <View style={styles.selectableList}>
                    {users.map((u) => (
                      <TouchableOpacity
                        key={u.id}
                        style={[styles.selectableRow, selectedUserIds.includes(u.id) && styles.selectableRowActive]}
                        onPress={() => toggleUser(u.id)}
                      >
                        <Text style={[styles.selectableText, selectedUserIds.includes(u.id) && styles.selectableTextActive]}>
                          👤 {u.firstName} {u.lastName}
                        </Text>
                        {selectedUserIds.includes(u.id) && (
                          <MaterialCommunityIcons name="check-circle" size={16} color="#c2410c" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, loading && { opacity: 0.6 }]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Créer la tâche</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

// ─── TaskListItem ────────────────────────────────────────────────────────────

const TaskListItem = ({ task, onPress }) => {
  const s = STATUS_STYLES[task.status] || STATUS_STYLES['in-progress'];
  return (
    <TouchableOpacity style={styles.taskListItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.taskListAccent, { backgroundColor: s.border }]} />
      <View style={styles.taskListContent}>
        {task.time ? (
          <Text style={[styles.taskListTime, { color: s.text }]}>{task.time}</Text>
        ) : null}
        <Text style={styles.taskListTitle} numberOfLines={2}>{task.label}</Text>
        <View style={[styles.taskListBadge, { backgroundColor: s.bg }]}>
          <Text style={[styles.taskListBadgeText, { color: s.text }]}>{s.label}</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#d1d5db" />
    </TouchableOpacity>
  );
};

// ─── Main Planning Screen ─────────────────────────────────────────────────────

const PlanningPage = () => {
  const [weekStart,      setWeekStart]      = useState(() => getWeekStart(new Date()));
  const [tasks,          setTasks]          = useState([]);
  const [actions,        setActions]        = useState([]);
  const [stats,          setStats]          = useState([
    { icon: '📋', label: 'Tâches\ncette semaine', value: 0, color: '#fff'    },
    { icon: '⏰', label: 'Tâches\nen retard',     value: 0, color: '#fef2f2' },
    { icon: '⚠️',  label: 'À risque\nmétéo',      value: 0, color: '#fefce8' },
  ]);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isCreateOpen,   setIsCreateOpen]   = useState(false);
  const [selectedDay,    setSelectedDay]    = useState(() => toISO(new Date()));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const todayISO = toISO(new Date());

  const weekLabel = (() => {
    const s = weekDays[0];
    const e = weekDays[6];
    return `${s.getDate()} ${MONTHS_FR[s.getMonth()]} – ${e.getDate()} ${MONTHS_FR[e.getMonth()]} ${e.getFullYear()}`;
  })();

  const loadData = useCallback(async (ws) => {
    try {
      const headers   = await getAuthHeaders();
      const startDate = toISO(ws);
      const endDate   = toISO(addDays(ws, 6));
      const res = await api.get(
        `/planning/week?startDate=${startDate}&endDate=${endDate}`,
        { headers },
      );
      const data = res.data;
      setTasks(data.tasks   || []);
      setActions(data.actions || []);
      if (data.stats) {
        setStats([
          { icon: '📋', label: 'Tâches\ncette semaine', value: data.stats.tasksThisWeek   || 0, color: '#fff'    },
          { icon: '⏰', label: 'Tâches\nen retard',     value: data.stats.tasksLate        || 0, color: '#fef2f2' },
          { icon: '⚠️',  label: 'À risque\nmétéo',      value: data.stats.tasksWeatherRisk || 0, color: '#fefce8' },
        ]);
      }
    } catch (e) {
      console.error('Planning loadData error:', e?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadData(weekStart);
  }, [weekStart, loadData]);

  useEffect(() => {
    const weekISOs = Array.from({ length: 7 }, (_, i) => toISO(addDays(weekStart, i)));
    if (!weekISOs.includes(selectedDay)) setSelectedDay(weekISOs[0]);
  }, [weekStart]);

  const goToPrevWeek = () => setWeekStart((w) => addDays(w, -7));
  const goToNextWeek = () => setWeekStart((w) => addDays(w, 7));
  const goToToday    = () => setWeekStart(getWeekStart(new Date()));

  return (
    <View style={styles.container}>
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Planning</Text>
        <TouchableOpacity style={styles.newTaskBtn} onPress={() => setIsCreateOpen(true)}>
          <MaterialCommunityIcons name="plus" size={16} color="#fff" />
          <Text style={styles.newTaskBtnText}>Nouvelle tâche</Text>
        </TouchableOpacity>
      </View>

      {/* ── Teams-style week strip (fixed, always visible) ──────── */}
      <View style={styles.weekHeader}>
        <TouchableOpacity onPress={() => { setSelectedDay(todayISO); setWeekStart(getWeekStart(new Date())); }}>
          <Text style={styles.monthLabel}>
            {MONTHS_FR[weekDays[0].getMonth()][0].toUpperCase() +
              MONTHS_FR[weekDays[0].getMonth()].slice(1)}{' '}
            {weekDays[0].getFullYear()}
          </Text>
        </TouchableOpacity>
        <View style={styles.stripRow}>
          <TouchableOpacity style={styles.navBtn} onPress={goToPrevWeek}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#374151" />
          </TouchableOpacity>
          <View style={styles.dayStrip}>
            {weekDays.map((day, i) => {
              const iso        = toISO(day);
              const isToday    = iso === todayISO;
              const isSelected = iso === selectedDay;
              const hasTask    = tasks.some((t) => t.date === iso);
              return (
                <TouchableOpacity key={i} style={styles.dayPill} onPress={() => setSelectedDay(iso)}>
                  <Text style={[styles.dayPillName, isToday && styles.dayPillNameToday]}>
                    {DAYS_SHORT[day.getDay()]}
                  </Text>
                  <View style={[
                    styles.dayPillCircle,
                    isSelected && styles.dayPillCircleSelected,
                    isToday && !isSelected && styles.dayPillCircleToday,
                  ]}>
                    <Text style={[
                      styles.dayPillDate,
                      isSelected && styles.dayPillDateSelected,
                      isToday && !isSelected && styles.dayPillDateToday,
                    ]}>
                      {day.getDate()}
                    </Text>
                  </View>
                  {hasTask && <View style={[styles.dayDot, isSelected && styles.dayDotSelected]} />}
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={styles.navBtn} onPress={goToNextWeek}>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#c2410c" />
          <Text style={styles.loadingText}>Chargement du planning…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadData(weekStart); }}
              colors={['#c2410c']}
              tintColor="#c2410c"
            />
          }
        >
          {/* ── Stat cards ──────────────────────────────────────── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScrollContent}
          >
            {stats.map((s) => (<StatCard key={s.label} {...s} />))}
          </ScrollView>

          {/* ── Actions requises ────────────────────────────────── */}
          {actions.length > 0 && (
            <View style={styles.actionsCard}>
              <View style={styles.actionsHeader}>
                <MaterialCommunityIcons name="lightning-bolt" size={18} color="#c2410c" />
                <Text style={styles.actionsTitle}>Actions requises</Text>
                <View style={styles.actionsBadgeCount}>
                  <Text style={styles.actionsBadgeCountText}>{actions.length}</Text>
                </View>
              </View>
              {actions.map((a) => (<ActionItem key={a.id} action={a} />))}
            </View>
          )}

          {/* ── Selected day header ─────────────────────────────── */}
          <View style={styles.daySectionHeader}>
            <Text style={styles.daySectionTitle}>
              {(() => {
                const d = new Date(selectedDay + 'T12:00:00');
                return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
              })()}
            </Text>
            {selectedDay !== todayISO && (
              <TouchableOpacity onPress={() => { setSelectedDay(todayISO); setWeekStart(getWeekStart(new Date())); }}>
                <Text style={styles.todayLink}>Aujourd'hui</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Legend ──────────────────────────────────────────── */}
          <View style={styles.legend}>
            {Object.entries(STATUS_STYLES).map(([, val]) => (
              <View key={val.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: val.border }]} />
                <Text style={styles.legendText}>{val.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Tasks for selected day ───────────────────────────── */}
          {(() => {
            const dayTasks = tasks.filter((t) => t.date === selectedDay);
            if (dayTasks.length === 0) {
              return (
                <View style={styles.emptyDay}>
                  <MaterialCommunityIcons name="calendar-blank-outline" size={44} color="#d1d5db" />
                  <Text style={styles.emptyDayText}>Aucun événement</Text>
                </View>
              );
            }
            return dayTasks.map((task) => (
              <TaskListItem key={task.id} task={task} onPress={() => setSelectedTaskId(task.id)} />
            ));
          })()}

          <View style={{ height: 90 }} />
        </ScrollView>
      )}

      {/* ── Modals ──────────────────────────────────────────────── */}
      <TaskDetailModal
        visible={!!selectedTaskId}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onUpdate={() => loadData(weekStart)}
      />
      <CreateTaskModal
        visible={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => loadData(weekStart)}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Layout ──────────────────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scroll: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },

  // ── Top bar ─────────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  newTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c2410c',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  newTaskBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 4,
  },

  // ── Week strip header (Teams-style) ─────────────────────────────────────────────
  weekHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  stripRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  dayStrip: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayPill: {
    alignItems: 'center',
    paddingVertical: 2,
    minWidth: 36,
  },
  dayPillName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dayPillNameToday: {
    color: '#c2410c',
  },
  dayPillCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayPillCircleSelected: {
    backgroundColor: '#c2410c',
  },
  dayPillCircleToday: {
    borderWidth: 1.5,
    borderColor: '#c2410c',
  },
  dayPillDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  dayPillDateSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  dayPillDateToday: {
    color: '#c2410c',
    fontWeight: 'bold',
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#c2410c',
    marginTop: 3,
    opacity: 0.5,
  },
  dayDotSelected: {
    opacity: 1,
    backgroundColor: '#ffffff',
  },


  // ── Stat cards ───────────────────────────────────────────────────────────────
  statsScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statCard: {
    width: 130,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 16,
  },

  // ── Actions card ─────────────────────────────────────────────────────────────
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  actionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 6,
    flex: 1,
  },
  actionsBadgeCount: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  actionsBadgeCountText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionIconText: {
    fontSize: 18,
  },
  actionBody: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  actionSub: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  actionBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  // ── Legend ───────────────────────────────────────────────────────────────────
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#6b7280',
  },

  // ── Day section + task list (Teams-style) ─────────────────────────────────
  daySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  daySectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
    textTransform: 'capitalize',
  },
  todayLink: {
    fontSize: 13,
    color: '#c2410c',
    fontWeight: '600',
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyDayText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
  },
  taskListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  taskListAccent: {
    width: 4,
    borderRadius: 2,
    marginRight: 14,
    alignSelf: 'stretch',
    minHeight: 40,
  },
  taskListContent: {
    flex: 1,
  },
  taskListTime: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  taskListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  taskListBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  taskListBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Modal ────────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIconBtn: {
    padding: 6,
    marginRight: 8,
    backgroundColor: '#ffedd5',
    borderRadius: 8,
  },
  modalBody: {
    flex: 1,
  },

  // ── Badge row ────────────────────────────────────────────────────────────────
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Detail rows ──────────────────────────────────────────────────────────────
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailRowLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  detailRowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  detailDesc: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  detailDescLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailDescText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  detailSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  assigneeText: {
    fontSize: 13,
    color: '#374151',
    paddingVertical: 4,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  alertText: {
    fontSize: 13,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },

  // ── Edit form ────────────────────────────────────────────────────────────────
  editLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  editInput: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#ffedd5',
    borderColor: '#c2410c',
  },
  chipText: {
    fontSize: 12,
    color: '#374151',
  },
  chipTextActive: {
    color: '#c2410c',
    fontWeight: 'bold',
  },
  priorityRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  priorityBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  priorityBtnActive: {
    backgroundColor: '#c2410c',
    borderColor: '#c2410c',
  },
  priorityBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151',
  },
  priorityBtnTextActive: {
    color: '#ffffff',
  },
  editActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 10,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#c2410c',
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  selectableList: {
    marginBottom: 12,
  },
  selectableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectableRowActive: {
    backgroundColor: '#ffedd5',
    borderColor: '#c2410c',
  },
  selectableText: {
    fontSize: 13,
    color: '#374151',
  },
  selectableTextActive: {
    color: '#c2410c',
    fontWeight: 'bold',
  },
});

export default PlanningPage;