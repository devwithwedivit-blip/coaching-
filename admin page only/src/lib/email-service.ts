import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export interface SendOtpOptions {
  email: string;
  adminName: string;
  code: string;
  expiresInMinutes?: number;
}

export async function sendOtpEmail(options: SendOtpOptions): Promise<{ success: boolean; mode: 'smtp' | 'dev_outbox'; error?: string }> {
  const { email, adminName, code, expiresInMinutes = 5 } = options;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #071326; margin: 0; padding: 30px; color: #ffffff; }
    .card { max-width: 520px; margin: 0 auto; background: #0e1f3d; border: 1.5px solid #c9982a; border-radius: 16px; padding: 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    .header { text-align: center; margin-bottom: 24px; }
    .logo-badge { display: inline-block; background: rgba(201, 152, 42, 0.15); border: 1px solid #c9982a; color: #e0ac3d; padding: 4px 14px; border-radius: 50px; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
    h1 { color: #ffffff; font-size: 22px; margin: 12px 0 6px; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
    .otp-box { background: #071326; border: 2px dashed #c9982a; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #e0ac3d; }
    .expiry { color: #ef4444; font-size: 12px; font-weight: 600; margin-top: 8px; }
    .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #64748b; border-top: 1px solid rgba(201, 152, 42, 0.2); padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="logo-badge">Antigravity · CBT Admin Portal</span>
      <h1>Admin Verification Code</h1>
      <p>Hello <strong>${adminName}</strong>, use the one-time code below to complete your administrative login.</p>
    </div>
    <div class="otp-box">
      <div class="otp-code">${code}</div>
      <div class="expiry">Expires strictly in ${expiresInMinutes} minutes (Single-Use Only)</div>
    </div>
    <p style="font-size: 13px; color: #cbd5e1;">
      If you did not initiate this login request, please alert the security administrator immediately. Never share this code with anyone.
    </p>
    <div class="footer">
      Sarvottam Institutes · Antigravity Automated Assessment Engine
    </div>
  </div>
</body>
</html>
  `;

  // 1. If SMTP is configured in environment, dispatch real email
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"Antigravity Admin Portal" <${process.env.SMTP_FROM || smtpUser}>`,
        to: email,
        subject: `🔒 Antigravity Admin Verification Code: ${code}`,
        text: `Hello ${adminName},\n\nYour 6-digit verification code is: ${code}\nThis code expires in ${expiresInMinutes} minutes.\n\nAntigravity Security Team`,
        html: htmlContent,
      });

      console.log(`[SMTP] Verification email dispatched successfully to: ${email}`);
      return { success: true, mode: 'smtp' };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[SMTP Error] Failed to send email via SMTP:', errorMsg);
      // Fallback to dev outbox log below
    }
  }

  // 2. Development / Local Mock Dispatcher: Log to Server Console & Secure Dev Outbox
  const timestamp = new Date().toISOString();
  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║             🔒 [ANTIGRAVITY ADMIN OTP SERVER-SIDE DISPATCH]            ║
╠════════════════════════════════════════════════════════════════════════╣
║ Timestamp:    ${timestamp}                             ║
║ Recipient:    ${email.padEnd(52)}║
║ Admin Name:   ${adminName.padEnd(52)}║
║ 6-Digit Code: >>>  ${code}  <<< (Expires in ${expiresInMinutes} mins)             ║
╚════════════════════════════════════════════════════════════════════════╝
  `);

  try {
    const outboxDir = path.join(process.cwd(), '.server_outbox');
    if (!fs.existsSync(outboxDir)) {
      fs.mkdirSync(outboxDir, { recursive: true });
    }
    const logPath = path.join(outboxDir, 'email_dispatches.json');
    let logs: unknown[] = [];
    if (fs.existsSync(logPath)) {
      try {
        logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      } catch {
        logs = [];
      }
    }
    logs.unshift({
      timestamp,
      recipient: email,
      adminName,
      code, // Kept strictly on server filesystem
      expiresInMinutes,
      status: 'DISPATCHED_TO_CONSOLE_AND_OUTBOX',
    });
    // Keep max 20 latest logs
    if (logs.length > 20) logs = logs.slice(0, 20);
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2), 'utf8');
  } catch (logErr) {
    console.warn('[Outbox Logger]', logErr);
  }

  return { success: true, mode: 'dev_outbox' };
}
