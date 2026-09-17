import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { DashboardStats, CandidateRecord } from '../../types';
import { GlassCard } from '../../components/common/GlassCard';
import { CustomButton } from '../../components/common/CustomButton';

interface AdminDashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onNavigate }) => {
  const { admin, switchRole, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 2,
    activeLiveSessions: 1,
    completedTests: 1,
    disqualifiedAttempts: 0,
    averageScore: 164,
    botanySectionAAvg: 126,
    botanySectionBAvg: 38,
    proctorAlertsTotal: 0,
  });
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const fetchTelemetry = async () => {
    setRefreshing(true);
    const data = await apiService.getAdminCandidates();
    if (data && data.stats) {
      setStats(data.stats);
      setCandidates(data.candidates);
    }
    setRefreshing(false);
  };

  const handleClearRecords = () => {
    Alert.alert(
      'Reset All Candidate Records',
      'Are you sure you want to clear all candidate telemetry and reset the portal to 0 entries?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset All',
          style: 'destructive',
          onPress: async () => {
            await apiService.clearCandidates();
            fetchTelemetry();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchTelemetry} tintColor={COLORS.gold} />}
    >
      {/* Top Admin Status Banner */}
      <GlassCard variant="dark" style={styles.adminHero}>
        <View style={styles.adminTagRow}>
          <View style={styles.livePulseDot} />
          <Text style={styles.adminTag}>ANTIGRAVITY CBT TELEMETRY · LIVE</Text>
        </View>

        <Text style={styles.adminTitle}>Administration Central</Text>
        <Text style={styles.adminWelcome}>
          Logged in as: {admin ? admin.name : 'Super Administrator'} ({admin ? admin.email : 'admin@sarvottam.ac.in'})
        </Text>

        <View style={styles.quickActionRow}>
          <TouchableOpacity style={styles.quickPill} onPress={fetchTelemetry}>
            <Text style={styles.quickPillText}>🔄 Refresh Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickPill} onPress={() => onNavigate('candidates')}>
            <Text style={styles.quickPillText}>📋 Candidates ({stats.totalRegistrations})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickPill} onPress={() => onNavigate('proctor')}>
            <Text style={styles.quickPillText}>🛡️ AI Proctor</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Main Metric Cards Grid */}
      <Text style={styles.sectionHeading}>Real-Time Examination Telemetry</Text>

      <View style={styles.metricsGrid}>
        {/* Active Test Takers */}
        <View style={[styles.metricCard, { borderLeftColor: '#10b981' }]}>
          <View style={styles.metricCardHeader}>
            <Text style={styles.metricLabel}>Active Live Sessions</Text>
            <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
          </View>
          <Text style={[styles.metricValue, { color: '#10b981' }]}>{stats.activeLiveSessions}</Text>
          <Text style={styles.metricFoot}>Currently inside CBT room</Text>
        </View>

        {/* Total Registrations */}
        <View style={[styles.metricCard, { borderLeftColor: '#3b82f6' }]}>
          <View style={styles.metricCardHeader}>
            <Text style={styles.metricLabel}>Total Registrations</Text>
            <Text style={styles.metricIcon}>🎓</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#3b82f6' }]}>{stats.totalRegistrations}</Text>
          <Text style={styles.metricFoot}>Registered candidate pool</Text>
        </View>

        {/* Completed Tests */}
        <View style={[styles.metricCard, { borderLeftColor: COLORS.gold }]}>
          <View style={styles.metricCardHeader}>
            <Text style={styles.metricLabel}>Completed Attempts</Text>
            <Text style={styles.metricIcon}>✅</Text>
          </View>
          <Text style={[styles.metricValue, { color: COLORS.gold }]}>{stats.completedTests}</Text>
          <Text style={styles.metricFoot}>Scorecards evaluated</Text>
        </View>

        {/* Average Score */}
        <View style={[styles.metricCard, { borderLeftColor: '#8b5cf6' }]}>
          <View style={styles.metricCardHeader}>
            <Text style={styles.metricLabel}>Average Botany Score</Text>
            <Text style={styles.metricIcon}>📊</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#8b5cf6' }]}>{stats.averageScore} / 200</Text>
          <Text style={styles.metricFoot}>Sec A: {stats.botanySectionAAvg} | Sec B: {stats.botanySectionBAvg}</Text>
        </View>
      </View>

      {/* Live Candidates Preview */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>Recent Candidates Feed</Text>
        <TouchableOpacity onPress={() => onNavigate('candidates')}>
          <Text style={styles.viewAllText}>View All ({candidates.length}) →</Text>
        </TouchableOpacity>
      </View>

      {candidates.slice(0, 3).map((c) => {
        const isCompleted = c.status === 'COMPLETED';
        const isLive = c.status === 'LIVE_TESTING';

        return (
          <View key={c.id} style={styles.candidatePreviewCard}>
            <View style={styles.candHeader}>
              <View>
                <Text style={styles.candName}>{c.fullName}</Text>
                <Text style={styles.candRoll}>{c.rollNo}</Text>
              </View>
              <View style={[styles.statusBadge, isLive ? styles.badgeLive : styles.badgeCompleted]}>
                <Text style={[styles.statusBadgeText, isLive ? styles.badgeTextLive : styles.badgeTextCompleted]}>
                  {c.status}
                </Text>
              </View>
            </View>

            <View style={styles.candDetailsRow}>
              <Text style={styles.candDetailItem}>📧 {c.email}</Text>
              <Text style={styles.candDetailItem}>📱 {c.phone}</Text>
              <Text style={styles.candDetailItem}>🎂 DOB: {c.age}</Text>
            </View>

            {isCompleted && c.score !== null && (
              <View style={styles.scorePillRow}>
                <Text style={styles.scorePillText}>
                  Score: <Text style={{ fontWeight: '900', color: COLORS.gold }}>{c.score}/200</Text> ({c.correct} Correct, {c.wrong} Wrong)
                </Text>
              </View>
            )}
          </View>
        );
      })}

      {/* Admin Quick Tools */}
      <View style={styles.toolsWrap}>
        <Text style={styles.toolsHeading}>Administrative Actions</Text>

        <CustomButton
          title="Switch to Student Learning Mode 🎓"
          onPress={() => switchRole('student')}
          variant="secondary"
          style={{ marginBottom: 10 }}
        />

        <CustomButton
          title="Reset Candidate Records (Clear Data) ⚠️"
          onPress={handleClearRecords}
          variant="danger"
          style={{ marginBottom: 10 }}
        />

        <CustomButton
          title="Sign Out of Admin Portal"
          onPress={() => logout()}
          variant="outline"
        />
      </View>
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
  adminHero: {
    padding: 20,
    marginBottom: 20,
  },
  adminTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  adminTag: {
    color: '#10b981',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  adminTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  adminWelcome: {
    color: COLORS.textDarkMuted,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 14,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickPill: {
    backgroundColor: 'rgba(5, 11, 23, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickPillText: {
    color: COLORS.goldBright,
    fontSize: 11.5,
    fontWeight: '700',
  },
  sectionHeading: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0e1f3d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    maxWidth: '80%',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metricIcon: {
    fontSize: 14,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 6,
  },
  metricFoot: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewAllText: {
    color: COLORS.gold,
    fontSize: 12.5,
    fontWeight: '800',
  },
  candidatePreviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  candHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  candName: {
    color: COLORS.navy,
    fontSize: 14.5,
    fontWeight: '800',
  },
  candRoll: {
    color: '#64748b',
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeLive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  badgeCompleted: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgeTextLive: {
    color: '#10b981',
  },
  badgeTextCompleted: {
    color: '#3b82f6',
  },
  candDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  candDetailItem: {
    color: '#475569',
    fontSize: 11,
  },
  scorePillRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  scorePillText: {
    color: COLORS.navy,
    fontSize: 11.5,
    fontWeight: '600',
  },
  toolsWrap: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  toolsHeading: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
});
