import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { GlassCard } from '../../components/common/GlassCard';

interface ProctorTelemetryScreenProps {
  onBack: () => void;
}

export const ProctorTelemetryScreen: React.FC<ProctorTelemetryScreenProps> = ({ onBack }) => {
  const proctorLogs = [
    {
      id: 'proc-1',
      type: 'TAB_BLUR',
      severity: 'HIGH',
      candidateName: 'Candidate Roll: NEET2024-180506-4821',
      event: 'Window Focus Lost / Tab Switch Attempt',
      timestamp: 'Today at 2:34:10 PM',
      actionTaken: 'Warning Modal Displayed (Count: 1/3)',
    },
    {
      id: 'proc-2',
      type: 'FULLSCREEN_EXIT',
      severity: 'CRITICAL',
      candidateName: 'Candidate Roll: NEET2024-271102-7891',
      event: 'Fullscreen Exit Event Detected',
      timestamp: 'Today at 2:18:04 PM',
      actionTaken: 'Candidate returned to fullscreen within 5s',
    },
    {
      id: 'proc-3',
      type: 'NETWORK_RECONNECT',
      severity: 'INFO',
      candidateName: 'Candidate Roll: NEET2024-090805-3312',
      event: 'Offline Cache Resynchronization Success',
      timestamp: 'Today at 1:52:45 PM',
      actionTaken: 'Telemetry packets synced successfully',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>‹ Back to Admin Dashboard</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>AI PROCTORING LOGS</Text>
        </View>
        <Text style={styles.title}>Live Proctoring Telemetry</Text>
        <Text style={styles.subtitle}>
          Real-time security auditing tracking tab switching, window blurs, full-screen violations, and network reconnections.
        </Text>
      </View>

      <GlassCard variant="dark" style={styles.statsHero}>
        <View style={styles.statCol}>
          <Text style={styles.statNum}>0</Text>
          <Text style={styles.statLbl}>Disqualified</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={[styles.statNum, { color: '#f59e0b' }]}>2</Text>
          <Text style={styles.statLbl}>Warnings Issued</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={[styles.statNum, { color: '#10b981' }]}>100%</Text>
          <Text style={styles.statLbl}>Integrity Rate</Text>
        </View>
      </GlassCard>

      <Text style={styles.feedHeading}>Real-Time Security Event Stream</Text>

      {proctorLogs.map((log) => {
        const isCritical = log.severity === 'CRITICAL';
        const isHigh = log.severity === 'HIGH';

        let badgeBg = 'rgba(59, 130, 246, 0.12)';
        let badgeColor = '#3b82f6';
        if (isCritical) {
          badgeBg = 'rgba(239, 68, 68, 0.15)';
          badgeColor = '#ef4444';
        } else if (isHigh) {
          badgeBg = 'rgba(245, 158, 11, 0.15)';
          badgeColor = '#f59e0b';
        }

        return (
          <View key={log.id} style={styles.logCard}>
            <View style={styles.logTop}>
              <View style={[styles.sevBadge, { backgroundColor: badgeBg }]}>
                <Text style={[styles.sevText, { color: badgeColor }]}>{log.severity} ALERT</Text>
              </View>
              <Text style={styles.logTime}>{log.timestamp}</Text>
            </View>

            <Text style={styles.logEvent}>{log.event}</Text>
            <Text style={styles.logCandidate}>{log.candidateName}</Text>
            <Text style={styles.logAction}>System Action: {log.actionTaken}</Text>
          </View>
        );
      })}
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
  backBtn: {
    marginBottom: 8,
  },
  backText: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '700',
  },
  header: {
    marginBottom: 16,
  },
  badgeWrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    marginBottom: 6,
  },
  badgeText: {
    color: '#f59e0b',
    fontSize: 10.5,
    fontWeight: '900',
  },
  title: {
    color: COLORS.navy,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  statsHero: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 18,
    marginBottom: 20,
  },
  statCol: {
    alignItems: 'center',
  },
  statNum: {
    color: COLORS.goldBright,
    fontSize: 22,
    fontWeight: '900',
  },
  statLbl: {
    color: COLORS.textDarkMuted,
    fontSize: 11,
    marginTop: 2,
  },
  feedHeading: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  logCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sevBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sevText: {
    fontSize: 10,
    fontWeight: '900',
  },
  logTime: {
    color: '#94a3b8',
    fontSize: 11,
  },
  logEvent: {
    color: COLORS.navy,
    fontSize: 13.5,
    fontWeight: '800',
  },
  logCandidate: {
    color: '#475569',
    fontSize: 12,
    marginTop: 2,
  },
  logAction: {
    color: COLORS.gold,
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 6,
  },
});
