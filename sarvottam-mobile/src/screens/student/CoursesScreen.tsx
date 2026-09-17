import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { COURSES_DATA } from '../../data/coursesData';
import { CourseVertical } from '../../types';
import { CustomButton } from '../../components/common/CustomButton';

interface CoursesScreenProps {
  onSelectCourse: (course: CourseVertical) => void;
  onLaunchCbtMock: () => void;
}

export const CoursesScreen: React.FC<CoursesScreenProps> = ({
  onSelectCourse,
  onLaunchCbtMock,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>('neet');

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.kickerPill}>
          <Text style={styles.kickerText}>ADMISSIONS 2026–2027</Text>
        </View>
        <Text style={styles.title}>Academic Verticals</Text>
        <Text style={styles.subtitle}>
          Comprehensive classroom coaching, specialized test series, and dedicated faculty mentorship across 7 flagship streams.
        </Text>
      </View>

      {/* 7 Accordion Cards */}
      {COURSES_DATA.map((course) => {
        const isExpanded = expandedId === course.id;

        return (
          <View key={course.id} style={styles.courseCard}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => toggleExpand(course.id)}
              activeOpacity={0.7}
            >
              <View style={styles.headerLeft}>
                <View style={styles.numBadge}>
                  <Text style={styles.numText}>{course.num}</Text>
                </View>
                <View style={styles.titleInfo}>
                  <Text style={styles.badgeLabel}>{course.badge}</Text>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                </View>
              </View>
              <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.cardBody}>
                <Image source={{ uri: course.bannerImage }} style={styles.bannerImg} />

                <Text style={styles.desc}>{course.description}</Text>

                <View style={styles.detailBlock}>
                  <Text style={styles.blockTitle}>Classroom & Mock Offerings:</Text>
                  {course.offerings.map((offering, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.bulletText}>{offering}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Batch Timings:</Text>
                  <Text style={styles.infoValue}>{course.batchSchedule}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Academic Head:</Text>
                  <Text style={styles.infoValue}>{course.facultyLead}</Text>
                </View>

                <View style={styles.actionRow}>
                  <CustomButton
                    title="Full Syllabus & Details →"
                    onPress={() => onSelectCourse(course)}
                    variant="secondary"
                    size="small"
                    style={{ flex: 1 }}
                  />
                  {course.id === 'neet' && (
                    <CustomButton
                      title="Launch Mock CBT 💻"
                      onPress={onLaunchCbtMock}
                      variant="primary"
                      size="small"
                      style={{ flex: 1 }}
                    />
                  )}
                </View>
              </View>
            )}
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
  header: {
    marginBottom: 20,
  },
  kickerPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201, 152, 42, 0.12)',
    borderColor: COLORS.goldBorder,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    marginBottom: 6,
  },
  kickerText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
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
  courseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#0e1f3d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  numBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(14, 31, 61, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: '900',
  },
  titleInfo: {
    flex: 1,
  },
  badgeLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  courseTitle: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 1,
  },
  expandIcon: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gold,
    marginLeft: 8,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 14,
  },
  bannerImg: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  desc: {
    color: '#334155',
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 14,
  },
  detailBlock: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  blockTitle: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.goldBright,
    marginTop: 5,
  },
  bulletText: {
    color: '#475569',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 11.5,
    fontWeight: '600',
  },
  infoValue: {
    color: COLORS.navy,
    fontSize: 11.5,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
});
