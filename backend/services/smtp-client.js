/**
 * CourseCraft Pure Node.js SMTP Client & Email Dispatcher
 * Zero external dependencies — uses built-in 'tls', 'net', 'crypto'
 * Case Study 108: University Continuing Education Centre
 */

const tls = require('tls');
const net = require('net');
const fs = require('fs');
const path = require('path');
const https = require('https');

const DISPATCHED_EMAILS_FILE = path.join(__dirname, '../data/dispatched_emails.json');

// Ensure dispatched_emails.json exists
if (!fs.existsSync(DISPATCHED_EMAILS_FILE)) {
  fs.writeFileSync(DISPATCHED_EMAILS_FILE, JSON.stringify([], null, 2), 'utf8');
}

function getDispatchedEmails() {
  try {
    const raw = fs.readFileSync(DISPATCHED_EMAILS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function logDispatchedEmail(record) {
  try {
    const emails = getDispatchedEmails();
    emails.unshift(record); // newest first
    // keep up to 100 recent emails
    if (emails.length > 100) emails.length = 100;
    fs.writeFileSync(DISPATCHED_EMAILS_FILE, JSON.stringify(emails, null, 2), 'utf8');
  } catch (e) {
    console.error('[SMTP Client] Error writing to dispatched_emails.json:', e);
  }
}

function loadEnv() {
  const envPath = path.join(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    try {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          const key = trimmed.substring(0, idx).trim();
          let val = trimmed.substring(idx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          if (val) process.env[key] = val;
        }
      }
    } catch (e) {}
  }
}
loadEnv();

function isSmtpConfigured() {
  loadEnv();
  return Boolean(
    process.env.RESEND_API_KEY ||
    process.env.BREVO_API_KEY ||
    ((process.env.SMTP_USER || 'kadamsweta92@gmail.com') && (process.env.SMTP_PASS || 'dsoi zwvr eggw xdat'))
  );
}

function getSmtpConfig() {
  loadEnv();
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || (host === 'smtp.gmail.com' ? 465 : 587));
  const user = (process.env.SMTP_USER || 'kadamsweta92@gmail.com').trim();
  const rawPass = (process.env.SMTP_PASS || 'dsoi zwvr eggw xdat').trim();
  const pass = rawPass.replace(/\s+/g, '');
  const from = process.env.SMTP_FROM || (user ? `"CourseCraft Admissions" <${user}>` : '"CourseCraft Admissions" <admissions@coursecraft.university.edu>');
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
  const brevoSenderEmail = (process.env.BREVO_SENDER_EMAIL || user || 'kadamsweta92@gmail.com').trim();
  const brevoSenderName = (process.env.BREVO_SENDER_NAME || 'CourseCraft Admissions').trim();

  return { host, port, user, pass, from, secure, resendApiKey, brevoApiKey, brevoSenderEmail, brevoSenderName };
}

/**
 * HTTPS REST API Dispatch via Resend (Port 443 — guaranteed to bypass cloud firewall blocks)
 */
function sendViaResend({ apiKey, from, to, subject, html, text }) {
  return new Promise((resolve) => {
    let sender = 'CourseCraft Admissions <onboarding@resend.dev>';
    if (from && !from.includes('@gmail.com') && !from.includes('@university.edu') && from.includes('@resend.dev')) {
      sender = from;
    }

    const postData = JSON.stringify({
      from: sender,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text
    });

    const req = https.request({
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ sent: true, provider: 'resend', messageId: json.id });
          } else {
            resolve({ sent: false, provider: 'resend', error: json.message || data });
          }
        } catch (e) {
          resolve({ sent: false, provider: 'resend', error: `HTTP ${res.statusCode}: ${data}` });
        }
      });
    });

    req.on('error', err => resolve({ sent: false, provider: 'resend', error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ sent: false, provider: 'resend', error: 'Resend API timed out' }); });
    req.write(postData);
    req.end();
  });
}

/**
 * HTTPS REST API Dispatch via Brevo (Port 443)
 */
