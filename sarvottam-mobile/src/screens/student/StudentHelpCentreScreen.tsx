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
import { useAuth } from '../../context/AuthContext';
import { CustomButton } from '../../components/common/CustomButton';

interface StudentHelpCentreScreenProps {
  onBack: () => void;
}

export const StudentHelpCentreScreen: React.FC<StudentHelpCentreScreenProps> = ({ onBack }) => {
  const { student } = useAuth();
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [category, setCategory] = useState('CBT Mock Test Issue');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const categories = [
    'CBT Mock Test Issue',
    'Batch Timing / Schedule',
    'Study Material & PDFs',
    'Faculty Mentorship Inquiry',
  ];

  const faqs = [
    {
      q: 'How does the Section B choice rule work in NEET Botany?',
      a: 'Section B contains 15 questions (Q36 to Q50). You are required to attempt any 10 questions. If more than 10 are attempted, our CBT engine automatically evaluates only the first 10 attempted questions as per official NTA NEET guidelines.',
    },
    {
      q: 'Can I retake a CBT Mock Examination?',
      a: 'Yes! You can retake any mock examination as many times as you like. Your latest attempt updates your personal progress analytics, and your official scorecard is re-evaluated.',
    },
    {
      q: 'What should I do if my internet disconnects during an online test?',
      a: 'Our engine is offline-resilient. All questions and your selected answers are cached locally in your device memory. When connection restores, your telemetry automatically syncs with the Sarvottam central database.',
    },
    {
      q: 'How can I change my primary academic stream or batch timing?',
      a: 'Submit a ticket below with your roll number and requested batch. The Academic Coordinator will review and process your transfer within 24 business hours.',
    },
  ];

  const handleSubmitTicket = () => {
    if (!ticketSubject.trim() || !ticketDesc.trim()) {
      Alert.alert('Incomplete Ticket', 'Please fill in both the ticket subject and description.');
      return;
    }

    Alert.alert(
      'Support Ticket Created',
      `Ticket #${Math.floor(10000 + Math.random() * 90000)} has been logged for Roll No: ${student ? student.rollNo : 'NEET2024-CANDIDATE'}. An Academic Officer will contact you within 4 hours.`,
      [{ text: 'OK' }]
    );
    setTicketSubject('');
    setTicketDesc('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>ACADEMIC ASSISTANCE</Text>
        </View>
        <Text style={styles.title}>Student Help Centre</Text>
        <Text style={styles.subtitle}>
          Guidance on CBT tests, study schedules, doubt resolution, and technical app troubleshooting.
        </Text>
      </View>

      {/* Ticket Generator Form */}
      <View style={styles.ticketCard}>
        <Text style={styles.cardHeading}>Raise an Academic or Technical Ticket</Text>
        <Text style={styles.cardSub}>Direct line to Sarvottam Student Support Desk</Text>

        <Text style={styles.inputLabel}>Help Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.catPill, category === c && styles.catPillActive]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.catText, category === c && styles.catTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.inputLabel}>Subject / Brief Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Discrepancy in Q14 Botany Mock Answer Key"
          placeholderTextColor="#94a3b8"
          value={ticketSubject}
          onChangeText={setTicketSubject}
        />

        <Text style={styles.inputLabel}>Detailed Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your query or problem in detail..."
          placeholderTextColor="#94a3b8"
          value={ticketDesc}
          onChangeText={setTicketDesc}
          multiline
          numberOfLines={4}
        />

        <CustomButton
          title="Submit Support Ticket →"
          onPress={handleSubmitTicket}
          variant="primary"
          style={{ marginTop: 8 }}
        />
      </View>

      {/* Frequently Asked Questions */}
      <Text style={styles.faqSectionTitle}>Frequently Asked Questions</Text>

      {faqs.map((faq, idx) => {
        const isExpanded = expandedFaq === idx;

        return (
          <TouchableOpacity
            key={idx}
            style={styles.faqCard}
            onPress={() => setExpandedFaq(isExpanded ? null : idx)}
            activeOpacity={0.7}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQText}>{faq.q}</Text>
              <Text style={styles.faqExpandIcon}>{isExpanded ? '−' : '+'}</Text>
            </View>
            {isExpanded && (
              <View style={styles.faqBody}>
                <Text style={styles.faqAText}>{faq.a}</Text>
              </View>
            )}
          </TouchableOpacity>
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
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    marginBottom: 6,
  },
  badgeText: {
    color: '#06b6d4',
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
  ticketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0e1f3d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeading: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  cardSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  inputLabel: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 6,
  },
  catScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  catPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginRight: 8,
  },
  catPillActive: {
    backgroundColor: COLORS.navy,
  },
  catText: {
    color: '#475569',
    fontSize: 11.5,
    fontWeight: '700',
  },
  catTextActive: {
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
    marginBottom: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  faqSectionTitle: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQText: {
    color: COLORS.navy,
    fontSize: 13.5,
    fontWeight: '800',
    flex: 1,
    lineHeight: 18,
  },
  faqExpandIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gold,
    marginLeft: 10,
  },
  faqBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  faqAText: {
    color: '#475569',
    fontSize: 12.5,
    lineHeight: 18,
  },
});
