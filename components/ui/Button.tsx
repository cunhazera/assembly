import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  variant = 'primary',
  loading,
  style,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], (disabled || loading) && styles.disabled, style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'}
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text` as const]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    fontSize: 15,
    fontFamily: typography.bodySemiBold,
    letterSpacing: 0.3,
  },
  primaryText: { color: '#FFFFFF' },
  secondaryText: { color: '#FFFFFF' },
  outlineText: { color: colors.primary },
  ghostText: { color: colors.primary },
});
