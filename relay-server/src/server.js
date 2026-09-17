require('dotenv').config();
const path = require('node:path');
const http = require('node:http');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { WebSocketServer } = require('ws');

const db = require('./db');
const relayHub = require('./relayHub');

const app = express();
const PORT = process.env.PORT || 5100;
const JWT_SECRET = process.env.JWT_SECRET || 'sarvottam_jwt_secret_cloud_relay_2026';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const queryToken = req.query.token;
  const token = (authHeader && authHeader.split(' ')[1]) || queryToken;

  if (!token) {
    // For convenience in local testing, fallback to master account if not provided
    req.user = { accountId: 'acc_sarvottam_master', username: 'sarvottam' };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = { accountId: 'acc_sarvottam_master', username: 'sarvottam' };
      return next();
    }
    req.user = user;
    next();
  });
}

// 1. Health check (Used by PC internet watchdog)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Sarvottam Cloud Relay',
    version: '1.0.0',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 2. Auth Endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = db.getAccountByUsername(username || 'sarvottam');

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const hash = db.hashPassword(password || 'sarvottam2026');
  if (user.password_hash !== hash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { accountId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    success: true,
    token,
    account: {
      id: user.id,
      username: user.username,
      accountName: user.account_name
    }
  });
});

// 3. Status Endpoint (Fallback REST polling for mobile every 30s)
app.get('/api/status', authenticateToken, (req, res) => {
  const accountId = req.user.accountId;
  const isOnline = relayHub.isPcOnline(accountId);
  const pcDevice = db.getPcStatus(accountId);
  const files = db.getFiles(accountId);

  res.json({
    pcOnline: isOnline,
    lastSeen: pcDevice ? pcDevice.last_seen : null,
    deviceName: pcDevice ? pcDevice.device_name : 'Sarvottam PC Host',
    filesCount: files.length,
    videoCount: files.filter(f => f.file_type === 'video').length,
    pdfCount: files.filter(f => f.file_type === 'pdf').length,
    timestamp: new Date().toISOString()
  });
});

// 4. File Catalog Listing
app.get('/api/files', authenticateToken, (req, res) => {
  const accountId = req.user.accountId;
  const typeFilter = req.query.type; // 'video' | 'pdf'
  const files = db.getFiles(accountId, typeFilter);
  const isPcOnline = relayHub.isPcOnline(accountId);

  res.json({
    files,
    pcOnline: isPcOnline,
    total: files.length,
    timestamp: new Date().toISOString()
  });
});

// 5. On-Demand Stream Endpoint (Supports HTTP Range requests for video seeking)
app.get('/api/relay/stream/:fileId', authenticateToken, (req, res) => {
  const accountId = req.user.accountId;
  const { fileId } = req.params;

  const file = db.getFileById(fileId);
  if (!file) {
    return res.status(404).json({ error: 'File not found in catalog' });
  }

  const fileSize = file.file_size;
  const mimeType = file.mime_type || (file.file_type === 'video' ? 'video/mp4' : 'application/pdf');

  const range = req.headers.range;
  let startByte = 0;
  let endByte = fileSize - 1;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    startByte = parseInt(parts[0], 10);
    endByte = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (startByte >= fileSize || endByte >= fileSize) {
      res.status(416).set('Content-Range', `bytes */${fileSize}`);
      return res.end();
    }

    const chunksize = (endByte - startByte) + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${startByte}-${endByte}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mimeType,
      'Cache-Control': 'no-cache'
    });
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache'
    });
  }

  const result = relayHub.requestStream({
    accountId,
    fileRecord: file,
    startByte,
    endByte,
    res
  });

  if (!result.success) {
    res.status(result.status || 503).json({ error: result.message });
  }
});

// 6. On-Demand Download Endpoint
app.get('/api/relay/download/:fileId', authenticateToken, (req, res) => {
  const accountId = req.user.accountId;
  const { fileId } = req.params;

  const file = db.getFileById(fileId);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.writeHead(200, {
    'Content-Type': file.mime_type || 'application/octet-stream',
    'Content-Length': file.file_size,
    'Content-Disposition': `attachment; filename="${encodeURIComponent(file.original_name)}"`,
    'Cache-Control': 'no-cache'
  });

  const result = relayHub.requestStream({
    accountId,
    fileRecord: file,
    startByte: 0,
    endByte: file.file_size - 1,
    res
  });

  if (!result.success) {
    res.status(result.status || 503).json({ error: result.message });
  }
});

// 7. Web Portal & Static Fallback (Serves portal to any mobile or desktop browser)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Create HTTP server and mount WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  relayHub.handleConnection(ws, req);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 Sarvottam Cloud Relay Server Running`);
  console.log(`   Local Address:  http://localhost:${PORT}`);
  console.log(`   WebSocket URI:  ws://localhost:${PORT}`);
  console.log(`   Auth User:      sarvottam`);
  console.log(`   Auth Password:  sarvottam2026`);
  console.log(`=======================================================`);
});
