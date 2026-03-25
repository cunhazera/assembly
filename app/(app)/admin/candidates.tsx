import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { Candidate, Position } from '@/types';

interface CandidateForm {
  name: string;
  bio: string;
}

const EMPTY_FORM: CandidateForm = { name: '', bio: '' };

export default function CandidatesScreen() {
  const { election_id, election_title } = useLocalSearchParams<{
    election_id: string;
    election_title: string;
  }>();

  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Record<string, Candidate[]>>({});
  const [loading, setLoading] = useState(true);

  // Which position is the add-form open for
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [form, setForm] = useState<CandidateForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CandidateForm>(EMPTY_FORM);

  const load = useCallback(async () => {
    const [{ data: posData }, { data: candData }] = await Promise.all([
      supabase.from('positions').select('*').eq('election_id', election_id).order('name'),
      supabase
        .from('candidates')
        .select('*, positions!inner(election_id)')
        .eq('positions.election_id', election_id),
    ]);

    setPositions(posData ?? []);

    const grouped: Record<string, Candidate[]> = {};
    posData?.forEach(p => { grouped[p.id] = []; });
    candData?.forEach((c: Candidate) => {
      if (grouped[c.position_id]) grouped[c.position_id].push(c);
    });
    setCandidates(grouped);
    setLoading(false);
  }, [election_id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const addCandidate = async (positionId: string) => {
    if (!form.name.trim()) { Alert.alert('Required', 'Please enter a candidate name.'); return; }
    setSaving(true);
    const { error } = await supabase.from('candidates').insert({
      position_id: positionId,
      name: form.name.trim(),
      bio: form.bio.trim() || null,
    });
    setSaving(false);
    if (error) { Alert.alert('Error', error.message); return; }
    setAddingTo(null);
    setForm(EMPTY_FORM);
    load();
  };

  const saveEdit = async (candidateId: string) => {
    if (!editForm.name.trim()) { Alert.alert('Required', 'Please enter a candidate name.'); return; }
    setSaving(true);
    const { error } = await supabase.from('candidates').update({
      name: editForm.name.trim(),
      bio: editForm.bio.trim() || null,
    }).eq('id', candidateId);
    setSaving(false);
    if (error) { Alert.alert('Error', error.message); return; }
    setEditingId(null);
    load();
  };

  const deleteCandidate = (candidate: Candidate) => {
    Alert.alert('Remove Candidate', `Remove ${candidate.name} from the ballot?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('candidates').delete().eq('id', candidate.id);
          if (error) Alert.alert('Error', error.message);
          else load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Typography color={colors.primary}>← Back</Typography>
        </TouchableOpacity>
        <Typography variant="h2" numberOfLines={1} style={styles.headerTitle}>
          Candidates
        </Typography>
        <View style={styles.backButton} />
      </View>

      {election_title ? (
        <View style={styles.subheader}>
          <Typography variant="caption" color={colors.muted}>{election_title}</Typography>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {positions.map(position => (
            <View key={position.id} style={styles.positionSection}>
              <View style={styles.positionHeader}>
                <Typography variant="h3">{position.name}</Typography>
                <Typography variant="caption" color={colors.muted}>
                  max {position.max_votes} vote{position.max_votes > 1 ? 's' : ''}
                </Typography>
              </View>

              {(candidates[position.id] ?? []).map(candidate => (
                <View key={candidate.id} style={styles.candidateCard}>
                  {editingId === candidate.id ? (
                    <View style={styles.editForm}>
                      <TextInput
                        style={styles.input}
                        value={editForm.name}
                        onChangeText={v => setEditForm(f => ({ ...f, name: v }))}
                        placeholder="Full name"
                        placeholderTextColor={colors.muted}
                        autoFocus
                      />
                      <TextInput
                        style={[styles.input, styles.inputMultiline, { marginTop: 8 }]}
                        value={editForm.bio}
                        onChangeText={v => setEditForm(f => ({ ...f, bio: v }))}
                        placeholder="Short bio (optional)"
                        placeholderTextColor={colors.muted}
                        multiline
                        numberOfLines={2}
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity onPress={() => setEditingId(null)}>
                          <Typography variant="caption" color={colors.muted}>Cancel</Typography>
                        </TouchableOpacity>
                        <Button
                          title="Save"
                          onPress={() => saveEdit(candidate.id)}
                          loading={saving}
                          style={styles.saveBtn}
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.candidateRow}>
                      <View style={styles.candidateInfo}>
                        <Typography variant="h3">{candidate.name}</Typography>
                        {candidate.bio ? (
                          <Typography variant="caption" style={styles.bio}>
                            {candidate.bio}
                          </Typography>
                        ) : null}
                      </View>
                      <View style={styles.candidateActions}>
                        <TouchableOpacity
                          onPress={() => {
                            setEditingId(candidate.id);
                            setEditForm({ name: candidate.name, bio: candidate.bio ?? '' });
                          }}
                          style={styles.iconBtn}
                        >
                          <Typography variant="caption" color={colors.primary}>Edit</Typography>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => deleteCandidate(candidate)}
                          style={styles.iconBtn}
                        >
                          <Typography variant="caption" color={colors.error}>Remove</Typography>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))}

              {addingTo === position.id ? (
                <View style={styles.addForm}>
                  <TextInput
                    style={styles.input}
                    value={form.name}
                    onChangeText={v => setForm(f => ({ ...f, name: v }))}
                    placeholder="Full name"
                    placeholderTextColor={colors.muted}
                    autoFocus
                  />
                  <TextInput
                    style={[styles.input, styles.inputMultiline, { marginTop: 8 }]}
                    value={form.bio}
                    onChangeText={v => setForm(f => ({ ...f, bio: v }))}
                    placeholder="Short bio (optional)"
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={2}
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity onPress={() => { setAddingTo(null); setForm(EMPTY_FORM); }}>
                      <Typography variant="caption" color={colors.muted}>Cancel</Typography>
                    </TouchableOpacity>
                    <Button
                      title="Add"
                      onPress={() => addCandidate(position.id)}
                      loading={saving}
                      style={styles.saveBtn}
                    />
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => { setAddingTo(position.id); setForm(EMPTY_FORM); }}
                >
                  <Typography variant="caption" color={colors.primary}>+ Add Candidate</Typography>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  backButton: { width: 60 },
  subheader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },
  positionSection: { marginBottom: 28 },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  candidateCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  candidateRow: { flexDirection: 'row', alignItems: 'center' },
  candidateInfo: { flex: 1 },
  bio: { marginTop: 2 },
  candidateActions: { flexDirection: 'row', gap: 12 },
  iconBtn: { paddingVertical: 4 },
  editForm: {},
  addForm: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    padding: 12,
    marginBottom: 8,
  },
  input: {
    height: 44,
    backgroundColor: colors.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: typography.body,
    color: colors.text,
  },
  inputMultiline: {
    height: 64,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  saveBtn: { height: 36, paddingHorizontal: 16 },
  addButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
});
