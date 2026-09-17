import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { COURSES_DATA } from '../../data/coursesData';
import { LIVE_CLASSES_DATA } from '../../data/liveClassesData';
import { GlassCard } from '../../components/common/GlassCard';

interface HomeScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { student } = useAuth();
  const activeLive = LIVE_CLASSES_DATA.find((c) => c.status === 'LIVE_NOW');

  const quickFeatures = [
    { id: 'cbt', title: 'CBT Exam Room', icon: '💻', badge: 'LIVE', color: '#10b981', target: 'cbt_list' },
    { id: 'live', title: 'Live Classes', icon: '🔴', badge: 'NOW', color: '#ef4444', target: 'live_classes' },
    { id: 'videos', title: 'Video Lectures', icon: '🎬', color: '#3b82f6', target: 'video_lectures' },
    { id: 'pdfs', title: 'PDFs & Notes', icon: '📄', color: '#8b5cf6', target: 'study_materials' },
    { id: 'doubts', title: 'Doubt Hub', icon: '💬', color: '#f59e0b', target: 'doubts_hub' },
    { id: 'help_student', title: 'Student Help', icon: '🎓', color: '#06b6d4', target: 'student_help' },
    { id: 'help_customer', title: '24/7 Helpline', icon: '🎧', color: '#ec4899', target: 'customer_help' },
    { id: 'courses', title: 'All 7 Courses', icon: '📚', color: COLORS.gold, target: 'courses' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroGreeting}>Welcome back,</Text>
          <Text style={styles.heroName}>{student ? student.fullName : 'Future Doctor / Scholar'}</Text>
          <View style={styles.rollPill}>
            <Text style={styles.rollText}>Roll: {student ? student.rollNo : 'NEET2024-CANDIDATE'}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.heroExamBtn}
          onPress={() => onNavigate('cbt_active')}
          activeOpacity={0.8}
        >
          <Text style={styles.heroExamIcon}>💻</Text>
          <Text style={styles.heroExamTitle}>Launch CBT</Text>
          <Text style={styles.heroExamSub}>50 Questions</Text>
        </TouchableOpacity>
      </View>

      {/* Live Class Notice Banner */}
      {activeLive && (
        <TouchableOpacity
          style={styles.liveBanner}
          onPress={() => onNavigate('live_classes')}
          activeOpacity={0.85}
        >
          <View style={styles.liveIndicator}>
            <View style={styles.livePulseDot} />
            <Text style={styles.liveLabel}>HAPPENING NOW</Text>
          </View>
          <Text style={styles.liveTitle} numberOfLines={1}>
            {activeLive.title}
          </Text>
          <Text style={styles.liveTeacher}>
            {activeLive.instructor} ({activeLive.stream}) · {activeLive.attendeesCount} Students Joined
          </Text>
          <View style={styles.liveJoinRow}>
            <Text style={styles.liveJoinText}>Join Room Now →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Quick Access Action Grid */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>Learning Portals & Features</Text>
        <Text style={styles.sectionSubtitle}>Select any module to start studying immediately</Text>

        <View style={styles.grid}>
          {quickFeatures.map((feat) => (
            <TouchableOpacity
              key={feat.id}
              style={styles.gridCard}
              onPress={() => onNavigate(feat.target)}
              activeOpacity={0.7}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: feat.color + '18' }]}>
                <Text style={styles.gridIcon}>{feat.icon}</Text>
                {feat.badge && (
                  <View style={[styles.gridBadge, { backgroundColor: feat.color }]}>
                    <Text style={styles.gridBadgeText}>{feat.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.gridCardTitle}>{feat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Flagship Academic Streams Horizontal Carousel */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>7 Flagship Streams</Text>
            <Text style={styles.sectionSubtitle}>Admissions Open for 2026–2027</Text>
          </View>
          <TouchableOpacity onPress={() => onNavigate('courses')}>
            <Text style={styles.seeAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.streamScroll}>
          {COURSES_DATA.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.streamCard}
              onPress={() => onNavigate('course_detail', { course: c })}
              activeOpacity={0.8}
            >
              <Image source={{ uri: c.bannerImage }} style={styles.streamImg} />
              <View style={styles.streamOverlay}>
                <View style={styles.streamBadge}>
                  <Text style={styles.streamBadgeText}>{c.badge}</Text>
                </View>
                <Text style={styles.streamTitle}>{c.title}</Text>
                <Text style={styles.streamSub} numberOfLines={2}>
                  {c.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Trust Badges / Stats Bar */}
      <GlassCard variant="dark" style={styles.statsCard}>
        <View style={styles.statCol}>
          <Text style={styles.statNum}>25,000+</Text>
          <Text style={styles.statLabel}>Students Guided</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Text style={styles.statNum}>98.4%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Text style={styles.statNum}>50+</Text>
          <Text style={styles.statLabel}>Top Faculty</Text>
        </View>
      </GlassCard>
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
    paddingBottom: 32,
  },
  heroBanner: {
    backgroundColor: COLORS.navy,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: COLORS.goldBorder,
    shadowColor: COLORS.navyDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroLeft: {
    flex: 1,
  },
  heroGreeting: {
    color: COLORS.textDarkMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  heroName: {
    color: COLORS.cream,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  rollPill: {
    backgroundColor: 'rgba(201, 152, 42, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },
  rollText: {
    color: COLORS.goldBright,
    fontSize: 10.5,
    fontWeight: '700',
  },
  heroExamBtn: {
    backgroundColor: COLORS.goldBright,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  heroExamIcon: {
    fontSize: 20,
  },
  heroExamTitle: {
    color: COLORS.navyDeep,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  heroExamSub: {
    color: COLORS.navyDeep,
    fontSize: 9,
    fontWeight: '700',
    opacity: 0.8,
  },
  liveBanner: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  liveLabel: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  liveTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  liveTeacher: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  liveJoinRow: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
  },
  liveJoinText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '800',
  },
  sectionWrap: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  seeAllText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  gridCard: {
    width: '23%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0e1f3d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  gridIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  gridIcon: {
    fontSize: 22,
  },
  gridBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  gridBadgeText: {
    color: '#ffffff',
    fontSize: 7.5,
    fontWeight: '900',
  },
  gridCardTitle: {
    color: COLORS.navy,
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  streamScroll: {
    marginTop: 10,
  },
  streamCard: {
    width: 220,
    height: 140,
    borderRadius: 16,
    marginRight: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.navy,
  },
  streamImg: {
    width: '100%',
    height: '100%',
    opacity: 0.55,
  },
  streamOverlay: {
    position: 'absolute',
    inset: 0,
    padding: 14,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5, 11, 23, 0.45)',
  },
  streamBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.goldBright,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    marginBottom: 4,
  },
  streamBadgeText: {
    color: COLORS.navyDeep,
    fontSize: 9,
    fontWeight: '800',
  },
  streamTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  streamSub: {
    color: COLORS.cream,
    fontSize: 10.5,
    opacity: 0.85,
    marginTop: 2,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  statCol: {
    alignItems: 'center',
  },
  statNum: {
    color: COLORS.goldBright,
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: COLORS.textDarkMuted,
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
