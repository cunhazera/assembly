import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const error = await signIn(email.trim().toLowerCase(), password);
    setLoading(false);
    if (error) {
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
    } else {
      router.replace('/(app)');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <LinearGradient colors={['#1B2A4A', '#243660']} style={styles.header}>
          <Typography style={styles.cross}>✝</Typography>
          <Typography variant="h1" color="#FFFFFF" align="center">
            Assembly
          </Typography>
          <Typography
            variant="body"
            color="rgba(255,255,255,0.6)"
            align="center"
            style={styles.subtitle}
          >
            Church Elder & Deacon Election
          </Typography>
        </LinearGradient>

        <View style={styles.card}>
          <Typography variant="h2" style={styles.cardTitle}>
            Member Login
          </Typography>
          <Typography variant="body" color={colors.muted} style={styles.cardSubtitle}>
            Sign in with your registered church email
          </Typography>

          <Typography variant="label" style={styles.fieldLabel}>
            Email
          </Typography>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Typography variant="label" style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
            Password
          </Typography>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.muted}
            secureTextEntry
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />

          <Typography variant="caption" align="center" style={styles.footer}>
            Having trouble? Contact your church secretary.
          </Typography>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  header: {
    paddingTop: 88,
    paddingBottom: 52,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  cross: {
    fontSize: 36,
    color: colors.secondary,
    marginBottom: 14,
  },
  subtitle: {
    marginTop: 8,
    letterSpacing: 0.3,
  },
  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    padding: 28,
    paddingTop: 36,
  },
  cardTitle: {
    marginBottom: 6,
  },
  cardSubtitle: {
    marginBottom: 28,
  },
  fieldLabel: {
    marginBottom: 8,
    color: colors.primary,
  },
  fieldLabelSpaced: {
    marginTop: 18,
  },
  input: {
    height: 50,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: typography.body,
    color: colors.text,
  },
  button: {
    marginTop: 28,
  },
  footer: {
    marginTop: 20,
  },
});
