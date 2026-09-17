const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'relay.db');
const db = new DatabaseSync(DB_PATH);

// Execute Schema Migrations
db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    account_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS devices (
    device_id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    device_type TEXT NOT NULL, -- 'pc' or 'mobile'
    device_name TEXT,
    is_online INTEGER DEFAULT 0,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT
  );

  CREATE TABLE IF NOT EXISTS files_metadata (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'video' or 'pdf'
    title TEXT NOT NULL,
    original_name TEXT NOT NULL,
    relative_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_size_formatted TEXT,
    duration TEXT,
    mime_type TEXT,
    category TEXT,
    subject TEXT,
    file_hash TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'sarvottam_salt').digest('hex');
}

// Seed default account if not exists
const findUser = db.prepare('SELECT id FROM accounts WHERE username = ?');
const defaultUser = findUser.get('sarvottam');
if (!defaultUser) {
  const insertUser = db.prepare(`
    INSERT INTO accounts (id, username, password_hash, account_name)
    VALUES (?, ?, ?, ?)
  `);
  insertUser.run('acc_sarvottam_master', 'sarvottam', hashPassword('sarvottam2026'), 'Sarvottam Institutes');
  console.log('[DB] Seeded master account: username="sarvottam"');
}

module.exports = {
  db,
  hashPassword,

  // Account operations
  getAccountByUsername(username) {
    const stmt = db.prepare('SELECT * FROM accounts WHERE username = ?');
    return stmt.get(username);
  },

  getAccountById(id) {
    const stmt = db.prepare('SELECT id, username, account_name FROM accounts WHERE id = ?');
    return stmt.get(id);
  },

  // Device status operations
  upsertDevice(deviceId, accountId, deviceType, deviceName, isOnline, ipAddress) {
    const stmt = db.prepare(`
      INSERT INTO devices (device_id, account_id, device_type, device_name, is_online, last_seen, ip_address)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
      ON CONFLICT(device_id) DO UPDATE SET
        is_online = excluded.is_online,
        last_seen = CURRENT_TIMESTAMP,
        device_name = excluded.device_name,
        ip_address = excluded.ip_address
    `);
    stmt.run(deviceId, accountId, deviceType, deviceName, isOnline ? 1 : 0, ipAddress || '');
  },

  setDeviceOffline(deviceId) {
    const stmt = db.prepare(`
      UPDATE devices SET is_online = 0, last_seen = CURRENT_TIMESTAMP WHERE device_id = ?
    `);
    stmt.run(deviceId);
  },

  getPcStatus(accountId) {
    const stmt = db.prepare(`
      SELECT * FROM devices 
      WHERE account_id = ? AND device_type = 'pc'
      ORDER BY last_seen DESC LIMIT 1
    `);
    return stmt.get(accountId);
  },

  // Files catalog operations
  replaceFilesCatalog(accountId, files) {
    // Transaction-like update
    db.exec('BEGIN TRANSACTION;');
    try {
      const delStmt = db.prepare('DELETE FROM files_metadata WHERE account_id = ?');
      delStmt.run(accountId);

      const insStmt = db.prepare(`
        INSERT INTO files_metadata (
          id, account_id, file_type, title, original_name, relative_path,
          file_size, file_size_formatted, duration, mime_type, category, subject, file_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const f of files) {
        insStmt.run(
          f.id,
          accountId,
          f.file_type || 'pdf',
          f.title || f.original_name,
          f.original_name,
          f.relative_path,
          f.file_size || 0,
          f.file_size_formatted || '',
          f.duration || '',
          f.mime_type || '',
          f.category || 'General',
          f.subject || 'All',
          f.file_hash || ''
        );
      }
      db.exec('COMMIT;');
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  },

  getFiles(accountId, typeFilter) {
    if (typeFilter) {
      const stmt = db.prepare('SELECT * FROM files_metadata WHERE account_id = ? AND file_type = ? ORDER BY title ASC');
      return stmt.all(accountId, typeFilter);
    }
    const stmt = db.prepare('SELECT * FROM files_metadata WHERE account_id = ? ORDER BY file_type DESC, title ASC');
    return stmt.all(accountId);
  },

  getFileById(id) {
    const stmt = db.prepare('SELECT * FROM files_metadata WHERE id = ?');
    return stmt.get(id);
  }
};
