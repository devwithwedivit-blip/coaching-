import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { CustomButton } from '../../components/common/CustomButton';
import { GlassCard } from '../../components/common/GlassCard';

interface StudentLoginScreenProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const StudentLoginScreen: React.FC<StudentLoginScreenProps> = ({ onSuccess, onBack }) => {
  const { loginAsStudent } = useAuth();

  const [fullName, setFullName] = useState('Aarav Sharma');
  const [age, setAge] = useState('180506'); // 18 May 2006
  const [email, setEmail] = useState('aarav.sharma@gmail.com');
  const [phone, setPhone] = useState('9876543210');
  const [targetExam, setTargetExam] = useState('NEET (UG) 2024');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const exams = ['NEET (UG) 2024', 'IIT-JEE Mains', 'Defense (NDA)', 'UPSC Civil Services', 'CBSE Class 12'];

  const validateAgeDDMMYY = (val: string) => {
    if (!val) return false;
    const clean = val.replace(/[\/\-\s]/g, '');
    if (clean.length !== 6 && clean.length !== 8) return false;
    const d = parseInt(clean.slice(0, 2), 10);
    const m = parseInt(clean.slice(2, 4), 10);
    if (isNaN(d) || d < 1 || d > 31) return false;
    if (isNaN(m) || m < 1 || m > 12) return false;
    return true;
  };

  const handleRegister = async () => {
    setErrorMessage('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your authentic full name (at least 2 characters).');
      return;
    }

    if (!validateAgeDDMMYY(age)) {
      setErrorMessage('Please enter a valid DOB / Age in DDMMYY format (e.g. 180506 for 18 May 2006).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address for your scorecard report.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      await loginAsStudent({
        fullName,
        age,
        email,
        phone: cleanPhone,
        targetExam,
      });
      setLoading(false);
      onSuccess();
    } catch (err) {
      setLoading(false);
      setErrorMessage('Failed to register. Please check your network connection.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeText}>NTA Official Verification</Text>
          </View>
          <Text style={styles.title}>Student Verification & Entry</Text>
          <Text style={styles.subtitle}>
            Enter candidate credentials to access courses, live classes, and launch CBT examinations.
          </Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <GlassCard variant="dark" style={styles.formCard}>
          {/* Full Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Student Full Name <Text style={styles.req}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Aarav Sharma"
              placeholderTextColor="#64748b"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Age in DDMMYY */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Age / DOB in DDMMYY <Text style={styles.req}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="DDMMYY (e.g. 180506 for 18 May 2006)"
              placeholderTextColor="#64748b"
              value={age}
              onChangeText={setAge}
              maxLength={10}
            />
            <Text style={styles.helperText}>Used for official roll number & age category verification</Text>
          </View>

          {/* Email ID */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Email ID <Text style={styles.req}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. student@gmail.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Phone Number */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              10-Digit Mobile Number <Text style={styles.req}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9876543210"
              placeholderTextColor="#64748b"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Target Exam */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Primary Target Stream</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examScroll}>
              {exams.map((ex) => (
                <TouchableOpacity
                  key={ex}
                  style={[styles.examPill, targetExam === ex && styles.examPillActive]}
                  onPress={() => setTargetExam(ex)}
                >
                  <Text style={[styles.examPillText, targetExam === ex && styles.examPillTextActive]}>
                    {ex}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <CustomButton
            title="Enter Student Portal →"
            onPress={handleRegister}
            variant="primary"
            loading={loading}
            style={styles.submitBtn}
          />
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.navyDeep,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  backBtn: {
    marginBottom: 12,
  },
  backText: {
    color: COLORS.goldBright,
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    marginBottom: 20,
  },
  badgeWrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    marginBottom: 8,
  },
  badgeText: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    color: COLORS.cream,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.textDarkMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12.5,
    fontWeight: '600',
  },
  formCard: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.cream,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  req: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: 'rgba(5, 11, 23, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.cream,
    fontSize: 14,
  },
  helperText: {
    color: COLORS.textDarkMuted,
    fontSize: 11,
    marginTop: 4,
  },
  examScroll: {
    flexDirection: 'row',
    marginTop: 6,
  },
  examPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    marginRight: 8,
  },
  examPillActive: {
    backgroundColor: 'rgba(201, 152, 42, 0.2)',
    borderColor: COLORS.goldBright,
  },
  examPillText: {
    color: COLORS.textDarkMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  examPillTextActive: {
    color: COLORS.goldBright,
    fontWeight: '800',
  },
  submitBtn: {
    marginTop: 8,
  },
});
