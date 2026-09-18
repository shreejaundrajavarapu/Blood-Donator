const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env.local')
});
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    const allowedHosts = ['localhost', '127.0.0.1'];
    const allowedPatterns = ['http://localhost:', 'http://127.0.0.1:', 'http://[::1]:'];

    if (!origin) return callback(null, true);

    const isAllowedHost = allowedHosts.includes(new URL(origin).hostname);
    const isAllowedPattern = allowedPatterns.some((pattern) => origin.startsWith(pattern));

    if (isAllowedHost || isAllowedPattern) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
app.options('*', cors());

// ─── Resend client ───────────────────────────────────────────────────────────
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

// ─── Phone validation (server-side mirror) ───────────────────────────────────
const PHONE_REGEX = /^[6-9][0-9]{9}$/;
const validatePhone = (v) => typeof v === 'string' && PHONE_REGEX.test(v.trim());

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'BloodConnect Email Server',
    resendConfigured: !!process.env.RESEND_API_KEY
  });
});

// POST /api/send-approval-email
app.post('/api/send-approval-email', async (req, res) => {
  const { name, role, email, uniqueId, password } = req.body;

  if (!resendApiKey || !resend) {
    console.warn('[Resend] Missing RESEND_API_KEY — email service is not configured.');
    return res.status(503).json({
      success: false,
      error: 'Email service is not configured. Add RESEND_API_KEY to .env.local.'
    });
  }

  // Basic field validation
  if (!name || !role || !email || !uniqueId || !password) {
    return res.status(400).json({ success: false, error: 'Missing required fields.' });
  }

  // Build readable role label
  const roleLabels = {
    hospital:  'Hospital',
    bloodbank: 'Blood Bank',
    donor:     'Donor'
  };
  const roleLabel = roleLabels[role] || role;
  const year = new Date().getFullYear();

  // Build professional HTML email
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>BloodConnect — Account Approved</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased}
    .wrap{max-width:580px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .hdr{background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%);padding:36px 40px;text-align:center}
    .hdr h1{color:#fff;font-size:26px;font-weight:800;margin-bottom:4px}
    .hdr p{color:rgba(255,255,255,.85);font-size:14px}
    .body{padding:36px 40px}
    .badge{display:inline-block;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:20px;padding:5px 16px;font-size:13px;font-weight:700;margin-bottom:22px}
    .greeting{font-size:21px;font-weight:800;color:#0f172a;margin-bottom:10px}
    .intro{font-size:14px;color:#475569;line-height:1.75;margin-bottom:28px}
    .creds{background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:26px;margin-bottom:26px}
    .creds-title{font-size:12px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:.06em;margin-bottom:18px}
    .row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(220,38,38,.1)}
    .row:last-child{border-bottom:none}
    .lbl{font-size:13px;color:#64748b}
    .val{font-size:14px;font-weight:700;color:#0f172a;font-family:monospace;background:#fff;padding:4px 10px;border-radius:6px;border:1px solid #e2e8f0}
    .notice{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;font-size:13px;color:#92400e;line-height:1.7;margin-bottom:28px}
    .ftr{background:#f8fafc;border-top:1px solid #e2e8f0;padding:22px 40px;text-align:center;font-size:12px;color:#94a3b8}
    .ftr a{color:#dc2626;text-decoration:none}
  </style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <h1>🩸 BloodConnect</h1>
    <p>Blood Donor Discovery &amp; Connection Platform</p>
  </div>
  <div class="body">
    <div class="badge">✅ Account Approved</div>
    <div class="greeting">Welcome aboard, ${name}!</div>
    <p class="intro">
      Your <strong>${roleLabel}</strong> account on <strong>BloodConnect</strong> has been reviewed and
      <strong>officially approved by the Admin</strong>. You can now sign in to your dedicated dashboard
      and begin using the platform.
    </p>

    <div class="creds">
      <div class="creds-title">🔐 Your Login Credentials</div>
      <div class="row">
        <span class="lbl">Unique Login ID</span>
        <span class="val">${uniqueId}</span>
      </div>
      <div class="row">
        <span class="lbl">Temporary Password</span>
        <span class="val">${password}</span>
      </div>
      <div class="row">
        <span class="lbl">Account Role</span>
        <span class="val">${roleLabel}</span>
      </div>
    </div>

    <div class="notice">
      ⚠️ <strong>Security Notice:</strong> These are system-generated temporary credentials.
      Please log in and change your password at the earliest opportunity.
      Do not share these credentials with anyone.
    </div>

    <p style="font-size:13px;color:#64748b;line-height:1.75">
      If you have any questions or need assistance, please contact your BloodConnect Admin.
    </p>
  </div>
  <div class="ftr">
    <p>This email was sent by <a href="#">BloodConnect</a> — Blood Donor Discovery &amp; Connection Platform.</p>
    <p style="margin-top:6px">© ${year} BloodConnect. All rights reserved.</p>
  </div>
</div>
</body>
</html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [email],
      subject: `[BloodConnect] Your ${roleLabel} Account Has Been Approved`,
      html
    });

    if (error) {
      console.error('[Resend] API error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    console.log(`[Resend] ✓ Email sent → ${email}  (ID: ${data?.id})`);
    return res.json({ success: true, emailId: data?.id });

  } catch (err) {
    console.error('[Resend] Unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ✅  BloodConnect Email Server');
  console.log(`  🌐  http://localhost:${PORT}`);
  console.log(`  🔑  RESEND_API_KEY : ${process.env.RESEND_API_KEY ? '✓ configured' : '✗ NOT SET — emails will fail'}`);
  console.log(`  📧  EMAIL_FROM     : ${EMAIL_FROM}`);
  console.log('');
});
