import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { CourseVertical } from '../../types';
import { CustomButton } from '../../components/common/CustomButton';
import { GlassCard } from '../../components/common/GlassCard';

interface CourseDetailScreenProps {
  course: CourseVertical;
  onBack: () => void;
  onLaunchCbt: () => void;
}

export const CourseDetailScreen: React.FC<CourseDetailScreenProps> = ({
  course,
  onBack,
  onLaunchCbt,
}) => {
  const [enrolled, setEnrolled] = useState(false);

  const handleEnroll = () => {
    setEnrolled(true);
    Alert.alert(
      'Admission Inquiry Sent!',
      `Thank you! Your enrollment request for ${course.title} has been forwarded to the Sarvottam Academic Counselor. We will reach you on your registered phone/email.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>‹ Back to Courses</Text>
      </TouchableOpacity>

      <View style={styles.bannerWrap}>
        <Image source={{ uri: course.bannerImage }} style={styles.bannerImg} />
        <View style={styles.bannerOverlay}>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>{course.badge}</Text>
          </View>
          <Text style={styles.bannerTitle}>{course.title}</Text>
          <Text style={styles.bannerSub}>{course.subtitle}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionHeading}>About the Program</Text>
        <Text style={styles.descText}>{course.description}</Text>

        <Text style={styles.sectionHeading}>Curriculum & Classroom Programs</Text>
        <GlassCard variant="light" style={styles.infoCard}>
          {course.offerings.map((item, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </GlassCard>

        <Text style={styles.sectionHeading}>Program Highlights</Text>
        <GlassCard variant="light" style={styles.infoCard}>
          {course.features.map((item, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </GlassCard>

        <GlassCard variant="gold" style={styles.mentorCard}>
          <Text style={styles.mentorLabel}>Academic Head & Faculty Lead</Text>
          <Text style={styles.mentorName}>{course.facultyLead}</Text>
          <Text style={styles.batchLabel}>Batch Schedule: {course.batchSchedule}</Text>
        </GlassCard>

        <View style={styles.actionWrap}>
          <CustomButton
            title={enrolled ? "Inquiry Received ✓" : "Inquire for Admission / Seat Booking →"}
            onPress={handleEnroll}
            variant={enrolled ? "success" : "primary"}
            style={styles.enrollBtn}
          />
          <CustomButton
            title="Launch Mock CBT Exam 💻"
            onPress={onLaunchCbt}
            variant="outline"
            style={{ marginTop: 10 }}
          />
        </View>
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
    paddingBottom: 40,
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  backText: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '700',
  },
  bannerWrap: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.navy,
  },
  bannerImg: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  bannerOverlay: {
    position: 'absolute',
    inset: 0,
    padding: 16,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5, 11, 23, 0.4)',
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.goldBright,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    marginBottom: 6,
  },
  badgeText: {
    color: COLORS.navyDeep,
    fontSize: 10,
    fontWeight: '800',
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  bannerSub: {
    color: COLORS.cream,
    fontSize: 12,
    marginTop: 2,
    opacity: 0.9,
  },
  body: {
    padding: 16,
  },
  sectionHeading: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  descText: {
    color: '#334155',
    fontSize: 13.5,
    lineHeight: 20,
  },
  infoCard: {
    padding: 14,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  checkIcon: {
    color: '#10b981',
    fontWeight: '900',
    fontSize: 14,
  },
  starIcon: {
    color: COLORS.goldBright,
    fontWeight: '900',
    fontSize: 14,
  },
  bulletText: {
    color: '#334155',
    fontSize: 12.5,
    flex: 1,
    lineHeight: 18,
  },
  mentorCard: {
    padding: 16,
    marginTop: 14,
  },
  mentorLabel: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  mentorName: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  batchLabel: {
    color: '#475569',
    fontSize: 12,
    marginTop: 4,
  },
  actionWrap: {
    marginTop: 20,
  },
  enrollBtn: {
    width: '100%',
  },
});
