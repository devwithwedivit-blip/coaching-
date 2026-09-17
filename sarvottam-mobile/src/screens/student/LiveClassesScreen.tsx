import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { LIVE_CLASSES_DATA } from '../../data/liveClassesData';
import { LiveClass } from '../../types';
import { CustomButton } from '../../components/common/CustomButton';

interface LiveClassesScreenProps {
  onBack: () => void;
}

export const LiveClassesScreen: React.FC<LiveClassesScreenProps> = ({ onBack }) => {
  const [activeClass, setActiveClass] = useState<LiveClass | null>(null);
  const [chatMessages, setChatMessages] = useState<string[]>([
    'Dr. Verma: Welcome students! Turn to page 12 of your Plant Physiology sheet.',
    'Aarav: Sir, is glycolysis substrate-level phosphorylation asked in Section A?',
    'Dr. Verma: Yes Aarav, exactly! 2 ATPs net yield via SLP in cytoplasm.',
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleSendChat = () => {
    if (!inputMsg.trim()) return;
    setChatMessages((prev) => [...prev, `You: ${inputMsg.trim()}`]);
    setInputMsg('');
  };

  if (activeClass) {
    return (
      <View style={styles.classroomContainer}>
        {/* Top Classroom Bar */}
        <View style={styles.classTopBar}>
          <TouchableOpacity onPress={() => setActiveClass(null)} style={styles.leaveBtn}>
            <Text style={styles.leaveText}>‹ Leave Room</Text>
          </TouchableOpacity>
          <View style={styles.liveTagWrap}>
            <View style={styles.redDot} />
            <Text style={styles.liveTagText}>LIVE · {activeClass.attendeesCount + 1} ONLINE</Text>
          </View>
        </View>

        {/* Simulated Video Player Screen */}
        <View style={styles.videoPlayerBox}>
          <View style={styles.instructorBadge}>
            <Text style={styles.instructorIcon}>👨‍🏫</Text>
            <View>
              <Text style={styles.instructorName}>{activeClass.instructor}</Text>
              <Text style={styles.instructorSub}>{activeClass.instructorTitle}</Text>
            </View>
          </View>

          {/* Whiteboard / Topic Display */}
          <View style={styles.whiteboard}>
            <Text style={styles.wbHeader}>SARVOTTAM SMART WHITEBOARD</Text>
            <Text style={styles.wbTopic}>{activeClass.topic}</Text>
            <Text style={styles.wbFormula}>C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 36/38 ATP</Text>
            <View style={styles.audioWave}>
              <Text style={styles.waveText}>🎙️ Live Audio Streaming (Active)</Text>
            </View>
          </View>
        </View>

        {/* Live Chat & Q&A Feed */}
        <View style={styles.chatSection}>
          <Text style={styles.chatTitle}>Live Student Chat & Doubts</Text>
          <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
            {chatMessages.map((msg, i) => (
              <View key={i} style={styles.chatBubble}>
                <Text style={styles.chatText}>{msg}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Ask a live doubt to faculty..."
              placeholderTextColor="#94a3b8"
              value={inputMsg}
              onChangeText={setInputMsg}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendChat}>
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>🔴 DIGITAL CLASSROOM</Text>
        </View>
        <Text style={styles.title}>Live Interactive Classes</Text>
        <Text style={styles.subtitle}>
          Two-way live interactive lectures with top faculty, instant in-class doubt clearing, and recorded archives.
        </Text>
      </View>

      {LIVE_CLASSES_DATA.map((item) => {
        const isLive = item.status === 'LIVE_NOW';

        return (
          <View key={item.id} style={[styles.classCard, isLive && styles.liveCardBorder]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.statusPill, isLive ? styles.statusPillLive : styles.statusPillUpcoming]}>
                {isLive && <View style={styles.redDot} />}
                <Text style={[styles.statusPillText, isLive ? styles.statusTextLive : styles.statusTextUpcoming]}>
                  {item.status === 'LIVE_NOW' ? 'LIVE NOW' : 'UPCOMING'}
                </Text>
              </View>
              <Text style={styles.streamBadge}>{item.stream}</Text>
            </View>

            <Text style={styles.classTitle}>{item.title}</Text>
            <Text style={styles.topicText}>Topic: {item.topic}</Text>

            <View style={styles.instructorRow}>
              <Text style={styles.facultyIcon}>👨‍🏫</Text>
              <View>
                <Text style={styles.facultyName}>{item.instructor}</Text>
                <Text style={styles.facultyTitle}>{item.instructorTitle}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaItem}>⏰ {item.startTime}</Text>
              <Text style={styles.metaItem}>⏳ {item.duration}</Text>
              <Text style={styles.metaItem}>👥 {item.attendeesCount} Registered</Text>
            </View>

            <CustomButton
              title={isLive ? "Join Live Classroom Now →" : "Set Class Reminder 🔔"}
              onPress={() => setActiveClass(item)}
              variant={isLive ? "primary" : "secondary"}
              style={styles.joinBtn}
            />
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
  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    marginBottom: 6,
  },
  headerBadgeText: {
    color: '#ef4444',
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
  classCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0e1f3d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  liveCardBorder: {
    borderColor: '#ef4444',
    borderWidth: 1.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
  },
  statusPillLive: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  statusPillUpcoming: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  statusTextLive: {
    color: '#ef4444',
  },
  statusTextUpcoming: {
    color: '#3b82f6',
  },
  streamBadge: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '800',
  },
  classTitle: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  topicText: {
    color: '#475569',
    fontSize: 12.5,
    marginTop: 4,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    marginVertical: 10,
  },
  facultyIcon: {
    fontSize: 24,
  },
  facultyName: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '800',
  },
  facultyTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    color: '#64748b',
    fontSize: 11.5,
    fontWeight: '600',
  },
  joinBtn: {
    marginTop: 4,
  },
  // Classroom Full-Screen State
  classroomContainer: {
    flex: 1,
    backgroundColor: '#050b17',
  },
  classTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0e1f3d',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  leaveBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  leaveText: {
    color: COLORS.goldBright,
    fontSize: 14,
    fontWeight: '700',
  },
  liveTagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  liveTagText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '900',
  },
  videoPlayerBox: {
    height: 230,
    backgroundColor: '#0a1426',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.goldBorder,
    padding: 14,
    justifyContent: 'space-between',
  },
  instructorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(14, 31, 61, 0.7)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructorIcon: {
    fontSize: 20,
  },
  instructorName: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  instructorSub: {
    color: COLORS.goldBright,
    fontSize: 9.5,
  },
  whiteboard: {
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201, 152, 42, 0.3)',
  },
  wbHeader: {
    color: COLORS.goldBright,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  wbTopic: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  wbFormula: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  audioWave: {
    marginTop: 6,
  },
  waveText: {
    color: '#94a3b8',
    fontSize: 10,
  },
  chatSection: {
    flex: 1,
    backgroundColor: '#09152b',
    padding: 14,
  },
  chatTitle: {
    color: COLORS.cream,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingBottom: 8,
  },
  chatBubble: {
    backgroundColor: 'rgba(14, 31, 61, 0.85)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.goldBright,
  },
  chatText: {
    color: '#e2e8f0',
    fontSize: 12,
    lineHeight: 16,
  },
  chatInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#0e1f3d',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendBtn: {
    backgroundColor: COLORS.goldBright,
    borderRadius: 100,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendBtnText: {
    color: COLORS.navyDeep,
    fontWeight: '800',
    fontSize: 12,
  },
});
