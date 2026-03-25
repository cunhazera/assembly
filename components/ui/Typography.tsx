import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: string;
  align?: TextStyle['textAlign'];
  style?: TextStyle;
  numberOfLines?: number;
}

export function Typography({
  children,
  variant = 'body',
  color,
  align,
  style,
  numberOfLines,
}: TypographyProps) {
  return (
    <Text
      style={[
        styles[variant],
        color ? { color } : undefined,
        align ? { textAlign: align } : undefined,
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontFamily: typography.heading,
    fontSize: 30,
    color: colors.text,
    lineHeight: 38,
  },
  h2: {
    fontFamily: typography.heading,
    fontSize: 24,
    color: colors.text,
    lineHeight: 32,
  },
  h3: {
    fontFamily: typography.headingRegular,
    fontSize: 18,
    color: colors.text,
    lineHeight: 26,
  },
  body: {
    fontFamily: typography.body,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  caption: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  label: {
    fontFamily: typography.bodySemiBold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
