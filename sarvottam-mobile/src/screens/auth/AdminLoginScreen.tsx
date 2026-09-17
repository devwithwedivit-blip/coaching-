import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { CustomButton } from '../../components/common/CustomButton';
import { GlassCard } from '../../components/common/GlassCard';

interface AdminLoginScreenProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ onSuccess, onBack }) => {
  const { loginAsAdmin } = useAuth();

  const [adminName, setAdminName] = useState('Administrator');
  const [email, setEmail] = useState('admin@sarvottam.ac.in');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRequestCode = async () => {
    setErrorMessage('');
    setStatusMessage('');

    if (!adminName.trim() || adminName.trim().length < 2) {
      setErrorMessage('Please enter an Admin Name (at least 2 characters).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid official email address.');
      return;
    }

    setLoading(true);
    const res = await apiService.requestAdminCode(adminName, email);
    setLoading(false);

    if (res.success) {
      setCodeSent(true);
      setStatusMessage('Verification code generated. Use code from server console or bypass code 000000.');
    } else {
      setErrorMessage(res.error || 'Failed to request verification code.');
    }
  };

  const handleVerifyCode = async (overrideCode?: string) => {
    const codeToVerify = overrideCode || code;
    setErrorMessage('');

    if (!codeToVerify || codeToVerify.trim().length !== 6) {
      setErrorMessage('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    const res = await apiService.verifyAdminCode(email, codeToVerify);
    setLoading(false);

    if (res.success && res.admin) {
      await loginAsAdmin(res.admin);
      onSuccess();
    } else {
      setErrorMessage(res.error || 'Invalid verification code. Try bypass code 000000.');
    }
  };

  const handleDirectLogin = async () => {
    setLoading(true);
    const res = await apiService.directAdminLogin(adminName, email);
    setLoading(false);

    if (res.success && res.admin) {
      await loginAsAdmin(res.admin);
      onSuccess();
    } else {
      setErrorMessage('Direct login failed.');
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
            <Text style={styles.badgeText}>🔒 Antigravity 2FA Gateway</Text>
          </View>
          <Text style={styles.title}>Admin Authentication</Text>
          <Text style={styles.subtitle}>
            Secure cryptographic access to SNTRA Examination Engine Telemetry and Candidate Registry.
          </Text>
        </View>

        {statusMessage ? (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <GlassCard variant="dark" style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Admin Name</Text>
            <TextInput
              style={styles.input}
              value={adminName}
              onChangeText={setAdminName}
              placeholder="e.g. Administrator"
              placeholderTextColor="#64748b"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Official Admin Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. admin@sarvottam.ac.in"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {!codeSent ? (
            <CustomButton
              title="Request 6-Digit OTP Code →"
              onPress={handleRequestCode}
              variant="outline"
              loading={loading}
              style={styles.actionBtn}
            />
          ) : (
            <View style={styles.otpSection}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Enter 6-Digit OTP Code</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  value={code}
                  onChangeText={setCode}
                  placeholder="000000"
                  placeholderTextColor="#64748b"
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <CustomButton
                title="Verify & Enter Dashboard →"
                onPress={() => handleVerifyCode()}
                variant="primary"
                loading={loading}
                style={styles.actionBtn}
              />
            </View>
          )}

          {/* Quick Developer Bypass Shortcuts */}
          <View style={styles.bypassSection}>
            <Text style={styles.bypassHeader}>Quick Dev Bypass Codes:</Text>
            <View style={styles.bypassRow}>
              {['000000', '123456', '888888'].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={styles.bypassPill}
                  onPress={() => {
                    setCode(c);
                    handleVerifyCode(c);
                  }}
                >
                  <Text style={styles.bypassText}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* One-Tap Direct Login Button */}
          <View style={styles.directLoginWrap}>
            <CustomButton
              title="⚡ 1-Tap Direct Admin Login"
              onPress={handleDirectLogin}
              variant="secondary"
              loading={loading}
              style={styles.directBtn}
            />
          </View>
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
    backgroundColor: 'rgba(201, 152, 42, 0.15)',
    borderColor: COLORS.goldBright,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    marginBottom: 8,
  },
  badgeText: {
    color: COLORS.goldBright,
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
  statusCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statusText: {
    color: '#10b981',
    fontSize: 12.5,
    fontWeight: '600',
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
  otpSection: {
    marginTop: 6,
  },
  otpInput: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 6,
    color: COLORS.goldBright,
    borderColor: COLORS.goldBorder,
  },
  actionBtn: {
    marginTop: 6,
  },
  bypassSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  bypassHeader: {
    color: COLORS.textDarkMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  bypassRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bypassPill: {
    backgroundColor: 'rgba(201, 152, 42, 0.12)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bypassText: {
    color: COLORS.goldBright,
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  directLoginWrap: {
    marginTop: 16,
  },
  directBtn: {
    width: '100%',
  },
});
