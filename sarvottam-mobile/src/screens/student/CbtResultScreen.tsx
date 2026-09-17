import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { useExam } from '../../context/ExamContext';
import { CustomButton } from '../../components/common/CustomButton';
import { GlassCard } from '../../components/common/GlassCard';

interface CbtResultScreenProps {
  onRetake: () => void;
  onHome: () => void;
}

export const CbtResultScreen: React.FC<CbtResultScreenProps> = ({ onRetake, onHome }) => {
  const { latestResult, questions } = useExam();
  const [filterReview, setFilterReview] = useState<'all' | 'wrong' | 'correct'>('all');
  const [expandedQId, setExpandedQId] = useState<number | null>(null);

  if (!latestResult) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No test results found.</Text>
        <CustomButton title="Return to Home" onPress={onHome} variant="primary" />
      </View>
    );
  }

  const toggleExpand = (qId: number) => {
    setExpandedQId((prev) => (prev === qId ? null : qId));
  };

  const filteredQuestions = questions.filter((q) => {
    const userAns = latestResult.answers[q.id];
    const isCorrect = userAns && userAns.toLowerCase() === q.correctAnswer.toLowerCase();
    const isWrong = userAns && userAns.toLowerCase() !== q.correctAnswer.toLowerCase();

    if (filterReview === 'correct') return isCorrect;
    if (filterReview === 'wrong') return isWrong;
    return true;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Scorecard Hero Card */}
      <GlassCard variant="dark" style={styles.scorecardHero}>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeText}>OFFICIAL CBT SCORECARD</Text>
        </View>

        <Text style={styles.examTitle}>{latestResult.examTitle}</Text>
        <Text style={styles.candDetails}>
          Candidate: {latestResult.candidateName} · Roll: {latestResult.rollNo}
        </Text>

        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNum}>{latestResult.score}</Text>
          <Text style={styles.scoreMax}>/ {latestResult.maxScore}</Text>
        </View>

        {/* 4 Performance Telemetry Badges */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>{latestResult.accuracy}%</Text>
            <Text style={styles.metricLbl}>Accuracy</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>#{latestResult.airRankEstimated}</Text>
            <Text style={styles.metricLbl}>AIR Rank</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>{latestResult.percentile}%ile</Text>
            <Text style={styles.metricLbl}>Percentile</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>{latestResult.percentage}%</Text>
            <Text style={styles.metricLbl}>Marks %</Text>
          </View>
        </View>
      </GlassCard>

      {/* Breakdown Cards */}
      <View style={styles.breakdownRow}>
        <View style={[styles.breakdownCard, { borderColor: '#10b981' }]}>
          <Text style={[styles.breakdownNum, { color: '#10b981' }]}>
            {latestResult.correct}
          </Text>
          <Text style={styles.breakdownLbl}>Correct (+{latestResult.correct * 4})</Text>
        </View>

        <View style={[styles.breakdownCard, { borderColor: '#ef4444' }]}>
          <Text style={[styles.breakdownNum, { color: '#ef4444' }]}>
            {latestResult.wrong}
          </Text>
          <Text style={styles.breakdownLbl}>Wrong (-{latestResult.wrong})</Text>
        </View>

        <View style={[styles.breakdownCard, { borderColor: '#94a3b8' }]}>
          <Text style={[styles.breakdownNum, { color: '#94a3b8' }]}>
            {latestResult.unattempted}
          </Text>
          <Text style={styles.breakdownLbl}>Unattempted (0)</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <CustomButton
          title="Retake Mock Exam 💻"
          onPress={onRetake}
          variant="primary"
          style={{ flex: 1 }}
        />
        <CustomButton
          title="Home Portal 🏠"
          onPress={onHome}
          variant="secondary"
          style={{ flex: 1 }}
        />
      </View>

      {/* Step-by-Step Question Rationales & Review */}
      <View style={styles.reviewSection}>
        <Text style={styles.reviewHeading}>Detailed Question-Wise Solutions</Text>
        <Text style={styles.reviewSub}>Verified step-by-step rationales from Sarvottam faculty</Text>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, filterReview === 'all' && styles.filterPillActive]}
            onPress={() => setFilterReview('all')}
          >
            <Text style={[styles.filterText, filterReview === 'all' && styles.filterTextActive]}>
              All ({questions.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, filterReview === 'correct' && styles.filterPillActive]}
            onPress={() => setFilterReview('correct')}
          >
            <Text style={[styles.filterText, filterReview === 'correct' && styles.filterTextActive]}>
              Correct ({latestResult.correct})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, filterReview === 'wrong' && styles.filterPillActive]}
            onPress={() => setFilterReview('wrong')}
          >
            <Text style={[styles.filterText, filterReview === 'wrong' && styles.filterTextActive]}>
              Incorrect ({latestResult.wrong})
            </Text>
          </TouchableOpacity>
        </View>

        {filteredQuestions.map((q, idx) => {
          const userAns = latestResult.answers[q.id];
          const isCorrect = userAns && userAns.toLowerCase() === q.correctAnswer.toLowerCase();
          const isWrong = userAns && userAns.toLowerCase() !== q.correctAnswer.toLowerCase();
          const isUnattempted = !userAns;
          const isExpanded = expandedQId === q.id;

          let statusTag = 'Unattempted';
          let statusColor = '#94a3b8';
          if (isCorrect) {
            statusTag = 'Correct (+4)';
            statusColor = '#10b981';
          } else if (isWrong) {
            statusTag = 'Wrong (-1)';
            statusColor = '#ef4444';
          }

          return (
            <View key={q.id} style={styles.solutionCard}>
              <TouchableOpacity
                style={styles.solutionHeader}
                onPress={() => toggleExpand(q.id)}
                activeOpacity={0.7}
              >
                <View style={styles.solHeaderLeft}>
                  <Text style={styles.qNumBadge}>Q{q.id}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.solStatusTag, { color: statusColor }]}>{statusTag}</Text>
                    <Text style={styles.solTopicText} numberOfLines={1}>{q.topic}</Text>
                  </View>
                </View>
                <Text style={styles.solExpandIcon}>{isExpanded ? '−' : '+'}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.solutionBody}>
                  {q.imageUrl ? (
                    <View style={styles.solImageContainer}>
                      <View style={styles.solImageBadge}>
                        <Text style={styles.solImageBadgeText}>📷 ORIGINAL EXAM SHEET CROP (HIGH-RES)</Text>
                      </View>
                      <Image
                        source={{ uri: q.imageUrl }}
                        style={[
                          styles.solCropImage,
                          q.imageAspectRatio
                            ? { aspectRatio: q.imageAspectRatio }
                            : { minHeight: 200 },
                        ]}
                        resizeMode="contain"
                      />
                      {q.question && !q.question.toLowerCase().startsWith('question ') && (
                        <Text style={styles.solQuestionTextSecondary}>{q.question}</Text>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.solQuestionText}>{q.question}</Text>
                  )}

                  {/* Options Comparison */}
                  <View style={styles.solOptionsList}>
                    {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                      const isUserSelected = userAns === opt;
                      const isCorrectAnswer = q.correctAnswer.toLowerCase() === opt;
                      const optText = q.options[opt];
                      const optImg = q.optionsImages?.[opt];
                      const isErrorOption = !optText && !optImg;

                      return (
                        <View
                          key={opt}
                          style={[
                            styles.solOptionRow,
                            isCorrectAnswer && styles.correctOptionRow,
                            isUserSelected && !isCorrectAnswer && styles.wrongOptionRow,
                            isErrorOption && styles.solErrorOptionRow,
                          ]}
                        >
                          <Text style={styles.solOptLetter}>({opt.toUpperCase()})</Text>
                          {optImg ? (
                            <Image source={{ uri: optImg }} style={styles.solOptImage} resizeMode="contain" />
                          ) : isErrorOption ? (
                            <Text style={styles.solOptErrorText}>⚠️ [Option unavailable - extraction error]</Text>
                          ) : (
                            <Text style={styles.solOptText}>{optText}</Text>
                          )}
                          {isCorrectAnswer && <Text style={styles.checkTag}>✓ Correct</Text>}
                          {isUserSelected && !isCorrectAnswer && <Text style={styles.crossTag}>✗ Your Choice</Text>}
                        </View>
                      );
                    })}
                  </View>

                  {/* Official Verified Rationale */}
                  <View style={styles.rationaleBox}>
                    <Text style={styles.rationaleTitle}>💡 Verified Faculty Explanation:</Text>
                    <Text style={styles.rationaleText}>{q.explanation}</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.pageBg,
  },
  emptyTitle: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  scorecardHero: {
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreBadge: {
    backgroundColor: 'rgba(201, 152, 42, 0.15)',
    borderColor: COLORS.goldBright,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 100,
    marginBottom: 8,
  },
  scoreBadgeText: {
    color: COLORS.goldBright,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  examTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  candDetails: {
    color: COLORS.textDarkMuted,
    fontSize: 12,
    marginTop: 4,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 16,
  },
  scoreNum: {
    color: COLORS.goldBright,
    fontSize: 48,
    fontWeight: '900',
  },
  scoreMax: {
    color: COLORS.cream,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 6,
    opacity: 0.8,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'rgba(5, 11, 23, 0.6)',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricCol: {
    alignItems: 'center',
  },
  metricVal: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  metricLbl: {
    color: COLORS.textDarkMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  breakdownCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  breakdownNum: {
    fontSize: 22,
    fontWeight: '900',
  },
  breakdownLbl: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  reviewSection: {
    marginTop: 8,
  },
  reviewHeading: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: '900',
  },
  reviewSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterPillActive: {
    backgroundColor: COLORS.navy,
  },
  filterText: {
    color: '#475569',
    fontSize: 11.5,
    fontWeight: '700',
  },
  filterTextActive: {
    color: COLORS.goldBright,
  },
  solutionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  solutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  solHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  qNumBadge: {
    backgroundColor: '#f1f5f9',
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  solStatusTag: {
    fontSize: 11,
    fontWeight: '800',
  },
  solTopicText: {
    color: '#64748b',
    fontSize: 11,
  },
  solExpandIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
    marginLeft: 8,
  },
  solutionBody: {
    padding: 14,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  solQuestionText: {
    color: '#0f172a',
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '700',
    marginVertical: 10,
  },
  solImageContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
    marginTop: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  solImageBadge: {
    width: '100%',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    marginBottom: 8,
  },
  solImageBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284c7',
  },
  solCropImage: {
    width: '100%',
    maxWidth: 680,
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  solQuestionTextSecondary: {
    marginTop: 10,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    width: '100%',
  },
  solOptImage: {
    flex: 1,
    height: 44,
    maxWidth: 200,
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  solOptionsList: {
    gap: 6,
    marginBottom: 12,
  },
  solOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  correctOptionRow: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  wrongOptionRow: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  solErrorOptionRow: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#f43f5e',
  },
  solOptLetter: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.navy,
  },
  solOptText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
  },
  solOptErrorText: {
    fontSize: 11.5,
    color: '#b91c1c',
    fontStyle: 'italic',
    fontWeight: '600',
    flex: 1,
  },
  checkTag: {
    color: '#10b981',
    fontSize: 10.5,
    fontWeight: '800',
  },
  crossTag: {
    color: '#ef4444',
    fontSize: 10.5,
    fontWeight: '800',
  },
  rationaleBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3.5,
    borderLeftColor: COLORS.goldBright,
  },
  rationaleTitle: {
    color: COLORS.navy,
    fontSize: 11.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  rationaleText: {
    color: '#334155',
    fontSize: 12,
    lineHeight: 18,
  },
});
