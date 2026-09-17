import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';
import { useExam } from '../../context/ExamContext';

export const ExamTimer: React.FC = () => {
  const { timeRemainingSeconds } = useExam();

  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const isUrgent = timeRemainingSeconds < 5 * 60;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <View style={[styles.container, isUrgent && styles.urgentContainer]}>
      <Text style={styles.clockIcon}>⏱️</Text>
      <Text style={[styles.timerText, isUrgent && styles.urgentText]}>
        {formattedTime}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(5, 11, 23, 0.7)',
    borderColor: 'rgba(201, 152, 42, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  urgentContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
  },
  clockIcon: {
    fontSize: 13,
  },
  timerText: {
    color: COLORS.goldBright,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  urgentText: {
    color: '#ef4444',
  },
});
