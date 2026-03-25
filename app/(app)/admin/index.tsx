import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/colors';
import { Election } from '@/types';

export default function AdminIndex() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('elections')
      .select('*')
      .order('created_at', { ascending: false });
    setElections(data ?? []);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleActive = async (election: Election) => {
    const { error } = await supabase
      .from('elections')
      .update({ active: !election.active })
      .eq('id', election.id);
    if (error) Alert.alert('Error', error.message);
    else load();
  };

  const deleteElection = (election: Election) => {
    Alert.alert(
      'Delete Election',
      `Delete "${election.title}"? This will remove all candidates and votes.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('elections').delete().eq('id', election.id);
            if (error) Alert.alert('Error', error.message);
            else load();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Typography color={colors.primary}>← Back</Typography>
        </TouchableOpacity>
        <Typography variant="h2">Admin Panel</Typography>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Button
            title="+ New Election"
            onPress={() => router.push('/(app)/admin/election-form')}
            style={styles.newButton}
          />

          <Typography variant="label" color={colors.muted} style={styles.sectionLabel}>
            Elections
          </Typography>

          {elections.length === 0 ? (
            <Typography variant="body" color={colors.muted} align="center" style={styles.empty}>
              No elections yet.
            </Typography>
          ) : (
            elections.map(election => (
              <View key={election.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardInfo}>
                    <View style={styles.titleRow}>
                      <Typography variant="h3">{election.title}</Typography>
                      {election.active ? (
                        <View style={styles.activePill}>
                          <Typography style={styles.activePillText}>Active</Typography>
                        </View>
                      ) : null}
                    </View>
                    {election.description ? (
                      <Typography variant="caption" numberOfLines={2} style={styles.desc}>
                        {election.description}
                      </Typography>
                    ) : null}
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/admin/election-form',
                        params: { id: election.id },
                      })
                    }
                  >
                    <Typography variant="caption" color={colors.primary}>Edit</Typography>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/admin/candidates',
                        params: { election_id: election.id, election_title: election.title },
                      })
                    }
                  >
                    <Typography variant="caption" color={colors.primary}>Candidates</Typography>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => toggleActive(election)}
                  >
                    <Typography variant="caption" color={election.active ? colors.muted : colors.success}>
                      {election.active ? 'Deactivate' : 'Activate'}
                    </Typography>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => deleteElection(election)}
                  >
                    <Typography variant="caption" color={colors.error}>Delete</Typography>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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
  newButton: { marginBottom: 24 },
  sectionLabel: { marginBottom: 12 },
  empty: { paddingVertical: 32 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    padding: 16,
  },
  cardTop: { marginBottom: 12 },
  cardInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  activePill: {
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activePillText: { fontSize: 11, color: colors.success, fontWeight: '600' },
  desc: { marginTop: 4 },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    gap: 4,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
});
