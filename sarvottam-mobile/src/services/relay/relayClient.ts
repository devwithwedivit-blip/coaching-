import { Platform } from 'react-native';
import { RelayFile, RelayDeviceStatus } from '../../types';
import { storage } from '../storage';

// Default to the 24/7 Global Cloud Relay on Render
export const CLOUD_RELAY_URL = 'https://coaching-1-0xeo.onrender.com';

type StatusCallback = (status: RelayDeviceStatus) => void;
type FilesCallback = (files: RelayFile[]) => void;

class RelayClient {
  private ws: WebSocket | null = null;
  private isWsConnected = false;
  private reconnectTimer: any = null;
  private pollIntervalTimer: any = null;
  private statusListeners: Set<StatusCallback> = new Set();
  private filesListeners: Set<FilesCallback> = new Set();

  private currentStatus: RelayDeviceStatus = {
    pcOnline: false,
    lastSeen: null,
    deviceName: 'Sarvottam PC Host',
    filesCount: 0,
    videoCount: 0,
    pdfCount: 0,
  };

  private cachedFiles: RelayFile[] = [];

  constructor() {
    this.loadCachedData();
  }

  private async loadCachedData() {
    const cachedStatus = await storage.getJson<RelayDeviceStatus | null>('sarvottam_relay_status', null);
    if (cachedStatus) this.currentStatus = cachedStatus;

    const cachedFiles = await storage.getJson<RelayFile[]>('sarvottam_relay_files', []);
    if (cachedFiles && cachedFiles.length > 0) this.cachedFiles = cachedFiles;
  }