function sendViaBrevo({ apiKey, from, to, subject, html, text }) {
  return new Promise((resolve) => {
    const fromEmail = from.includes('<') ? from.split('<')[1].replace('>', '').trim() : from.trim();
    const fromName = from.includes('<') ? from.split('<')[0].replace(/"/g, '').trim() : 'CourseCraft Admissions';

    const postData = JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text
    });

    const req = https.request({
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ sent: true, provider: 'brevo', messageId: json.messageId });
          } else {
            resolve({ sent: false, provider: 'brevo', error: json.message || data });
          }
        } catch (e) {
          resolve({ sent: false, provider: 'brevo', error: `HTTP ${res.statusCode}: ${data}` });
        }
      });
    });

    req.on('error', err => resolve({ sent: false, provider: 'brevo', error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ sent: false, provider: 'brevo', error: 'Brevo API timed out' }); });
    req.write(postData);
    req.end();
  });
}

/**
 * Raw SMTP transaction via TLS socket
 */
function sendSmtpRaw({ host, port, user, pass, from, to, subject, html, text }) {
  return new Promise((resolve) => {
    const timeoutMs = 8000;
    let resolved = false;

    function finish(result) {
      if (resolved) return;
      resolved = true;
      try { socket.destroy(); } catch (e) {}
      resolve(result);
    }

    const timer = setTimeout(() => {
      finish({ sent: false, error: `SMTP connection timed out after ${timeoutMs}ms` });
    }, timeoutMs);

    const fromEmail = from.includes('<') ? from.split('<')[1].replace('>', '').trim() : from.trim();
    const toEmail = to.includes('<') ? to.split('<')[1].replace('>', '').trim() : to.trim();

    const socket = tls.connect({
      host,
      port,
      rejectUnauthorized: false
    }, () => {
      // Connected via TLS
    });

    let step = 0;
    let buffer = '';

    socket.on('error', (err) => {
      clearTimeout(timer);
      finish({ sent: false, error: err.message });
    });

    socket.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\r\n');
      buffer = lines.pop(); // keep last incomplete line

      for (const line of lines) {
        if (!line) continue;
        const code = parseInt(line.substring(0, 3), 10);
        const isLastLine = line.charAt(3) !== '-';

        if (!isLastLine) continue;

        if (step === 0 && code === 220) {
          // Greeting received -> send EHLO
          step = 1;
          socket.write(`EHLO localhost\r\n`);
        } else if (step === 1 && code === 250) {
          // EHLO accepted -> start AUTH LOGIN
          if (user && pass) {
            step = 2;
            socket.write(`AUTH LOGIN\r\n`);
          } else {
            // No auth, jump to MAIL FROM
            step = 4;
            socket.write(`MAIL FROM:<${fromEmail}>\r\n`);
          }
        } else if (step === 2 && code === 334) {
          // Send base64 username
          step = 3;
          socket.write(`${Buffer.from(user).toString('base64')}\r\n`);
        } else if (step === 3 && code === 334) {
          // Send base64 password
          step = 4;
          socket.write(`${Buffer.from(pass).toString('base64')}\r\n`);
        } else if (step === 4 && (code === 235 || code === 250)) {
          // Auth succeeded or MAIL FROM accepted
          if (code === 235) {
            step = 5;
            socket.write(`MAIL FROM:<${fromEmail}>\r\n`);
          } else {
            step = 6;
            socket.write(`RCPT TO:<${toEmail}>\r\n`);
          }
        } else if (step === 5 && code === 250) {
          // MAIL FROM accepted -> send RCPT TO
          step = 6;
          socket.write(`RCPT TO:<${toEmail}>\r\n`);
        } else if (step === 6 && code === 250) {
          // RCPT TO accepted -> send DATA
          step = 7;
          socket.write(`DATA\r\n`);
        } else if (step === 7 && code === 354) {
          // Ready for data
          step = 8;
          const boundary = `----=_Part_CC_${Date.now()}`;
          const message = [
            `From: ${from}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            `MIME-Version: 1.0`,
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
            ``,
            `--${boundary}`,
            `Content-Type: text/plain; charset=UTF-8`,
            `Content-Transfer-Encoding: 7bit`,
            ``,
            text,
            ``,
            `--${boundary}`,
            `Content-Type: text/html; charset=UTF-8`,
            `Content-Transfer-Encoding: 7bit`,
            ``,
            html,
            ``,
            `--${boundary}--`,
            `.`,
            ``
          ].join('\r\n');

          socket.write(message);
        } else if (step === 8 && code === 250) {
          // Message accepted
          clearTimeout(timer);
          step = 9;
          socket.write(`QUIT\r\n`);
          finish({ sent: true, messageId: line });
        } else if (code >= 400) {
          clearTimeout(timer);
          finish({ sent: false, error: `SMTP server error: ${line}` });
        }
      }
    });
  });
}

/**
 * High-level email dispatcher for student credentials
 */
async function dispatchStudentCredentialsEmail({ name, email, password, courseTitle, loginUrl }) {
  const rawPortalUrl = loginUrl || 'http://localhost:8085/login.html';
  const baseUrl = rawPortalUrl.split('?')[0];
  const portalUrl = `${baseUrl}?email=${encodeURIComponent(email)}&role=student`;
  const subject = `Welcome to CourseCraft: Your Student Login Credentials & Course Access`;

  const textBody = `
Dear ${name},

Welcome to CourseCraft at the University Continuing Education Centre!

Your student academic account has been registered for:
Course: ${courseTitle || 'University Academic Curriculum'}

Your Login Credentials:
• Portal URL: ${portalUrl}
• Login Email: ${email}
• Temporary Password: ${password}

Instructions to Get Started:
1. Navigate to ${portalUrl} and select "Student" portal.
2. Sign in using your email address and the temporary password above.
3. For account security, you can change your password at any time via the "Queries & Feedback" section or by clicking your user profile in the top-right menu.
4. You can also ask questions directly to your professors under "Queries & Feedback" and submit course evaluations.

If you have any academic inquiries, please reach out through the CourseCraft discussion portal.

Best regards,
Academic Admissions & Faculty Office
CourseCraft — University Continuing Education Centre
`.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 28px 32px; color: #ffffff; }
    .header h1 { margin: 0 0 4px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 0; font-size: 13px; color: #bfdbfe; }
    .content { padding: 32px; }
    .cred-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 20px; margin: 20px 0; }
    .cred-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13.5px; }
    .cred-row:last-child { border-bottom: none; }
    .cred-label { color: #64748b; font-weight: 500; }
    .cred-val { font-weight: 700; color: #0f172a; font-family: monospace; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-top: 10px; }
    .footer { background: #f8fafc; padding: 20px 32px; font-size: 11.5px; color: #64748b; border-top: 1px solid #e2e8f0; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🎓 CourseCraft Academic Portal</h1>
      <p>University Continuing Education Centre — Case Study 108</p>
    </div>
    <div class="content">
      <h2 style="font-size:18px; margin-top:0; color:#0f172a;">Welcome to the Academic Course, ${name}!</h2>
      <p style="font-size:14px; line-height:1.6; color:#475569;">
        Your student portal account has been officially registered and authorized for:
        <br><strong style="color:#1d4ed8;">${courseTitle || 'University Curriculum'}</strong>
      </p>

      <div class="cred-box">
        <div class="cred-row">
          <span class="cred-label">Login Email:</span>
          <span class="cred-val" style="color:#2563eb;">${email}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Temporary Password:</span>
          <span class="cred-val" style="background:#e2e8f0; padding:2px 8px; border-radius:4px;">${password}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Access Portal URL:</span>
          <span class="cred-val" style="font-size:12px;">${portalUrl}</span>
        </div>
      </div>

      <p style="font-size:13px; line-height:1.5; color:#64748b;">
        🔒 <strong>Next Steps:</strong> Log into the student portal using these credentials. Once signed in, you can customize your password under your profile or via the <strong>Queries &amp; Feedback</strong> section.
      </p>

      <div style="text-align:center; margin:24px 0 10px;">
        <a href="${portalUrl}" class="btn">Sign In to Student Portal →</a>
      </div>
    </div>
    <div class="footer">
      This is an automated academic dispatch from CourseCraft.<br>
      Department of Computer Science &amp; Engineering · Continuing Education Centre
    </div>
  </div>
</body>
</html>
`.trim();

  // Create mailto fallback URL
  const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(textBody)}`;

  const config = getSmtpConfig();
  let smtpResult = { sent: false };

  if (config.brevoApiKey) {
    console.log(`[Email Dispatcher] Attempting HTTPS dispatch via Brevo (api.brevo.com) to ${email}...`);
    const brevoFrom = `"${config.brevoSenderName}" <${config.brevoSenderEmail}>`;
    smtpResult = await sendViaBrevo({
      apiKey: config.brevoApiKey,
      from: brevoFrom,
      to: email,
      subject,
      html: htmlBody,
      text: textBody
    });
    console.log(`[Email Dispatcher] Brevo result for ${email}:`, smtpResult);
  } else if (config.resendApiKey) {
    console.log(`[Email Dispatcher] Attempting HTTPS dispatch via Resend to ${email}...`);
    smtpResult = await sendViaResend({
      apiKey: config.resendApiKey,
      from: 'CourseCraft Admissions <onboarding@resend.dev>',
      to: email,
      subject,
      html: htmlBody,
      text: textBody
    });
    console.log(`[Email Dispatcher] Resend result for ${email}:`, smtpResult);
  } else if (isSmtpConfigured()) {
    console.log(`[SMTP Client] Attempting live SMTP dispatch to ${email} via ${config.host}:${config.port}...`);
    smtpResult = await sendSmtpRaw({
      host: config.host,
      port: config.port,
      user: config.user,
      pass: config.pass,
      from: config.from,
      to: email,
      subject,
      html: htmlBody,
      text: textBody
    });
    console.log(`[SMTP Client] Result for ${email}:`, smtpResult);
  } else {
    console.log(`[SMTP Client] SMTP credentials not set in .env. Queued in outbox with 1-click mailto fallback.`);
  }

  // Record dispatch in persistent log
  const dispatchRecord = {
    id: `EMAIL-${Date.now().toString(36).toUpperCase()}`,
    recipientName: name,
    recipientEmail: email,
    courseTitle: courseTitle || 'University Academic Course',
    temporaryPassword: password,
    loginUrl: portalUrl,
    subject,
    bodyText: textBody,
    bodyHtml: htmlBody,
    mailtoUrl,
    timestamp: new Date().toISOString(),
    sentViaSmtp: Boolean(smtpResult.sent),
    deliveryStatus: smtpResult.sent ? (smtpResult.provider ? `DELIVERED_VIA_${smtpResult.provider.toUpperCase()}` : 'DELIVERED_VIA_SMTP') : (isSmtpConfigured() ? 'SMTP_FAILED_QUEUED' : 'OUTBOX_QUEUED'),
    provider: smtpResult.provider || (config.resendApiKey ? 'resend' : (config.brevoApiKey ? 'brevo' : 'smtp')),
    smtpError: smtpResult.error || null,
    smtpHost: config.host
  };

  logDispatchedEmail(dispatchRecord);

  return {
    dispatchRecord,
    sentViaSmtp: Boolean(smtpResult.sent),
    provider: smtpResult.provider || 'smtp',
    smtpConfigured: isSmtpConfigured(),
    smtpResult,
    mailtoUrl,
    textBody,
    htmlBody
  };
}

module.exports = {
  isSmtpConfigured,
  getSmtpConfig,
  getDispatchedEmails,
  dispatchStudentCredentialsEmail,
  sendSmtpRaw
};
