import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { useExam } from '../../context/ExamContext';
import { ExamTimer } from '../../components/cbt/ExamTimer';
import { QuestionPalette } from '../../components/cbt/QuestionPalette';
import { CustomButton } from '../../components/common/CustomButton';

interface CbtExamActiveScreenProps {
  onFinish: () => void;
  onExit: () => void;
}

export const CbtExamActiveScreen: React.FC<CbtExamActiveScreenProps> = ({ onFinish, onExit }) => {
  const {
    currentQuestion,
    currentIndex,
    questions,
    answers,
    markedForReview,
    selectOption,
    clearOption,
    toggleMarkForReview,
    nextQuestion,
    prevQuestion,
    submitExam,
    getSummaryCounts,
  } = useExam();

  const [paletteVisible, setPaletteVisible] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);

  if (!currentQuestion) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No questions loaded.</Text>
        <CustomButton title="Exit" onPress={onExit} variant="secondary" />
      </View>
    );
  }

  const selectedAnswer = answers[currentQuestion.id];
  const isMarked = !!markedForReview[currentQuestion.id];
  const summary = getSummaryCounts();

  const handleFinalSubmit = () => {
    setSubmitModalVisible(false);
    submitExam();
    onFinish();
  };

  const optionKeys: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Test Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity onPress={() => setSubmitModalVisible(true)} style={styles.exitBtn}>
            <Text style={styles.exitBtnText}>✕ End</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.qIndicator}>
              Q {currentIndex + 1} of {questions.length}
            </Text>
            <Text style={styles.sectionNameText} numberOfLines={1}>
              {currentQuestion.section}
            </Text>
          </View>
        </View>

        <View style={styles.topBarRight}>
          <ExamTimer />
          <TouchableOpacity
            style={styles.paletteTriggerBtn}
            onPress={() => setPaletteVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.paletteTriggerIcon}>▦</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Question Body */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Topic & Marking Pill */}
        <View style={styles.metaHeader}>
          <View style={styles.topicPill}>
            <Text style={styles.topicText}>
              {currentQuestion.subject ? `${currentQuestion.subject} · ${currentQuestion.topic || 'General'}` : (currentQuestion.topic || 'General')}
            </Text>
          </View>
          <Text style={styles.markingSchemeText}>Correct: +4 · Negative: -1</Text>
        </View>

        {/* Question Text */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {currentQuestion.diagram && (
            <View style={styles.diagramNotice}>
              <Text style={styles.diagramNoticeText}>📊 [Diagram/Figure reference attached]</Text>
            </View>
          )}
        </View>

        {/* Options List */}
        <Text style={styles.optionsTitle}>Select your answer:</Text>
        {optionKeys.map((key) => {
          const optionText = currentQuestion.options[key];
          const isSelected = selectedAnswer === key;

          return (
            <TouchableOpacity
              key={key}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              onPress={() => selectOption(key)}
              activeOpacity={0.7}
            >
              <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                <Text style={[styles.radioLetter, isSelected && styles.radioLetterSelected]}>
                  {key.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {optionText}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Testing Controls */}
      <View style={styles.bottomBar}>
        <View style={styles.topControlRow}>
          <TouchableOpacity
            style={[styles.controlMiniBtn, isMarked && styles.reviewActiveBtn]}
            onPress={toggleMarkForReview}
          >
            <Text style={[styles.controlMiniText, isMarked && styles.reviewActiveText]}>
              {isMarked ? '★ Marked for Review' : '☆ Mark for Review'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlMiniBtn} onPress={clearOption}>
            <Text style={styles.controlMiniText}>Clear Response</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainNavRow}>
          <CustomButton
            title="‹ Prev"
            onPress={prevQuestion}
            variant="secondary"
            size="small"
            disabled={currentIndex === 0}
            style={{ minWidth: 80 }}
          />

          <CustomButton
            title="Submit Exam 📝"
            onPress={() => setSubmitModalVisible(true)}
            variant="outline"
            size="small"
            style={{ flex: 1, marginHorizontal: 8 }}
          />

          <CustomButton
            title={currentIndex === questions.length - 1 ? "Finish ›" : "Next ›"}
            onPress={nextQuestion}
            variant="primary"
            size="small"
            style={{ minWidth: 80 }}
          />
        </View>
      </View>

      {/* Question Palette Modal */}
      <QuestionPalette visible={paletteVisible} onClose={() => setPaletteVisible(false)} />

      {/* Submit Confirmation Dialog */}
      <Modal visible={submitModalVisible} transparent animationType="fade" onRequestClose={() => setSubmitModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.submitConfirmCard}>
            <Text style={styles.submitConfirmTitle}>Submit Mock Examination?</Text>
            <Text style={styles.submitConfirmSub}>
              Are you sure you want to end your test session and evaluate your score?
            </Text>

            <View style={styles.summaryStatsBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.sumLbl}>🟢 Answered Questions:</Text>
                <Text style={styles.sumVal}>{summary.answered}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.sumLbl}>🔴 Unanswered Questions:</Text>
                <Text style={styles.sumVal}>{summary.notAnswered}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.sumLbl}>🟣 Marked for Review:</Text>
                <Text style={styles.sumVal}>{summary.markedReview}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.sumLbl}>⚪ Unvisited:</Text>
                <Text style={styles.sumVal}>{summary.notVisited}</Text>
              </View>
            </View>

            <View style={styles.submitModalActions}>
              <CustomButton
                title="Resume Test"
                onPress={() => setSubmitModalVisible(false)}
                variant="secondary"
                style={{ flex: 1 }}
              />
              <CustomButton
                title="Yes, Final Submit →"
                onPress={handleFinalSubmit}
                variant="primary"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050b17',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.pageBg,
  },
  errorText: {
    color: COLORS.navy,
    fontSize: 16,
    marginBottom: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0e1f3d',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.goldBorder,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  exitBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exitBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '800',
  },
  qIndicator: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  sectionNameText: {
    color: COLORS.goldBright,
    fontSize: 10.5,
    fontWeight: '700',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paletteTriggerBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.goldBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteTriggerIcon: {
    fontSize: 18,
    color: COLORS.navyDeep,
    fontWeight: '900',
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicPill: {
    backgroundColor: 'rgba(201, 152, 42, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: '60%',
  },
  topicText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '800',
  },
  markingSchemeText: {
    color: '#16a34a',
    fontSize: 11,
    fontWeight: '800',
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  questionText: {
    color: '#0f172a',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  diagramNotice: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  diagramNoticeText: {
    color: '#475569',
    fontSize: 12,
  },
  optionsTitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  optionCardSelected: {
    backgroundColor: 'rgba(201, 152, 42, 0.08)',
    borderColor: COLORS.goldBright,
  },
  radioCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    backgroundColor: COLORS.goldBright,
  },
  radioLetter: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '800',
  },
  radioLetterSelected: {
    color: COLORS.navyDeep,
  },
  optionText: {
    color: '#1e293b',
    fontSize: 14,
    lineHeight: 19,
    flex: 1,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: COLORS.navy,
    fontWeight: '700',
  },
  bottomBar: {
    backgroundColor: '#0e1f3d',
    borderTopWidth: 1.5,
    borderTopColor: COLORS.goldBorder,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  topControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  controlMiniBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
  },
  controlMiniText: {
    color: COLORS.cream,
    fontSize: 11.5,
    fontWeight: '600',
  },
  reviewActiveBtn: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderWidth: 1,
    borderColor: COLORS.cbtPurple,
  },
  reviewActiveText: {
    color: '#c084fc',
    fontWeight: '800',
  },
  mainNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Submit Confirmation Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 23, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  submitConfirmCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
  },
  submitConfirmTitle: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: '900',
  },
  submitConfirmSub: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  summaryStatsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  sumLbl: {
    color: '#475569',
    fontSize: 12.5,
    fontWeight: '600',
  },
  sumVal: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '900',
  },
  submitModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