  public async getBaseUrl(): Promise<string> {
    const custom = await storage.getItem('sarvottam_relay_url');
    if (custom && custom.trim()) return custom.trim();
    if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin.startsWith('http')) {
      return window.location.origin;
    }
    // Default to the 24/7 Global Cloud Relay on Render
    return CLOUD_RELAY_URL;
  }

  public async setBaseUrl(url: string): Promise<void> {
    await storage.setItem('sarvottam_relay_url', url.trim());
    this.reconnect();
  }

  public async getWsUrl(): Promise<string> {
    const httpUrl = await this.getBaseUrl();
    return httpUrl.replace(/^https/, 'wss').replace(/^http/, 'ws');
  }

  // -------------------------------------------------------------
  // 1. Connection Lifecycle (WebSocket + Fallback Polling)
  // -------------------------------------------------------------
  public async init() {
    this.connectWs();
    this.startPollingFallback();
    // Initial fetch via REST
    this.fetchStatus();
    this.fetchFiles();
  }

  public destroy() {
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.pollIntervalTimer) clearInterval(this.pollIntervalTimer);
    this.statusListeners.clear();
    this.filesListeners.clear();
  }

  private async connectWs() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    try {
      const wsBase = await this.getWsUrl();
      const wsUrl = `${wsBase}?deviceType=mobile`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isWsConnected = true;
        // Authenticate as mobile device
        const authMsg = {
          type: 'auth',
          payload: {
            deviceType: 'mobile',
            deviceName: Platform.OS === 'web' ? 'Mobile Web Preview' : `Sarvottam Mobile (${Platform.OS})`,
            deviceId: `mob_${Platform.OS}_${Date.now()}`
          }
        };
        this.ws?.send(JSON.stringify(authMsg));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWsMessage(data);
        } catch {}
      };

      this.ws.onerror = () => {
        this.isWsConnected = false;
      };

      this.ws.onclose = () => {
        this.isWsConnected = false;
        this.scheduleReconnect();
      };
    } catch {
      this.isWsConnected = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    // Exponential or fixed 5s reconnect for WebSocket
    this.reconnectTimer = setTimeout(() => {
      this.connectWs();
    }, 5000);
  }

  private reconnect() {
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    this.connectWs();
    this.fetchStatus();
    this.fetchFiles();
  }

  // -------------------------------------------------------------
  // 2. Real-Time Event Handlers
  // -------------------------------------------------------------
  private handleWsMessage(msg: { type: string; payload?: any; [key: string]: any }) {
    switch (msg.type) {
      case 'initial_state': {
        this.updateStatus({
          pcOnline: !!msg.pcOnline,
          lastSeen: msg.pcLastSeen,
          deviceName: msg.pcDeviceName || 'Sarvottam PC Host',
          filesCount: msg.filesCount || this.currentStatus.filesCount,
        });
        this.fetchFiles();
        break;
      }
      case 'device_online': {
        if (msg.deviceType === 'pc') {
          this.updateStatus({
            pcOnline: true,
            lastSeen: msg.timestamp || new Date().toISOString(),
            deviceName: msg.deviceName || 'Sarvottam PC Host',
          });
          // PC came online, refresh files immediately
          this.fetchFiles();
        }
        break;
      }
      case 'device_offline': {
        if (msg.deviceType === 'pc') {
          this.updateStatus({
            pcOnline: false,
            lastSeen: msg.timestamp || new Date().toISOString(),
          });
        }
        break;
      }
      case 'file_updated': {
        // Files changed or added on PC, pull fresh catalog live
        this.fetchFiles();
        break;
      }
      default:
        break;
    }
  }

  private updateStatus(partial: Partial<RelayDeviceStatus>) {
    this.currentStatus = { ...this.currentStatus, ...partial };
    storage.setJson('sarvottam_relay_status', this.currentStatus);
    this.statusListeners.forEach((cb) => cb(this.currentStatus));
  }

  private updateFiles(files: RelayFile[]) {
    this.cachedFiles = files;
    this.currentStatus.filesCount = files.length;
    this.currentStatus.videoCount = files.filter(f => f.file_type === 'video').length;
    this.currentStatus.pdfCount = files.filter(f => f.file_type === 'pdf').length;
    storage.setJson('sarvottam_relay_files', files);
    this.filesListeners.forEach((cb) => cb(files));
    this.statusListeners.forEach((cb) => cb(this.currentStatus));
  }

  // -------------------------------------------------------------
  // 3. Fallback REST Polling (Every 30s as requested)
  // -------------------------------------------------------------
  private startPollingFallback() {
    if (this.pollIntervalTimer) clearInterval(this.pollIntervalTimer);
    this.pollIntervalTimer = setInterval(() => {
      // If WebSocket is disconnected or spotty, poll REST API
      if (!this.isWsConnected) {
        this.fetchStatus();
        this.fetchFiles();
      }
    }, 30000); // 30 seconds interval
  }

  public async fetchStatus(): Promise<RelayDeviceStatus> {
    try {
      const baseUrl = await this.getBaseUrl();
      const res = await fetch(`${baseUrl}/api/status`);
      if (res.ok) {
        const data = await res.json();
        this.updateStatus({
          pcOnline: !!data.pcOnline,
          lastSeen: data.lastSeen,
          deviceName: data.deviceName || 'Sarvottam PC Host',
          filesCount: data.filesCount ?? this.currentStatus.filesCount,
          videoCount: data.videoCount ?? this.currentStatus.videoCount,
          pdfCount: data.pdfCount ?? this.currentStatus.pdfCount,
        });
      }
    } catch {}
    return this.currentStatus;
  }

  public async fetchFiles(typeFilter?: 'video' | 'pdf'): Promise<RelayFile[]> {
    try {
      const baseUrl = await this.getBaseUrl();
      const url = typeFilter ? `${baseUrl}/api/files?type=${typeFilter}` : `${baseUrl}/api/files`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.files)) {
          this.updateFiles(data.files);
          return data.files;
        }
      }
    } catch {}
    return this.cachedFiles;
  }

  // -------------------------------------------------------------
  // 4. Public Subscriptions & Streaming URLs
  // -------------------------------------------------------------
  public onStatusChange(callback: StatusCallback): () => void {
    this.statusListeners.add(callback);
    callback(this.currentStatus);
    return () => this.statusListeners.delete(callback);
  }

  public onFilesChange(callback: FilesCallback): () => void {
    this.filesListeners.add(callback);
    if (this.cachedFiles.length > 0) {
      callback(this.cachedFiles);
    }
    return () => this.filesListeners.delete(callback);
  }

  public getStatus(): RelayDeviceStatus {
    return this.currentStatus;
  }

  public getFiles(): RelayFile[] {
    return this.cachedFiles;
  }

  public async getStreamUrl(fileId: string): Promise<string> {
    const baseUrl = await this.getBaseUrl();
    return `${baseUrl}/api/relay/stream/${fileId}`;
  }

  public async getDownloadUrl(fileId: string): Promise<string> {
    const baseUrl = await this.getBaseUrl();
    return `${baseUrl}/api/relay/download/${fileId}`;
  }
}

export const relayClient = new RelayClient();
// Automatically start listening when module is imported
relayClient.init();
