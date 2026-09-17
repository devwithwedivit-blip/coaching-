import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'light' | 'dark' | 'gold';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'light',
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'dark':
        return styles.darkCard;
      case 'gold':
        return styles.goldCard;
      default:
        return styles.lightCard;
    }
  };

  return (
    <View style={[styles.base, getVariantStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
  },
  lightCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0e1f3d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: 'rgba(14, 31, 61, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(201, 152, 42, 0.3)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  goldCard: {
    backgroundColor: 'rgba(201, 152, 42, 0.08)',
    borderWidth: 1.5,
    borderColor: COLORS.goldBright,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
});
