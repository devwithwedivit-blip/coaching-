import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { COLORS } from '../../constants/theme';

export type TabScreenName = 'home' | 'courses' | 'cbt' | 'doubts' | 'profile';

interface TabBarProps {
  currentTab: TabScreenName;
  onSelectTab: (tab: TabScreenName) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onSelectTab }) => {
  const tabs: { key: TabScreenName; label: string; icon: string; badge?: string }[] = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'courses', label: 'Courses', icon: '📚' },
    { key: 'cbt', label: 'CBT Exam', icon: '💻', badge: 'LIVE' },
    { key: 'doubts', label: 'Doubts', icon: '💬' },
    { key: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, isActive && styles.activeTabBtn]}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrap}>
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                {tab.badge && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.navyDeep,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.navy,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.goldBorder,
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    position: 'relative',
    minWidth: 58,
  },
  activeTabBtn: {
    backgroundColor: 'rgba(201, 152, 42, 0.12)',
  },
  iconWrap: {
    position: 'relative',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  badgePill: {
    position: 'absolute',
    top: -4,
    right: -12,
    backgroundColor: '#10b981',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.textDarkMuted,
    marginTop: 2,
  },
  activeTabLabel: {
    color: COLORS.goldBright,
    fontWeight: '800',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.goldBright,
  },
});
