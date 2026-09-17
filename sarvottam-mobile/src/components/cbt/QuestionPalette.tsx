import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { COLORS } from '../../constants/theme';
import { useExam } from '../../context/ExamContext';
import { QuestionStatus } from '../../types';

interface QuestionPaletteProps {
  visible: boolean;
  onClose: () => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({ visible, onClose }) => {
  const { questions, currentIndex, goToQuestion, getQuestionStatus, getSummaryCounts } = useExam();
  const summary = getSummaryCounts();

  const getStatusColor = (status: QuestionStatus, isCurrent: boolean) => {
    switch (status) {
      case 'ANSWERED':
        return COLORS.cbtGreen;
      case 'NOT_ANSWERED':
        return COLORS.cbtRed;
      case 'MARKED_REVIEW':
        return COLORS.cbtPurple;
      default:
        return isCurrent ? COLORS.navy : COLORS.cbtSilver;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Question Navigation Palette</Text>
              <Text style={styles.sheetSubtitle}>50 Official NTA NEET Questions</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Color Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.cbtGreen }]} />
              <Text style={styles.legendText}>Answered ({summary.answered})</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.cbtRed }]} />
              <Text style={styles.legendText}>Not Answered ({summary.notAnswered})</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.cbtPurple }]} />
              <Text style={styles.legendText}>Review ({summary.markedReview})</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.cbtSilver }]} />
              <Text style={styles.legendText}>Not Visited ({summary.notVisited})</Text>
            </View>
          </View>

          {/* Section A & Section B Split */}
          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionHeader}>SECTION A (Q1 – 35) · Compulsory</Text>
            <View style={styles.grid}>
              {questions.slice(0, 35).map((q, idx) => {
                const status = getQuestionStatus(q.id);
                const isCurrent = idx === currentIndex;
                const bgColor = getStatusColor(status, isCurrent);

                return (
                  <TouchableOpacity
                    key={q.id}
                    style={[
                      styles.qNumberBtn,
                      { backgroundColor: bgColor },
                      isCurrent && styles.currentQBorder,
                    ]}
                    onPress={() => {
                      goToQuestion(idx);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.qNumberText, status === 'NOT_VISITED' && !isCurrent && styles.unvisitedText]}>
                      {idx + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionHeader, { marginTop: 20 }]}>
              SECTION B (Q36 – 50) · Attempt Any 10
            </Text>
            <View style={styles.grid}>
              {questions.slice(35).map((q, idx) => {
                const actualIndex = 35 + idx;
                const status = getQuestionStatus(q.id);
                const isCurrent = actualIndex === currentIndex;
                const bgColor = getStatusColor(status, isCurrent);

                return (
                  <TouchableOpacity
                    key={q.id}
                    style={[
                      styles.qNumberBtn,
                      { backgroundColor: bgColor },
                      isCurrent && styles.currentQBorder,
                    ]}
                    onPress={() => {
                      goToQuestion(actualIndex);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.qNumberText, status === 'NOT_VISITED' && !isCurrent && styles.unvisitedText]}>
                      {actualIndex + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 23, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sheetTitle: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.navy,
  },
  scrollArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.navy,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  qNumberBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentQBorder: {
    borderWidth: 2.5,
    borderColor: '#050b17',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  qNumberText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  unvisitedText: {
    color: '#334155',
  },
});
