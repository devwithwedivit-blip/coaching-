import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useExam } from '../../context/ExamContext';
import { CustomButton } from '../../components/common/CustomButton';
import { GlassCard } from '../../components/common/GlassCard';

interface StudentProfileScreenProps {
  onNavigate: (screen: string) => void;
}

export const StudentProfileScreen: React.FC<StudentProfileScreenProps> = ({ onNavigate }) => {
  const { student, logout, switchRole } = useAuth();
  const { latestResult } = useExam();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your student session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <GlassCard variant="dark" style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {student ? student.fullName.slice(0, 1).toUpperCase() : 'S'}
          </Text>
        </View>

        <Text style={styles.nameText}>{student ? student.fullName : 'Student Candidate'}</Text>
        <View style={styles.rollPill}>
          <Text style={styles.rollText}>{student ? student.rollNo : 'NEET2024-CANDIDATE'}</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Target Exam</Text>
            <Text style={styles.infoVal}>{student ? student.targetExam : 'NEET (UG)'}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Candidate DOB</Text>
            <Text style={styles.infoVal}>{student ? student.age : '180506'}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Mobile Number</Text>
            <Text style={styles.infoVal}>+91 {student ? student.phone : '9876543210'}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Email ID</Text>
            <Text style={styles.infoVal} numberOfLines={1}>{student ? student.email : 'student@gmail.com'}</Text>
          </View>
        </View>
      </GlassCard>

      {/* Latest Exam Telemetry Summary */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionHeading}>CBT Exam Performance</Text>
        {latestResult ? (
          <View style={styles.resultCard}>
            <View style={styles.resTop}>
              <Text style={styles.resTitle}>Latest: {latestResult.examTitle}</Text>
              <Text style={styles.resDate}>
                {new Date(latestResult.completedAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreBig}>{latestResult.score}</Text>
                <Text style={styles.scoreSub}>Score / {latestResult.maxScore}</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreBig}>{latestResult.accuracy}%</Text>
                <Text style={styles.scoreSub}>Accuracy</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreBig}>#{latestResult.airRankEstimated}</Text>
                <Text style={styles.scoreSub}>AIR Rank</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewScorecardBtn}
              onPress={() => onNavigate('cbt_result')}
            >
              <Text style={styles.viewScorecardText}>View Complete Scorecard & Solutions →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noTestCard}>
            <Text style={styles.noTestText}>No test completed yet.</Text>
            <TouchableOpacity onPress={() => onNavigate('cbt_list')}>
              <Text style={styles.takeTestLink}>Launch NEET Mock CBT Test →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Quick Menu Options */}
      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onNavigate('student_help')}
        >
          <Text style={styles.menuIcon}>🎓</Text>
          <Text style={styles.menuLabel}>Student Academic Help Centre</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onNavigate('customer_help')}
        >
          <Text style={styles.menuIcon}>🎧</Text>
          <Text style={styles.menuLabel}>24/7 Helpline & Customer Support</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => switchRole('admin')}
        >
          <Text style={styles.menuIcon}>🛡️</Text>
          <Text style={styles.menuLabel}>Switch to SNTRA Admin Mode</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <CustomButton
        title="Sign Out of Session"
        onPress={handleLogout}
        variant="danger"
        style={{ marginTop: 20 }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    padding: 22,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.goldBright,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10,
  },
  avatarText: {
    color: COLORS.navyDeep,
    fontSize: 28,
    fontWeight: '900',
  },
  nameText: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '900',
  },
  rollPill: {
    backgroundColor: 'rgba(201, 152, 42, 0.15)',
    borderColor: COLORS.goldBorder,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 100,
    marginTop: 6,
    marginBottom: 16,
  },
  rollText: {
    color: COLORS.goldBright,
    fontSize: 11,
    fontWeight: '800',
  },
  infoGrid: {
    width: '100%',
    backgroundColor: 'rgba(5, 11, 23, 0.6)',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: COLORS.textDarkMuted,
    fontSize: 12,
  },
  infoVal: {
    color: COLORS.cream,
    fontSize: 12.5,
    fontWeight: '700',
    maxWidth: '60%',
  },
  sectionWrap: {
    marginBottom: 20,
  },
  sectionHeading: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0e1f3d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  resTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resTitle: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  resDate: {
    color: '#94a3b8',
    fontSize: 11,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreBig: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.navy,
  },
  scoreSub: {
    color: '#64748b',
    fontSize: 10.5,
    marginTop: 2,
  },
  viewScorecardBtn: {
    marginTop: 12,
    alignItems: 'center',
  },
  viewScorecardText: {
    color: COLORS.gold,
    fontSize: 12.5,
    fontWeight: '800',
  },
  noTestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noTestText: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 6,
  },
  takeTestLink: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '800',
  },
  menuSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuLabel: {
    color: COLORS.navy,
    fontSize: 13.5,
    fontWeight: '700',
    flex: 1,
  },
  menuArrow: {
    fontSize: 20,
    color: '#94a3b8',
  },
});
