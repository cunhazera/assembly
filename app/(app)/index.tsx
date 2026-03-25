import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/colors';
import { Election, Member } from '@/types';

export default function HomeScreen() {
  const { signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [elections, setElections] = useState<Election[]>([]);
  const [member, setMember] = useState<Member | null>(null);
  const [votedElectionIds, setVotedElectionIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: memberData }, { data: electionsData }, { data: votesData }] =
        await Promise.all([
          supabase.from('members').select('*').eq('id', user.id).single(),
          supabase.from('elections').select('*').eq('active', true).order('created_at', { ascending: false }),
          supabase.from('votes').select('election_id').eq('member_id', user.id),
        ]);

      setMember(memberData);
      setElections(electionsData ?? []);
      setVotedElectionIds(new Set((votesData ?? []).map((v: { election_id: string }) => v.election_id)));
      setLoading(false);
    }
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient colors={['#1B2A4A', '#243660']} style={styles.banner}>
          <View style={styles.bannerTop}>
            <Typography style={styles.cross}>✝</Typography>
            <TouchableOpacity onPress={signOut}>
              <Typography variant="caption" color="rgba(255,255,255,0.55)">
                Sign out
              </Typography>
            </TouchableOpacity>
          </View>
          <Typography variant="h1" color="#FFFFFF">
            Assembly
          </Typography>
          {member ? (
            <Typography variant="body" color="rgba(255,255,255,0.65)" style={styles.welcome}>
              Welcome, {member.name}
            </Typography>
          ) : null}
        </LinearGradient>

        <View style={styles.body}>
          {isAdmin ? (
            <Button
              title="Admin Panel"
              variant="outline"
              onPress={() => router.push('/(app)/admin')}
              style={styles.adminButton}
            />
          ) : null}

          {!loading && elections.length > 0 ? (
            <>
              <Typography variant="label" color={colors.muted} style={styles.sectionLabel}>
                Active Elections
              </Typography>
              {elections.map(election => {
                const hasVoted = votedElectionIds.has(election.id);
                return (
                  <View key={election.id} style={styles.electionCard}>
                    <Typography variant="label" color={colors.secondary} style={styles.activeLabel}>
                      Active Election
                    </Typography>
                    <Typography variant="h2" style={styles.electionTitle}>
                      {election.title}
                    </Typography>
                    {election.description ? (
                      <Typography variant="body" color={colors.muted} style={styles.electionDesc}>
                        {election.description}
                      </Typography>
                    ) : null}
                    <View style={styles.cardFooter}>
                      {hasVoted ? (
                        <View style={styles.votedBadge}>
                          <Typography style={styles.votedIcon}>✓</Typography>
                          <View>
                            <Typography variant="h3">Vote Recorded</Typography>
                            <Typography variant="caption">Thank you for participating.</Typography>
                          </View>
                        </View>
                      ) : (
                        <Button
                          title="Cast Your Vote"
                          onPress={() =>
                            router.push({
                              pathname: '/(app)/ballot',
                              params: { election_id: election.id },
                            })
                          }
                        />
                      )}
                    </View>
                  </View>
                );
              })}
            </>
          ) : !loading ? (
            <View style={styles.noElection}>
              <Typography variant="h3" align="center" color={colors.muted}>
                No active election at this time.
              </Typography>
              <Typography
                variant="body"
                align="center"
                color={colors.muted}
                style={styles.noElectionSub}
              >
                Check back when your church announces the next election.
              </Typography>
            </View>
          ) : null}

          <View style={styles.verse}>
            <Typography variant="caption" align="center" color={colors.muted}>
              "The saying is trustworthy: If anyone aspires to the office of overseer, he desires a
              noble task." — 1 Timothy 3:1
            </Typography>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  banner: {
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cross: {
    fontSize: 20,
    color: colors.secondary,
  },
  welcome: {
    marginTop: 6,
  },
  body: {
    flex: 1,
    padding: 24,
    marginTop: -16,
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  adminButton: {
    marginBottom: 20,
  },
  sectionLabel: {
    marginBottom: 12,
  },
  electionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  activeLabel: {
    marginBottom: 6,
  },
  electionTitle: {
    marginBottom: 8,
  },
  electionDesc: {
    marginBottom: 4,
  },
  cardFooter: {
    marginTop: 16,
  },
  votedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 16,
  },
  votedIcon: {
    fontSize: 24,
    color: colors.success,
  },
  noElection: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  noElectionSub: {
    marginTop: 8,
  },
  verse: {
    marginTop: 'auto',
    paddingTop: 32,
    paddingBottom: 8,
  },
});
