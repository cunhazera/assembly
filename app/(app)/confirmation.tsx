import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useVote } from '@/context/VoteContext';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/colors';

export default function ConfirmationScreen() {
  const { election_id } = useLocalSearchParams<{ election_id: string }>();
  const { selections, clear } = useVote();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [candidateNames, setCandidateNames] = useState<Record<string, string>>({});
  const [positionNames, setPositionNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const allCandidateIds = Object.values(selections).flat();
    const allPositionIds = Object.keys(selections);
    if (allCandidateIds.length === 0) return;

    Promise.all([
      supabase.from('candidates').select('id, name').in('id', allCandidateIds),
      supabase.from('positions').select('id, name').in('id', allPositionIds),
    ]).then(([{ data: candidates }, { data: positions }]) => {
      const cNames: Record<string, string> = {};
      candidates?.forEach(c => { cNames[c.id] = c.name; });
      setCandidateNames(cNames);

      const pNames: Record<string, string> = {};
      positions?.forEach(p => { pNames[p.id] = p.name; });
      setPositionNames(pNames);
    });
  }, []);

  const handleSubmit = () => {
    setErrorMsg(null);
    submitVote();
  };

  const submitVote = async () => {
    setSubmitting(true);
    try {
      console.log('[vote] getting user...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('[vote] user:', user?.id, 'authError:', authError);
      if (!user) throw new Error('Not authenticated');

      if (!election_id) throw new Error('No election selected');

      const votes = Object.entries(selections).flatMap(([, candidateIds]) =>
        candidateIds.map(candidateId => ({
          member_id: user.id,
          candidate_id: candidateId,
          election_id,
        }))
      );
      console.log('[vote] inserting votes:', votes);

      const { error: voteError } = await supabase.from('votes').insert(votes);
      console.log('[vote] voteError:', voteError);
      if (voteError) throw new Error(voteError.message);

      clear();
      console.log('[vote] navigating to thank-you...');
      router.replace('/(app)/thank-you');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error('[vote] caught error:', msg);
      setErrorMsg(msg);
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Typography color={colors.primary}>← Back</Typography>
        </TouchableOpacity>
        <Typography variant="h2">Review</Typography>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Typography variant="body" color={colors.muted} style={styles.intro}>
          Please review your selections carefully before submitting.
        </Typography>

        {Object.entries(selections).map(([positionId, candidateIds]) => (
          <View key={positionId} style={styles.section}>
            <Typography variant="label" color={colors.primary} style={styles.positionLabel}>
              {positionNames[positionId] ?? '—'}
            </Typography>
            {candidateIds.map(id => (
              <View key={id} style={styles.candidateRow}>
                <Typography style={styles.bullet}>✝</Typography>
                <Typography variant="h3">{candidateNames[id] ?? '...'}</Typography>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.notice}>
          <Typography variant="caption" align="center" color={colors.muted}>
            Your vote is confidential and cannot be changed once submitted.
          </Typography>
        </View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Typography variant="caption" color={colors.error}>{errorMsg}</Typography>
          </View>
        ) : null}

        <Button
          title="Submit Vote"
          onPress={handleSubmit}
          loading={submitting}
          variant="secondary"
          style={styles.submitButton}
        />
        <Button
          title="Edit Selections"
          onPress={() => router.back()}
          variant="outline"
          disabled={submitting}
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
  scroll: { padding: 24, paddingBottom: 40 },
  intro: { marginBottom: 24 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 14,
  },
  positionLabel: {
    marginBottom: 10,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bullet: {
    fontSize: 10,
    color: colors.secondary,
  },
  notice: {
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  submitButton: { marginBottom: 10 },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 12,
    marginBottom: 12,
  },
});
