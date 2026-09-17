# Antigravity — CBT Administration Portal (Next.js)

Enterprise Next.js Administration Portal for the Sarvottam Institutes **SNTRA Online CBT Examination Engine**.

## 🔒 Security Architecture & Zero Client Leakage Guarantee

All sensitive authentication logic runs strictly **server-side** on Next.js API route handlers:
1. **Server-Side OTP Generation**: Generated via Node.js cryptographically secure pseudo-random number generator (`crypto.randomInt(100000, 1000000)`).
2. **Hashed Code Storage**: Stored in memory using SHA-256 with timestamps and failed attempt counters.
3. **Zero Client Leakage**: The client never receives the verification code, hashes, or validation logic in any API response or JavaScript bundle. DevTools network inspection reveals only `{ success: true, message: "Code sent" }`.
4. **Code Expiration**: Codes expire strictly after **5 minutes**.
5. **Rate Limiting & Anti-Brute-Force**:
   - **Cooldown**: 60-second cooldown between consecutive code requests per email.
   - **Throttling**: Maximum 3 code requests per email within any 15-minute window.
   - **Single-Use & Invalidation**: Maximum **5 failed verification attempts**; on the 5th failed attempt, the code is permanently burned. Upon successful verification, the code is immediately destroyed to prevent replay attacks.
6. **Cryptographic Session Tokens**: Issued as HMAC SHA-256 signed tokens stored inside `HttpOnly`, `SameSite=Lax` cookies, immune to XSS attacks.

---

## 🚀 Running Locally

The application runs on port `3001` (to prevent collision with default port 3000):

```bash
# In directory: d:\sarvottam\admin page only
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Development Mode vs. Real SMTP
- **Development Mode (Default)**: When no SMTP credentials are provided, verification codes are printed directly to the **Server Terminal Console** and logged into the server-side audit directory:
  `d:\sarvottam\admin page only\.server_outbox\email_dispatches.json`
- **Production SMTP**: To send actual emails via Gmail, SendGrid, Amazon SES, or Brevo, simply edit `.env.local` and configure:
  ```env
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-app-password
  SMTP_FROM=admin@sarvottam.ac.in
  ```

---

## 📊 Admin Dashboard Features

Once authenticated via the 6-digit OTP code, the admin enters the **Antigravity Admin Portal**:
- **Live CBT Telemetry**: Active test takers, registered candidates, completed attempts, and average NEET Botany score.
- **Candidate Registry**: Searchable and filterable table of test candidates (`Completed`, `Live In Test`, `Abrupt Exit`).
- **NEET 2024 Botany Telemetry**: Section A (Q1–35) and Section B (Q36–50) specifications, marking scheme, and verified keys.
- **AI Proctoring Telemetry**: Live stream of tab-switch violations and window-blur disqualifications.
- **2FA Security Audit**: Session token validation, rate-limiting status, and logout control.
