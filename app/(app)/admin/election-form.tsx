import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

interface PositionDraft {
  id?: string;        // existing positions have an id
  name: string;
  max_votes: string;  // string for TextInput, parsed on save
}

export default function ElectionForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(false);
  const [positions, setPositions] = useState<PositionDraft[]>([
    { name: 'Elder', max_votes: '1' },
    { name: 'Deacon', max_votes: '1' },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    async function load() {
      const [{ data: election }, { data: posData }] = await Promise.all([
        supabase.from('elections').select('*').eq('id', id).single(),
        supabase.from('positions').select('*').eq('election_id', id).order('name'),
      ]);
      if (election) {
        setTitle(election.title);
        setDescription(election.description ?? '');
        setActive(election.active);
      }
      if (posData) {
        setPositions(posData.map(p => ({ id: p.id, name: p.name, max_votes: String(p.max_votes) })));
      }
    }
    load();
  }, [id]);

  const addPosition = () =>
    setPositions(prev => [...prev, { name: '', max_votes: '1' }]);

  const removePosition = (index: number) =>
    setPositions(prev => prev.filter((_, i) => i !== index));

  const updatePosition = (index: number, field: keyof PositionDraft, value: string) =>
    setPositions(prev => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));

  const save = async () => {
    if (!title.trim()) { Alert.alert('Required', 'Please enter an election title.'); return; }
    if (positions.some(p => !p.name.trim())) { Alert.alert('Required', 'All positions need a name.'); return; }

    setSaving(true);
    try {
      let electionId = id;

      if (isEditing) {
        const { error } = await supabase
          .from('elections')
          .update({ title: title.trim(), description: description.trim(), active })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('elections')
          .insert({ title: title.trim(), description: description.trim(), active })
          .select('id')
          .single();
        if (error) throw error;
        electionId = data.id;
      }

      // Upsert positions
      for (const pos of positions) {
        const payload = {
          election_id: electionId,
          name: pos.name.trim(),
          max_votes: Math.max(1, parseInt(pos.max_votes) || 1),
        };
        if (pos.id) {
          const { error } = await supabase.from('positions').update(payload).eq('id', pos.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('positions').insert(payload);
          if (error) throw error;
        }
      }

      router.back();
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : JSON.stringify(err));
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Typography color={colors.primary}>← Back</Typography>
        </TouchableOpacity>
        <Typography variant="h2">{isEditing ? 'Edit Election' : 'New Election'}</Typography>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Typography variant="label" style={styles.fieldLabel}>Title</Typography>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Elder & Deacon Election 2026"
          placeholderTextColor={colors.muted}
        />

        <Typography variant="label" style={[styles.fieldLabel, styles.fieldSpaced]}>
          Description
        </Typography>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Brief description for members..."
          placeholderTextColor={colors.muted}
          multiline
          numberOfLines={3}
        />

        <View style={styles.switchRow}>
          <Typography variant="label" style={styles.switchLabel}>Active (visible to members)</Typography>
          <Switch
            value={active}
            onValueChange={setActive}
            trackColor={{ true: colors.secondary, false: colors.border }}
            thumbColor={colors.surface}
          />
        </View>

        <View style={styles.sectionRow}>
          <Typography variant="label" style={styles.sectionTitle}>Positions</Typography>
          <TouchableOpacity onPress={addPosition}>
            <Typography variant="caption" color={colors.primary}>+ Add</Typography>
          </TouchableOpacity>
        </View>

        {positions.map((pos, index) => (
          <View key={index} style={styles.positionCard}>
            <View style={styles.positionRow}>
              <TextInput
                style={[styles.input, styles.positionNameInput]}
                value={pos.name}
                onChangeText={v => updatePosition(index, 'name', v)}
                placeholder="Position name (e.g. Elder)"
                placeholderTextColor={colors.muted}
              />
              <View style={styles.maxVotesWrapper}>
                <Typography variant="caption" color={colors.muted} style={styles.maxLabel}>
                  Max votes
                </Typography>
                <TextInput
                  style={[styles.input, styles.maxVotesInput]}
                  value={pos.max_votes}
                  onChangeText={v => updatePosition(index, 'max_votes', v.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            </View>
            {positions.length > 1 ? (
              <TouchableOpacity onPress={() => removePosition(index)} style={styles.removeBtn}>
                <Typography variant="caption" color={colors.error}>Remove</Typography>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}

        <Button
          title={isEditing ? 'Save Changes' : 'Create Election'}
          onPress={save}
          loading={saving}
          style={styles.saveButton}
        />
      </ScrollView>
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
  backButton: { width: 60 },
  scroll: { padding: 20, paddingBottom: 40 },
  fieldLabel: { marginBottom: 8, color: colors.primary },
  fieldSpaced: { marginTop: 16 },
  input: {
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: typography.body,
    color: colors.text,
  },
  inputMultiline: {
    height: 88,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  switchLabel: { color: colors.primary },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: { color: colors.primary },
  positionCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  positionRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  positionNameInput: { flex: 1 },
  maxVotesWrapper: { alignItems: 'center' },
  maxLabel: { marginBottom: 4 },
  maxVotesInput: { width: 60, textAlign: 'center' },
  removeBtn: { alignSelf: 'flex-end', marginTop: 8 },
  saveButton: { marginTop: 28 },
});
