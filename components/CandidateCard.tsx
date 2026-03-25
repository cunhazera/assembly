import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Candidate } from '@/types';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

interface CandidateCardProps {
  candidate: Candidate;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function CandidateCard({ candidate, selected, onToggle, disabled }: CandidateCardProps) {
  const initials = candidate.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <TouchableOpacity
      onPress={onToggle}
      disabled={disabled && !selected}
      activeOpacity={0.7}
      style={[styles.card, selected && styles.selected, disabled && !selected && styles.dimmed]}
    >
      <View style={styles.content}>
        <View style={[styles.avatar, selected && styles.avatarSelected]}>
          <Typography style={[styles.initials, selected && styles.initialsSelected]}>
            {initials}
          </Typography>
        </View>

        <View style={styles.info}>
          <Typography variant="h3">{candidate.name}</Typography>
          {candidate.bio ? (
            <Typography variant="caption" style={styles.bio} numberOfLines={2}>
              {candidate.bio}
            </Typography>
          ) : null}
        </View>

        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected ? (
            <Typography style={styles.checkmark}>✓</Typography>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 10,
    padding: 14,
  },
  selected: {
    borderColor: colors.secondary,
    backgroundColor: '#FFFBF0',
  },
  dimmed: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF1F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarSelected: {
    backgroundColor: '#F5EDD4',
  },
  initials: {
    fontFamily: typography.heading,
    fontSize: 16,
    color: colors.primary,
  },
  initialsSelected: {
    color: colors.secondary,
  },
  info: {
    flex: 1,
  },
  bio: {
    marginTop: 3,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkboxSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  checkmark: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: typography.bodySemiBold,
  },
});
