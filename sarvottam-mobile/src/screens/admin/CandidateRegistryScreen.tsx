import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { apiService } from '../../services/api';
import { CandidateRecord } from '../../types';
import { CustomButton } from '../../components/common/CustomButton';

interface CandidateRegistryScreenProps {
  onBack: () => void;
}

export const CandidateRegistryScreen: React.FC<CandidateRegistryScreenProps> = ({ onBack }) => {
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE_TESTING' | 'COMPLETED' | 'DISQUALIFIED_ABRUPT'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    const data = await apiService.getAdminCandidates();
    if (data && data.candidates) {
      setCandidates(data.candidates);
    }
    setRefreshing(false);
  };

  const handleClear = () => {
    Alert.alert(
      'Reset All Candidate Records',
      'This will erase all candidates and reset the examination registry to 0 entries.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase All',
          style: 'destructive',
          onPress: async () => {
            await apiService.clearCandidates();
            loadData();
          },
        },
      ]
    );
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.rollNo.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={COLORS.gold} />}
    >
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>‹ Back to Admin Dashboard</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>SNTRA CANDIDATE DATABASE</Text>
        </View>
        <Text style={styles.title}>CBT Candidate Registry</Text>
        <Text style={styles.subtitle}>
          Official repository of test registrations, active examination sessions, and scored attempts.
        </Text>
      </View>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search candidate by name, roll no, phone, email..."
        placeholderTextColor="#94a3b8"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Status Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {[
          { key: 'ALL', label: `All (${candidates.length})` },
          { key: 'LIVE_TESTING', label: 'Live In Test' },
          { key: 'COMPLETED', label: 'Completed' },
          { key: 'DISQUALIFIED_ABRUPT', label: 'Disqualified' },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, statusFilter === f.key && styles.filterChipActive]}
            onPress={() => setStatusFilter(f.key as any)}
          >
            <Text style={[styles.filterChipText, statusFilter === f.key && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Candidate Records List */}
      {filteredCandidates.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No matching candidate records found.</Text>
        </View>
      ) : (
        filteredCandidates.map((c) => {
          const isLive = c.status === 'LIVE_TESTING';
          const isCompleted = c.status === 'COMPLETED';

          let statusBg = 'rgba(59, 130, 246, 0.12)';
          let statusText = '#3b82f6';
          if (isLive) {
            statusBg = 'rgba(16, 185, 129, 0.12)';
            statusText = '#10b981';
          } else if (c.status === 'DISQUALIFIED_ABRUPT') {
            statusBg = 'rgba(239, 68, 68, 0.12)';
            statusText = '#ef4444';
          }

          return (
            <View key={c.id} style={styles.candidateCard}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.candidateName}>{c.fullName}</Text>
                  <Text style={styles.rollNoText}>Roll: {c.rollNo}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
                  <Text style={[styles.statusText, { color: statusText }]}>{c.status}</Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <Text style={styles.infoItem}>📧 {c.email}</Text>
                <Text style={styles.infoItem}>📱 +91 {c.phone}</Text>
                <Text style={styles.infoItem}>🎂 DOB: {c.age}</Text>
                <Text style={styles.infoItem}>🎯 {c.stream}</Text>
              </View>

              {isCompleted && c.score !== null && (
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreNum}>Score: {c.score} / {c.maxScore}</Text>
                  <Text style={styles.scoreBreakdown}>
                    ✓ {c.correct} Correct · ✗ {c.wrong} Wrong · ⚪ {c.unattempted} Unattempted
                  </Text>
                </View>
              )}

              {c.proctorFlags > 0 && (
                <View style={styles.proctorWarning}>
                  <Text style={styles.proctorText}>⚠️ {c.proctorFlags} AI Proctoring Alerts Logged</Text>
                </View>
              )}
            </View>
          );
        })
      )}

      <CustomButton
        title="Erase All Candidate Entries (Reset) ⚠️"
        onPress={handleClear}
        variant="danger"
        style={{ marginTop: 24 }}
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
    backgroundColor: 'rgba(201, 152, 42, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    marginBottom: 6,
  },
  badgeText: {
    color: COLORS.gold,
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
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: COLORS.navy,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  filterChipText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: COLORS.goldBright,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },
  candidateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0e1f3d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  candidateName: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: '800',
  },
  rollNoText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  infoGrid: {
    gap: 4,
    marginBottom: 8,
  },
  infoItem: {
    color: '#475569',
    fontSize: 12,
  },
  scoreRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  scoreNum: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '900',
  },
  scoreBreakdown: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  proctorWarning: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 6,
    padding: 6,
    marginTop: 6,
  },
  proctorText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '700',
  },
});
