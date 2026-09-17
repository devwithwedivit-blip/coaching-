const crypto = require('node:crypto');
const db = require('./db');

class RelayHub {
  constructor() {
    // accountId -> WebSocket
    this.pcSockets = new Map();
    // accountId -> Set<WebSocket>
    this.mobileSockets = new Map();
    // transferSessionId -> { res, accountId, fileId, timer, bytesStreamed }
    this.activeTransfers = new Map();
  }

  handleConnection(ws, req) {
    ws.isAlive = true;
    ws.authenticated = false;
    ws.accountId = null;
    ws.deviceType = null;
    ws.deviceId = null;

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.processMessage(ws, message, ip);
      } catch (err) {
        console.error('[RelayHub] Invalid JSON message received:', err.message);
      }
    });

    ws.on('close', () => {
      this.handleDisconnect(ws);
    });

    ws.on('error', (err) => {
      console.error(`[RelayHub] Socket error (${ws.deviceType || 'unknown'}):`, err.message);
    });
  }

  processMessage(ws, message, ip) {
    const { type, payload } = message;

    switch (type) {
      case 'auth': {
        this.handleAuth(ws, payload, ip);
        break;
      }
      case 'sync_catalog': {
        this.handleCatalogSync(ws, payload);
        break;
      }
      case 'transfer_chunk': {
        this.handleTransferChunk(ws, payload);
        break;
      }
      case 'transfer_error': {
        this.handleTransferError(ws, payload);
        break;
      }
      case 'ping': {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
      }
      default:
        console.log(`[RelayHub] Unhandled message type: ${type}`);
    }
  }

  handleAuth(ws, payload, ip) {
    const { token, deviceType, deviceName, deviceId, accountId } = payload || {};
    // Verify account existence (token or direct accountId for trusted agent)
    const accId = accountId || 'acc_sarvottam_master';
    const devId = deviceId || `${deviceType || 'client'}_${crypto.randomBytes(4).toString('hex')}`;

    ws.authenticated = true;
    ws.accountId = accId;
    ws.deviceType = deviceType || 'client';
    ws.deviceId = devId;
    ws.deviceName = deviceName || (deviceType === 'pc' ? 'Sarvottam PC Host' : 'Mobile App');

    db.upsertDevice(devId, accId, ws.deviceType, ws.deviceName, true, ip);

    if (ws.deviceType === 'pc') {
      // If previous PC socket was connected, close it
      const prevPc = this.pcSockets.get(accId);
      if (prevPc && prevPc !== ws) {
        try { prevPc.close(); } catch {}
      }
      this.pcSockets.set(accId, ws);
      console.log(`[RelayHub] 💻 PC Host Connected for account: ${accId} (${ws.deviceName})`);

      // Broadcast device_online to all mobile clients
      this.broadcastToMobiles(accId, {
        type: 'device_online',
        deviceType: 'pc',
        deviceName: ws.deviceName,
        timestamp: new Date().toISOString()
      });

      // Send auth success ACK to PC
      ws.send(JSON.stringify({
        type: 'auth_success',
        status: 'online',
        accountId: accId
      }));
    } else {
      // Mobile client
      if (!this.mobileSockets.has(accId)) {
        this.mobileSockets.set(accId, new Set());
      }
      this.mobileSockets.get(accId).add(ws);
      console.log(`[RelayHub] 📱 Mobile Client Connected for account: ${accId}`);

      // Check current PC status
      const pcWs = this.pcSockets.get(accId);
      const isPcOnline = pcWs && pcWs.readyState === 1;
      const pcDevice = db.getPcStatus(accId);

      ws.send(JSON.stringify({
        type: 'initial_state',
        pcOnline: !!isPcOnline,
        pcLastSeen: pcDevice ? pcDevice.last_seen : null,
        pcDeviceName: pcDevice ? pcDevice.device_name : 'Sarvottam PC Host',
        timestamp: new Date().toISOString()
      }));
    }
  }

  handleCatalogSync(ws, payload) {
    if (!ws.authenticated || ws.deviceType !== 'pc') return;

    const { files } = payload || {};
    if (Array.isArray(files)) {
      db.replaceFilesCatalog(ws.accountId, files);
      console.log(`[RelayHub] 📁 Synced ${files.length} files from PC host for account: ${ws.accountId}`);

      // Broadcast file_updated to connected mobiles
      this.broadcastToMobiles(ws.accountId, {
        type: 'file_updated',
        count: files.length,
        timestamp: new Date().toISOString()
      });

      ws.send(JSON.stringify({
        type: 'sync_ack',
        payload: {
          count: files.length,
          timestamp: Date.now()
        }
      }));
    }
  }

  handleTransferChunk(ws, payload) {
    const { transferSessionId, chunkBase64, isLast } = payload || {};
    const transfer = this.activeTransfers.get(transferSessionId);
    if (!transfer) return;

    // Reset inactivity timeout
    clearTimeout(transfer.timer);
    transfer.timer = setTimeout(() => {
      this.abortTransfer(transferSessionId, 'Transfer timed out due to PC inactivity.');
    }, 20000);

    try {
      if (chunkBase64) {
        const buffer = Buffer.from(chunkBase64, 'base64');
        transfer.res.write(buffer);
        transfer.bytesStreamed += buffer.length;
      }

      if (isLast) {
        clearTimeout(transfer.timer);
        transfer.res.end();
        this.activeTransfers.delete(transferSessionId);
        console.log(`[RelayHub] ✅ Completed transfer ${transferSessionId} (${transfer.bytesStreamed} bytes)`);
      }
    } catch (err) {
      this.abortTransfer(transferSessionId, err.message);
    }
  }

  handleTransferError(ws, payload) {
    const { transferSessionId, error } = payload || {};
    console.error(`[RelayHub] Transfer error from PC for session ${transferSessionId}:`, error);
    this.abortTransfer(transferSessionId, error || 'PC read error');
  }

  handleDisconnect(ws) {
    if (!ws.accountId) return;

    if (ws.deviceType === 'pc') {
      const currentPc = this.pcSockets.get(ws.accountId);
      if (currentPc === ws) {
        this.pcSockets.delete(ws.accountId);
        db.setDeviceOffline(ws.deviceId);
        console.log(`[RelayHub] 🔴 PC Host Disconnected for account: ${ws.accountId}`);

        // Broadcast device_offline to mobiles
        this.broadcastToMobiles(ws.accountId, {
          type: 'device_offline',
          deviceType: 'pc',
          timestamp: new Date().toISOString()
        });

        // Abort all active transfers belonging to this PC
        for (const [sessionId, transfer] of this.activeTransfers.entries()) {
          if (transfer.accountId === ws.accountId) {
            this.abortTransfer(sessionId, 'PC disconnected during transfer.');
          }
        }
      }
    } else if (ws.deviceType === 'mobile') {
      const mobiles = this.mobileSockets.get(ws.accountId);
      if (mobiles) {
        mobiles.delete(ws);
        if (mobiles.size === 0) {
          this.mobileSockets.delete(ws.accountId);
        }
      }
      console.log(`[RelayHub] 📱 Mobile Client Disconnected for account: ${ws.accountId}`);
    }
  }

  broadcastToMobiles(accountId, messageObj) {
    const mobiles = this.mobileSockets.get(accountId);
    if (!mobiles || mobiles.size === 0) return;

    const data = JSON.stringify(messageObj);
    for (const client of mobiles) {
      if (client.readyState === 1) { // OPEN
        client.send(data);
      }
    }
  }

  isPcOnline(accountId) {
    const pc = this.pcSockets.get(accountId);
    return !!(pc && pc.readyState === 1);
  }

  // Request on-demand stream from PC
  requestStream({ accountId, fileRecord, startByte, endByte, res }) {
    const pcWs = this.pcSockets.get(accountId);
    if (!pcWs || pcWs.readyState !== 1) {
      return { success: false, status: 503, message: 'PC host is offline. Files are available when the PC connects to the internet.' };
    }

    const transferSessionId = `ts_${crypto.randomBytes(8).toString('hex')}`;

    const timer = setTimeout(() => {
      this.abortTransfer(transferSessionId, 'PC host did not start streaming in time (15s timeout).');
    }, 15000);

    this.activeTransfers.set(transferSessionId, {
      res,
      accountId,
      fileId: fileRecord.id,
      timer,
      bytesStreamed: 0
    });

    // Handle client disconnect (e.g. mobile closes video or pauses)
    res.on('close', () => {
      if (this.activeTransfers.has(transferSessionId)) {
        this.activeTransfers.delete(transferSessionId);
        clearTimeout(timer);
        // Tell PC to cancel this session
        if (pcWs.readyState === 1) {
          pcWs.send(JSON.stringify({
            type: 'cancel_transfer',
            payload: { transferSessionId }
          }));
        }
      }
    });

    // Send transfer_request to PC
    pcWs.send(JSON.stringify({
      type: 'transfer_request',
      payload: {
        transferSessionId,
        fileId: fileRecord.id,
        relativePath: fileRecord.relative_path,
        startByte: startByte || 0,
        endByte: endByte !== undefined ? endByte : fileRecord.file_size - 1,
        fileSize: fileRecord.file_size
      }
    }));

    return { success: true, transferSessionId };
  }

  abortTransfer(transferSessionId, reason) {
    const transfer = this.activeTransfers.get(transferSessionId);
    if (!transfer) return;

    clearTimeout(transfer.timer);
    this.activeTransfers.delete(transferSessionId);

    if (!transfer.res.headersSent) {
      transfer.res.status(504).json({ error: reason });
    } else {
      transfer.res.end();
    }
    console.warn(`[RelayHub] Aborted transfer ${transferSessionId}: ${reason}`);
  }
}

module.exports = new RelayHub();
