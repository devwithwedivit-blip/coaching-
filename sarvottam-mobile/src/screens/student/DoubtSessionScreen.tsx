import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { INITIAL_DOUBTS_DATA } from '../../data/doubtData';
import { DoubtItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { CustomButton } from '../../components/common/CustomButton';

interface DoubtSessionScreenProps {
  onBack: () => void;
}

export const DoubtSessionScreen: React.FC<DoubtSessionScreenProps> = ({ onBack }) => {
  const { student } = useAuth();
  const [doubts, setDoubts] = useState<DoubtItem[]>(INITIAL_DOUBTS_DATA);
  const [showAskForm, setShowAskForm] = useState(false);

  // Form states
  const [selectedSubject, setSelectedSubject] = useState('Botany');
  const [topic, setTopic] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'my'>('all');

  const subjects = ['Botany', 'Zoology', 'Physics', 'Chemistry', 'Mathematics', 'Polity'];

  const handlePostDoubt = () => {
    if (!topic.trim() || !questionText.trim()) {
      Alert.alert('Required Fields', 'Please enter both the topic and detailed doubt question.');
      return;
    }

    const newDoubt: DoubtItem = {
      id: 'doubt-' + (doubts.length + 1),
      studentName: student ? student.fullName : 'Student Candidate',
      rollNo: student ? student.rollNo : 'NEET2024-CANDIDATE',
      stream: student ? student.targetExam : 'NEET (UG)',
      subject: selectedSubject,
      topic: topic.trim(),
      questionText: questionText.trim(),
      createdAt: 'Just now',
      status: 'UNDER_REVIEW',
      votes: 1,
    };

    setDoubts([newDoubt, ...doubts]);
    setTopic('');
    setQuestionText('');
    setShowAskForm(false);
    Alert.alert('Doubt Submitted', 'Your doubt has been submitted to Sarvottam Faculty. An expert answer will be posted within 30 minutes.');
  };

  const handleUpvote = (id: string) => {
    setDoubts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, votes: d.votes + 1 } : d))
    );
  };

  const displayDoubts = selectedTab === 'my'
    ? doubts.filter((d) => d.rollNo === (student ? student.rollNo : 'NEET2024-CANDIDATE'))
    : doubts;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>24/7 DOUBT CLEARING</Text>
        </View>
        <Text style={styles.title}>Faculty Doubt Resolution Hub</Text>
        <Text style={styles.subtitle}>
          Post your academic questions, get verified step-by-step answers from expert educators, and browse community solutions.
        </Text>
      </View>

      {/* Trigger Ask Doubt Button */}
      {!showAskForm ? (
        <CustomButton
          title="💬 Ask a New Academic Doubt"
          onPress={() => setShowAskForm(true)}
          variant="primary"
          style={styles.askTriggerBtn}
        />
      ) : (
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Submit a Question for Faculty</Text>
            <TouchableOpacity onPress={() => setShowAskForm(false)}>
              <Text style={styles.formCancel}>Cancel ✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.formLabel}>Select Subject</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScroll}>
            {subjects.map((sub) => (
              <TouchableOpacity
                key={sub}
                style={[styles.subjectPill, selectedSubject === sub && styles.subjectPillActive]}
                onPress={() => setSelectedSubject(sub)}
              >
                <Text style={[styles.subjectText, selectedSubject === sub && styles.subjectTextActive]}>
                  {sub}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.formLabel}>Topic / Chapter Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Biological Classification or Rotational Motion"
            placeholderTextColor="#94a3b8"
            value={topic}
            onChangeText={setTopic}
          />

          <Text style={styles.formLabel}>Describe Your Doubt in Detail</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Type your question or formula problem here..."
            placeholderTextColor="#94a3b8"
            value={questionText}
            onChangeText={setQuestionText}
            multiline
            numberOfLines={4}
          />

          <CustomButton
            title="Submit Doubt to Faculty →"
            onPress={handlePostDoubt}
            variant="primary"
            style={{ marginTop: 8 }}
          />
        </View>
      )}

      {/* Tabs: All Questions vs My Questions */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, selectedTab === 'all' && styles.tabBtnActive]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabBtnText, selectedTab === 'all' && styles.tabBtnTextActive]}>
            All Faculty Doubts ({doubts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, selectedTab === 'my' && styles.tabBtnActive]}
          onPress={() => setSelectedTab('my')}
        >
          <Text style={[styles.tabBtnText, selectedTab === 'my' && styles.tabBtnTextActive]}>
            My Questions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Doubt Items Feed */}
      {displayDoubts.map((doubt) => (
        <View key={doubt.id} style={styles.doubtCard}>
          <View style={styles.cardTop}>
            <View style={styles.badgeRow}>
              <Text style={styles.subPill}>{doubt.subject}</Text>
              <Text style={styles.topicPill}>{doubt.topic}</Text>
            </View>
            <TouchableOpacity
              style={styles.voteBtn}
              onPress={() => handleUpvote(doubt.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.voteIcon}>▲</Text>
              <Text style={styles.voteCount}>{doubt.votes}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.questionText}>Q: {doubt.questionText}</Text>
          <Text style={styles.askedByText}>
            Asked by {doubt.studentName} ({doubt.stream}) · {doubt.createdAt}
          </Text>

          {doubt.status === 'RESOLVED' && doubt.answerText ? (
            <View style={styles.answerBox}>
              <View style={styles.facultyHeaderRow}>
                <Text style={styles.verifiedBadge}>✓ FACULTY VERIFIED ANSWER</Text>
                <Text style={styles.facultyName}>{doubt.facultyName}</Text>
              </View>
              <Text style={styles.facultyTitle}>{doubt.facultyDesignation}</Text>
              <Text style={styles.answerText}>{doubt.answerText}</Text>
            </View>
          ) : (
            <View style={styles.reviewBox}>
              <Text style={styles.reviewText}>
                ⏳ Under faculty review. An expert instructor will post the solution shortly.
              </Text>
            </View>
          )}
        </View>
      ))}
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
  askTriggerBtn: {
    marginBottom: 16,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: COLORS.goldBorder,
    shadowColor: '#0e1f3d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  formTitle: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: '800',
  },
  formCancel: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  formLabel: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 6,
  },
  subjectScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  subjectPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginRight: 8,
  },
  subjectPillActive: {
    backgroundColor: COLORS.navy,
  },
  subjectText: {
    color: '#475569',
    fontSize: 11.5,
    fontWeight: '700',
  },
  subjectTextActive: {
    color: COLORS.goldBright,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.navy,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabBtnActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  tabBtnTextActive: {
    color: COLORS.goldBright,
  },
  doubtCard: {
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  subPill: {
    color: COLORS.gold,
    fontSize: 10.5,
    fontWeight: '800',
    backgroundColor: 'rgba(201, 152, 42, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  topicPill: {
    color: '#64748b',
    fontSize: 10.5,
    fontWeight: '700',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  voteIcon: {
    fontSize: 10,
    color: COLORS.gold,
  },
  voteCount: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.navy,
  },
  questionText: {
    color: COLORS.navy,
    fontSize: 13.5,
    fontWeight: '800',
    lineHeight: 19,
  },
  askedByText: {
    color: '#94a3b8',
    fontSize: 10.5,
    marginTop: 4,
  },
  answerBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderLeftWidth: 3.5,
    borderLeftColor: '#10b981',
  },
  facultyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verifiedBadge: {
    color: '#10b981',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  facultyName: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '800',
  },
  facultyTitle: {
    color: '#64748b',
    fontSize: 10,
    marginBottom: 6,
  },
  answerText: {
    color: '#334155',
    fontSize: 12.5,
    lineHeight: 18,
  },
  reviewBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  reviewText: {
    color: '#b45309',
    fontSize: 11.5,
  },
});
