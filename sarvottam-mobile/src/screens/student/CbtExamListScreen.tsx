import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { EXAMS_CATALOG } from '../../data/examsCatalogData';
import { CbtExamMeta } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useExam } from '../../context/ExamContext';
import { CustomButton } from '../../components/common/CustomButton';

interface CbtExamListScreenProps {
  onStartExam: () => void;
  onBack: () => void;
}

export const CbtExamListScreen: React.FC<CbtExamListScreenProps> = ({ onStartExam, onBack }) => {
  const { student } = useAuth();
  const { startExam } = useExam();
  const [selectedExam, setSelectedExam] = useState<CbtExamMeta | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);

  const handleSelectExam = (exam: CbtExamMeta) => {
    setSelectedExam(exam);
    setConfirmModal(true);
  };

  const handleLaunchConfirmed = () => {
    setConfirmModal(false);
    if (selectedExam) {
      startExam(selectedExam.id);
    } else {
      startExam();
    }
    onStartExam();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>‹ Back to Home</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>SNTRA CBT ENGINE · SIMULATOR</Text>
        </View>
        <Text style={styles.title}>CBT Online Mock Examinations</Text>
        <Text style={styles.subtitle}>
          Exact exam-hall simulation matching NTA, UPSC & ICAI testing software. Features section locking, negative marking, and instant All-India percentiles.
        </Text>
      </View>

      {/* Flagship NEET Card Highlight */}
      <View style={styles.flagshipCard}>
        <View style={styles.flagshipTagRow}>
          <View style={styles.livePulseDot} />
          <Text style={styles.flagshipTag}>FLAGSHIP · NTA NEET 2024 OFFICIAL TEST</Text>
        </View>

        <Text style={styles.flagshipTitle}>NEET (UG) 2024 — Botany Mock Examination</Text>
        <Text style={styles.flagshipDesc}>
          50 Questions strictly mapped to Section A (Compulsory Q1–35) and Section B (Choice of 10 out of 15 Q36–50) with step-by-step rationales.
        </Text>

        <View style={styles.flagshipMetaGrid}>
          <View style={styles.fMetaItem}>
            <Text style={styles.fMetaNum}>50</Text>
            <Text style={styles.fMetaLbl}>Questions</Text>
          </View>
          <View style={styles.fMetaItem}>
            <Text style={styles.fMetaNum}>45m</Text>
            <Text style={styles.fMetaLbl}>Timer</Text>
          </View>
          <View style={styles.fMetaItem}>
            <Text style={styles.fMetaNum}>200</Text>
            <Text style={styles.fMetaLbl}>Marks</Text>
          </View>
          <View style={styles.fMetaItem}>
            <Text style={styles.fMetaNum}>+4 / -1</Text>
            <Text style={styles.fMetaLbl}>Marking</Text>
          </View>
        </View>

        <CustomButton
          title="Launch NEET Botany CBT Now 💻"
          onPress={() => handleSelectExam(EXAMS_CATALOG[0])}
          variant="primary"
          style={styles.flagshipBtn}
        />
      </View>

      {/* Full Exams Catalog */}
      <Text style={styles.catalogHeading}>All Stream Mock Examinations</Text>

      {EXAMS_CATALOG.map((exam) => (
        <View key={exam.id} style={styles.examCard}>
          <View style={styles.examCardHeader}>
            <View style={styles.streamBadge}>
              <Text style={styles.streamBadgeText}>{exam.stream}</Text>
            </View>
            <Text style={styles.timerTag}>⏱️ {exam.durationMinutes} Mins</Text>
          </View>

          <Text style={styles.examTitle}>{exam.title}</Text>

          <View style={styles.specsRow}>
            <Text style={styles.specTxt}>📝 {exam.totalQuestions} Questions</Text>
            <Text style={styles.specTxt}>🎯 {exam.maxMarks} Marks</Text>
            <Text style={styles.specTxt}>⚖️ +{exam.markingScheme.correct} / {exam.markingScheme.incorrect}</Text>
          </View>

          <View style={styles.sectionsList}>
            {exam.sections.map((sec, idx) => (
              <Text key={idx} style={styles.secName}>• {sec.name}</Text>
            ))}
          </View>

          <CustomButton
            title="Start Mock Examination →"
            onPress={() => handleSelectExam(exam)}
            variant={exam.id.includes('neet') ? "primary" : "secondary"}
            size="small"
            style={{ marginTop: 12 }}
          />
        </View>
      ))}

      {/* Confirmation & Candidate Verification Modal */}
      {selectedExam && (
        <Modal visible={confirmModal} animationType="fade" transparent onRequestClose={() => setConfirmModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.confirmBox}>
              <View style={styles.confirmHeader}>
                <Text style={styles.confirmTitle}>Candidate Verification</Text>
                <TouchableOpacity onPress={() => setConfirmModal(false)}>
                  <Text style={styles.confirmClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.confirmExamName}>{selectedExam.title}</Text>
              <Text style={styles.confirmExamSub}>
                Duration: {selectedExam.durationMinutes} Minutes · Total Marks: {selectedExam.maxMarks}
              </Text>

              {/* Student Identification Card */}
              <View style={styles.candidateCard}>
                <Text style={styles.cardHeaderSmall}>VERIFIED CANDIDATE DETAILS</Text>
                <View style={styles.candRow}>
                  <Text style={styles.candLabel}>Student Name:</Text>
                  <Text style={styles.candVal}>{student ? student.fullName : 'Aarav Sharma'}</Text>
                </View>
                <View style={styles.candRow}>
                  <Text style={styles.candLabel}>Roll Number:</Text>
                  <Text style={styles.candVal}>{student ? student.rollNo : 'NEET2024-180506-4821'}</Text>
                </View>
                <View style={styles.candRow}>
                  <Text style={styles.candLabel}>Candidate DOB:</Text>
                  <Text style={styles.candVal}>{student ? student.age : '180506'}</Text>
                </View>
                <View style={styles.candRow}>
                  <Text style={styles.candLabel}>Scorecard Email:</Text>
                  <Text style={styles.candVal}>{student ? student.email : 'student@sarvottam.ac.in'}</Text>
                </View>
              </View>

              <View style={styles.rulesBox}>
                <Text style={styles.rulesTitle}>⚠️ Important Exam-Room Rules:</Text>
                <Text style={styles.ruleItem}>1. Marking Scheme: +4 marks for correct, -1 mark for incorrect answers.</Text>
                <Text style={styles.ruleItem}>2. Timer runs continuously; test auto-submits when time expires.</Text>
                <Text style={styles.ruleItem}>3. Telemetry is streamed real-time to the Sarvottam Admin Dashboard.</Text>
              </View>

              <CustomButton
                title="Enter Examination Room Now 💻"
                onPress={handleLaunchConfirmed}
                variant="primary"
                style={{ marginTop: 16 }}
              />
            </View>
          </View>
        </Modal>
      )}
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
    paddingBottom: 36,
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
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    marginBottom: 6,
  },
  badgeText: {
    color: '#10b981',
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
  flagshipCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: COLORS.goldBorder,
    shadowColor: COLORS.navyDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  flagshipTagRow: {
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
  flagshipTag: {
    color: '#10b981',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  flagshipTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 23,
  },
  flagshipDesc: {
    color: COLORS.cream,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 6,
    opacity: 0.9,
  },
  flagshipMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(5, 11, 23, 0.6)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  fMetaItem: {
    alignItems: 'center',
  },
  fMetaNum: {
    color: COLORS.goldBright,
    fontSize: 16,
    fontWeight: '900',
  },
  fMetaLbl: {
    color: COLORS.textDarkMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  flagshipBtn: {
    width: '100%',
  },
  catalogHeading: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  examCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0e1f3d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  examCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  streamBadge: {
    backgroundColor: 'rgba(201, 152, 42, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  streamBadgeText: {
    color: COLORS.gold,
    fontSize: 10.5,
    fontWeight: '800',
  },
  timerTag: {
    color: COLORS.textMuted,
    fontSize: 11.5,
    fontWeight: '700',
  },
  examTitle: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: '800',
  },
  specsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  specTxt: {
    color: '#475569',
    fontSize: 11.5,
    fontWeight: '600',
  },
  sectionsList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  secName: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 2,
  },
  // Confirmation Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 23, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  confirmBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  confirmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmTitle: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: '900',
  },
  confirmClose: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
  },
  confirmExamName: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: '800',
  },
  confirmExamSub: {
    color: COLORS.gold,
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
  },
  candidateCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeaderSmall: {
    color: COLORS.navy,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  candRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  candLabel: {
    color: '#64748b',
    fontSize: 11.5,
  },
  candVal: {
    color: COLORS.navy,
    fontSize: 11.5,
    fontWeight: '700',
  },
  rulesBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  rulesTitle: {
    color: '#b45309',
    fontSize: 11.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  ruleItem: {
    color: '#475569',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 2,
  },
});
