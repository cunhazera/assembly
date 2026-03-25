import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useVote } from '@/context/VoteContext';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { CandidateCard } from '@/components/CandidateCard';
import { colors } from '@/constants/colors';
import { PositionWithCandidates } from '@/types';

export default function BallotScreen() {
  const { election_id } = useLocalSearchParams<{ election_id: string }>();
  const { selections, toggle } = useVote();
  const [positions, setPositions] = useState<PositionWithCandidates[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!election_id) return;

      const { data } = await supabase
        .from('positions')
        .select('*, candidates(*)')
        .eq('election_id', election_id)
        .order('name');

      setPositions(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const allPositionsFilled = positions.length > 0 &&
    positions.every(p => (selections[p.id]?.length ?? 0) >= 1);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Typography color={colors.primary}>← Back</Typography>
        </TouchableOpacity>
        <Typography variant="h2">Ballot</Typography>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Typography variant="body" color={colors.muted} style={styles.instruction}>
            Select your candidates for each office. Tap a name to select or deselect.
          </Typography>

          {positions.map(position => {
            const selected = selections[position.id] ?? [];
            const atMax = selected.length >= position.max_votes;

            return (
              <View key={position.id} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Typography variant="h3">{position.name}</Typography>
                  <View style={[styles.badge, atMax && styles.badgeFull]}>
                    <Typography
                      variant="caption"
                      color={atMax ? colors.secondary : colors.muted}
                    >
                      {selected.length}/{position.max_votes}
                    </Typography>
                  </View>
                </View>
                <Typography variant="caption" style={styles.maxNote}>
                  Select up to {position.max_votes} candidate
                  {position.max_votes > 1 ? 's' : ''}
                </Typography>

                {position.candidates.length === 0 ? (
                  <View style={styles.noCandidates}>
                    <Typography variant="caption" color={colors.muted} align="center">
                      No candidates have been added for this position yet.
                    </Typography>
                  </View>
                ) : (
                  position.candidates.map(candidate => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      selected={selected.includes(candidate.id)}
                      onToggle={() => toggle(position.id, candidate.id, position.max_votes)}
                      disabled={atMax}
                    />
                  ))
                )}
              </View>
            );
          })}

          <Button
            title="Review Selections"
            onPress={() =>
              router.push({
                pathname: '/(app)/confirmation',
                params: { election_id },
              })
            }
            disabled={!allPositionsFilled}
            style={styles.reviewButton}
          />
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
  backButton: { width: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },
  instruction: {
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: colors.border,
  },
  badgeFull: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  maxNote: {
    marginBottom: 12,
  },
  noCandidates: {
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewButton: {
    marginTop: 8,
  },
});
