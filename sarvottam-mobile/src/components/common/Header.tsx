import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const { role, switchRole, student, admin } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.leftRow}>
          {showBack && onBack ? (
            <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkLetter}>S</Text>
            </View>
          )}

          <View style={styles.titleWrap}>
            <Text style={styles.brandTitle} numberOfLines={1}>
              {title || 'SARVOTTAM'}
            </Text>
            <Text style={styles.brandSubtitle} numberOfLines={1}>
              {subtitle || (role === 'admin' ? 'ADMINISTRATION ENGINE' : 'PREMIER COACHING & CBT')}
            </Text>
          </View>
        </View>

        <View style={styles.rightRow}>
          {rightAction ? (
            rightAction
          ) : (
            <TouchableOpacity
              style={[styles.rolePill, role === 'admin' ? styles.rolePillAdmin : styles.rolePillStudent]}
              onPress={() => switchRole(role === 'admin' ? 'student' : 'admin')}
              activeOpacity={0.8}
            >
              <View style={[styles.roleDot, role === 'admin' ? styles.roleDotAdmin : styles.roleDotStudent]} />
              <Text style={styles.roleText}>
                {role === 'admin' ? 'Admin Mode' : 'Student Mode'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.navyDeep,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.navy,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.goldBorder,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: COLORS.cream,
    fontSize: 24,
    fontWeight: '600',
    marginTop: -2,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: COLORS.goldBright,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  brandMarkLetter: {
    color: COLORS.navyDeep,
    fontWeight: '900',
    fontSize: 19,
  },
  titleWrap: {
    flex: 1,
  },
  brandTitle: {
    color: COLORS.cream,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    color: COLORS.goldBright,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    gap: 6,
  },
  rolePillStudent: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderWidth: 1,
  },
  rolePillAdmin: {
    backgroundColor: 'rgba(224, 172, 61, 0.15)',
    borderColor: COLORS.goldBright,
    borderWidth: 1,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  roleDotStudent: {
    backgroundColor: '#22c55e',
  },
  roleDotAdmin: {
    backgroundColor: COLORS.goldBright,
  },
  roleText: {
    color: COLORS.cream,
    fontSize: 11,
    fontWeight: '700',
  },
});
