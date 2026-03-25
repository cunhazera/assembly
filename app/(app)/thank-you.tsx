import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/colors';

export default function ThankYouScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <LinearGradient colors={['#1B2A4A', '#243660']} style={styles.gradient}>
        <Typography style={styles.cross}>✝</Typography>
        <View style={styles.checkCircle}>
          <Typography style={styles.checkMark}>✓</Typography>
        </View>
        <Typography variant="h1" color="#FFFFFF" align="center" style={styles.title}>
          Vote Recorded
        </Typography>
        <Typography
          variant="body"
          color="rgba(255,255,255,0.7)"
          align="center"
          style={styles.subtitle}
        >
          Thank you for participating in this election. Your vote has been securely recorded.
        </Typography>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.verse}>
          <Typography
            variant="label"
            color={colors.secondary}
            align="center"
            style={styles.verseRef}
          >
            1 Timothy 3:1
          </Typography>
          <Typography
            variant="body"
            color={colors.muted}
            align="center"
            style={styles.verseText}
          >
            "The saying is trustworthy: If anyone aspires to the office of overseer, he desires a
            noble task."
          </Typography>
        </View>

        <Button
          title="Return to Home"
          onPress={() => router.replace('/(app)')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingVertical: 48,
  },
  cross: {
    fontSize: 32,
    color: colors.secondary,
    marginBottom: 28,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(201, 168, 76, 0.15)',
    borderWidth: 2,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  checkMark: {
    fontSize: 30,
    color: colors.secondary,
  },
  title: {
    marginBottom: 14,
  },
  subtitle: {
    lineHeight: 24,
  },
  body: {
    padding: 28,
    paddingBottom: 20,
  },
  verse: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  verseRef: {
    marginBottom: 10,
  },
  verseText: {
    fontStyle: 'italic',
    lineHeight: 22,
  },
});
