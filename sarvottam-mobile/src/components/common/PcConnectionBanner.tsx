import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { relayClient } from '../../services/relay/relayClient';
import { RelayDeviceStatus } from '../../types';

export const PcConnectionBanner: React.FC = () => {
  const [status, setStatus] = useState<RelayDeviceStatus>(relayClient.getStatus());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  useEffect(() => {
    relayClient.getBaseUrl().then(setCurrentUrl);
    const unsubscribe = relayClient.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });
    return () => unsubscribe();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const url = await relayClient.getBaseUrl();
    setCurrentUrl(url);
    await relayClient.fetchStatus();
    await relayClient.fetchFiles();
    setIsRefreshing(false);
  };

  const handleChangeUrl = () => {
    if (typeof window !== 'undefined' && window.prompt) {
      const newUrl = window.prompt('Enter Cloud Relay Server URL:', currentUrl);
      if (newUrl && newUrl.trim()) {
        relayClient.setBaseUrl(newUrl.trim()).then(() => {
          setCurrentUrl(newUrl.trim());
          handleRefresh();
        });
      }
    }
  };

  return (
    <View style={[styles.container, status.pcOnline ? styles.onlineBorder : styles.offlineBorder]}>
      <View style={styles.leftCol}>
        <View style={styles.statusRow}>
          <View style={[styles.dot, status.pcOnline ? styles.dotOnline : styles.dotOffline]} />
          <Text style={styles.statusTitle}>
            {status.pcOnline ? 'PC STORAGE ONLINE' : 'PC STORAGE OFFLINE'}
          </Text>
          <Text style={styles.deviceBadge}>{status.deviceName || 'Host PC'}</Text>
        </View>

        <Text style={styles.statusSub}>
          {status.pcOnline
            ? `Direct streaming active · ${status.filesCount} files ready (Videos & PDFs)`
            : status.lastSeen
            ? `Last seen: ${new Date(status.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Waiting for PC to connect`
            : `Connecting to ${currentUrl || 'Relay Server'}...`}
        </Text>

        <TouchableOpacity onPress={handleChangeUrl} activeOpacity={0.7} style={{ marginTop: 3 }}>
          <Text style={styles.urlHint}>
            Server: {currentUrl} {status.pcOnline ? '✓' : '(Tap to change)'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.refreshBtn}
        onPress={handleRefresh}
        disabled={isRefreshing}
        activeOpacity={0.7}
      >
        {isRefreshing ? (
          <ActivityIndicator size="small" color="#94a3b8" />
        ) : (
          <Text style={styles.refreshText}>🔄 Sync</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#0c1527',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  onlineBorder: {
    borderColor: '#10b981',
    backgroundColor: '#081c1c',
  },
  offlineBorder: {
    borderColor: '#334155',
  },
  leftCol: {
    flex: 1,
    paddingRight: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  dotOnline: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  dotOffline: {
    backgroundColor: '#64748b',
  },
  statusTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#f8fafc',
  },
  deviceBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusSub: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
  },
  refreshBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  refreshText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  urlHint: {
    fontSize: 10,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
