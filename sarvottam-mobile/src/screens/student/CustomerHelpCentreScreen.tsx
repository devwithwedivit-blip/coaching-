import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { CustomButton } from '../../components/common/CustomButton';
import { GlassCard } from '../../components/common/GlassCard';

interface CustomerHelpCentreScreenProps {
  onBack: () => void;
}

export const CustomerHelpCentreScreen: React.FC<CustomerHelpCentreScreenProps> = ({ onBack }) => {
  const handlePhoneCall = (num: string) => {
    Linking.openURL(`tel:${num}`).catch(() => {
      Alert.alert('Phone Helpline', `Dial: +91 ${num}`);
    });
  };

  const handleEmail = () => {
    Linking.openURL('mailto:teamsntra@gmail.com?subject=Inquiry%20Sarvottam%20Institutes').catch(() => {
      Alert.alert('Official Email', 'Send inquiry to: teamsntra@gmail.com');
    });
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/917310810875?text=Hello%20Sarvottam%20Institutes,%20I%20have%20an%20inquiry%20regarding%20courses%20and%20CBT%20exams.').catch(() => {
      Alert.alert('WhatsApp Helpline', 'Chat with us at: +91 7310810875');
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>24/7 HELPLINE & ADMISSIONS</Text>
        </View>
        <Text style={styles.title}>Customer & Student Support</Text>
        <Text style={styles.subtitle}>
          Connect directly with Sarvottam admissions officers, academic counselors, and technical exam operators.
        </Text>
      </View>

      {/* Emergency Hotlines Card */}
      <GlassCard variant="dark" style={styles.hotlineCard}>
        <Text style={styles.hotlineTag}>INSTANT VOICE HELPLINES</Text>
        <Text style={styles.hotlineTitle}>Toll-Free & Direct Helpline Numbers</Text>
        <Text style={styles.hotlineDesc}>
          Available 7 days a week (7:00 AM – 10:00 PM IST) for admission queries and test assistance.
        </Text>

        <View style={styles.phoneActionRow}>
          <TouchableOpacity
            style={styles.phonePill}
            onPress={() => handlePhoneCall('7310810875')}
            activeOpacity={0.8}
          >
            <Text style={styles.phoneIcon}>📞</Text>
            <View>
              <Text style={styles.phoneNum}>+91 7310810875</Text>
              <Text style={styles.phoneSub}>Primary Admissions Desk</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.phonePill}
            onPress={() => handlePhoneCall('8077024357')}
            activeOpacity={0.8}
          >
            <Text style={styles.phoneIcon}>📞</Text>
            <View>
              <Text style={styles.phoneNum}>+91 8077024357</Text>
              <Text style={styles.phoneSub}>Technical & CBT Support</Text>
            </View>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Digital Support Channels */}
      <Text style={styles.channelHeading}>Digital Support Channels</Text>

      {/* WhatsApp Chat Card */}
      <TouchableOpacity
        style={styles.channelCard}
        onPress={handleWhatsApp}
        activeOpacity={0.7}
      >
        <View style={[styles.channelIconWrap, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
          <Text style={styles.channelIcon}>💬</Text>
        </View>
        <View style={styles.channelInfo}>
          <Text style={styles.channelTitle}>Chat on WhatsApp</Text>
          <Text style={styles.channelSub}>Direct chat with Senior Academic Counselors</Text>
          <Text style={styles.channelAction}>Open WhatsApp Chat →</Text>
        </View>
      </TouchableOpacity>

      {/* Official Email Card */}
      <TouchableOpacity
        style={styles.channelCard}
        onPress={handleEmail}
        activeOpacity={0.7}
      >
        <View style={[styles.channelIconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
          <Text style={styles.channelIcon}>✉️</Text>
        </View>
        <View style={styles.channelInfo}>
          <Text style={styles.channelTitle}>Email Inquiries & Grievances</Text>
          <Text style={styles.channelSub}>teamsntra@gmail.com</Text>
          <Text style={styles.channelAction}>Compose Official Email →</Text>
        </View>
      </TouchableOpacity>

      {/* Campus Locations Card */}
      <View style={styles.campusCard}>
        <Text style={styles.campusHeading}>🏫 Head Office & Examination Center</Text>
        <Text style={styles.campusName}>Sarvottam Institutes Main Campus</Text>
        <Text style={styles.campusAddr}>
          SNTRA Educational Towers, Knowledge Corridor, Near Central Metro, India.
        </Text>
        <Text style={styles.campusHours}>
          🕒 Visiting Hours: Monday to Saturday, 8:30 AM – 7:30 PM
        </Text>
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
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    marginBottom: 6,
  },
  badgeText: {
    color: '#ec4899',
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
  hotlineCard: {
    padding: 20,
    marginBottom: 20,
  },
  hotlineTag: {
    color: COLORS.goldBright,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  hotlineTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
  },
  hotlineDesc: {
    color: COLORS.textDarkMuted,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 14,
  },
  phoneActionRow: {
    gap: 10,
  },
  phonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(5, 11, 23, 0.6)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  phoneIcon: {
    fontSize: 20,
  },
  phoneNum: {
    color: COLORS.goldBright,
    fontSize: 15,
    fontWeight: '900',
  },
  phoneSub: {
    color: COLORS.cream,
    fontSize: 11,
    opacity: 0.8,
  },
  channelHeading: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  channelCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0e1f3d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  channelIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelIcon: {
    fontSize: 22,
  },
  channelInfo: {
    flex: 1,
  },
  channelTitle: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: '800',
  },
  channelSub: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  channelAction: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  campusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  campusHeading: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '800',
  },
  campusName: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 6,
  },
  campusAddr: {
    color: '#475569',
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
  },
  campusHours: {
    color: COLORS.gold,
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 8,
  },
});
