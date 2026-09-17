import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { COLORS } from '../../constants/theme';
import { CustomButton } from '../../components/common/CustomButton';
import { GlassCard } from '../../components/common/GlassCard';

interface RoleSelectScreenProps {
  onSelectStudent: () => void;
  onSelectAdmin: () => void;
}

export const RoleSelectScreen: React.FC<RoleSelectScreenProps> = ({
  onSelectStudent,
  onSelectAdmin,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Brand Logo & Header */}
        <View style={styles.logoWrap}>
          <View style={styles.brandMark}>
            <Text style={styles.brandLetter}>S</Text>
          </View>
          <Text style={styles.brandTitle}>SARVOTTAM INSTITUTES</Text>
          <Text style={styles.brandSubtitle}>SNTRA Online Examination & Learning Engine</Text>
        </View>

        {/* Student Portal Card */}
        <GlassCard variant="dark" style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🎓</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.cardTitle}>Student Learning Portal</Text>
              <Text style={styles.cardBadge}>CBT Mock Tests & Courses</Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>
            Access 7 flagship verticals (IIT-JEE, NEET, Defense, UPSC, Boards, Law, CA), live video classes, study notes (PDFs), doubt clearing, and the full CBT Exam room.
          </Text>
          <CustomButton
            title="Enter as Student →"
            onPress={onSelectStudent}
            variant="primary"
            style={styles.actionBtn}
          />
        </GlassCard>

        {/* Admin Portal Card */}
        <GlassCard variant="dark" style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, styles.adminIconCircle]}>
              <Text style={styles.iconText}>🛡️</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.cardTitle}>Administration Portal</Text>
              <Text style={[styles.cardBadge, styles.adminBadge]}>SNTRA Admin · 2FA Security</Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>
            Monitor live CBT telemetry, active test candidates, AI proctoring violations, section averages, and manage official exam records.
          </Text>
          <CustomButton
            title="Enter Admin Portal 🔒"
            onPress={onSelectAdmin}
            variant="outline"
            style={styles.actionBtn}
          />
        </GlassCard>

        {/* Footer Support Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Powered by SNTRA Examination Engine · 24/7 Helpline: 7310810875
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.navyDeep,
  },
  container: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandMark: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: COLORS.goldBright,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 16,
  },
  brandLetter: {
    color: COLORS.navyDeep,
    fontSize: 36,
    fontWeight: '900',
  },
  brandTitle: {
    color: COLORS.cream,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    color: COLORS.goldBright,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  card: {
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminIconCircle: {
    backgroundColor: 'rgba(201, 152, 42, 0.15)',
    borderColor: COLORS.goldBright,
  },
  iconText: {
    fontSize: 22,
  },
  headerText: {
    flex: 1,
  },
  cardTitle: {
    color: COLORS.cream,
    fontSize: 17,
    fontWeight: '800',
  },
  cardBadge: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  adminBadge: {
    color: COLORS.goldBright,
  },
  cardDesc: {
    color: COLORS.textDarkMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
  },
  actionBtn: {
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    color: COLORS.textDarkMuted,
    fontSize: 11,
    textAlign: 'center',
  },
});
