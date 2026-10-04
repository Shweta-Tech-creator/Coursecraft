/**
 * CourseCraft — Cloudinary Certificate Storage Service
 * Automatically renders verified certificates and securely uploads them to Cloudinary
 */

const cloudinary = require('cloudinary').v2;

function getCloudinaryConfig() {
  const cloud_name = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  const api_key = (process.env.CLOUDINARY_API_KEY || '').trim();
  const api_secret = (process.env.CLOUDINARY_API_SECRET || '').trim();

  if (cloud_name && api_key && api_secret) {
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
      secure: true
    });
    return { configured: true, cloud_name, api_key };
  }
  return { configured: false };
}

/**
 * Generates an SVG representation of the University Certificate
 */
function generateCertificateSvg({ certificateId, studentName, courseTitle, courseCode, scorePercent, issueDate, instructorName, deanName }) {
  const safeName = (studentName || 'Student').replace(/[<>&"]/g, '');
  const safeCourse = (courseTitle || 'University Continuing Education Course').replace(/[<>&"]/g, '');
  const safeCode = (courseCode || 'CC-100').replace(/[<>&"]/g, '');
  const safeDate = (issueDate || new Date().toDateString()).replace(/[<>&"]/g, '');
  const safeInstructor = (instructorName || 'Dr. Aarav Sharma').replace(/[<>&"]/g, '');
  const safeDean = (deanName || 'Prof. Rajesh Nair').replace(/[<>&"]/g, '');
  const safeId = (certificateId || 'CC-CERT-2026').replace(/[<>&"]/g, '');
  const safeScore = scorePercent || 70;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 850" width="1200" height="850">
  <defs>
    <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b45309" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1e3a8a" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-opacity="0.15" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1200" height="850" fill="#ffffff" />

  <!-- Outer Certificate Border -->
  <rect x="25" y="25" width="1150" height="800" rx="12" fill="#fffbeb" stroke="url(#goldBorder)" stroke-width="8" filter="url(#shadow)" />
  <rect x="42" y="42" width="1116" height="766" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />

  <!-- Corner Ornamental Accents -->
  <g fill="#d97706" opacity="0.6">
    <circle cx="55" cy="55" r="5" />
    <circle cx="1145" cy="55" r="5" />
    <circle cx="55" cy="795" r="5" />
    <circle cx="1145" cy="795" r="5" />
  </g>

  <!-- Header Crest & University Title -->
  <text x="600" y="115" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-size="20" font-weight="bold" fill="#64748b" letter-spacing="4">UNIVERSITY CONTINUING EDUCATION CENTRE</text>
  <text x="600" y="165" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-size="42" font-weight="bold" fill="url(#headerGrad)" letter-spacing="2">CERTIFICATE OF ACADEMIC COMPLETION</text>
  <line x1="350" y1="185" x2="850" y2="185" stroke="url(#goldBorder)" stroke-width="3" stroke-linecap="round" />

  <!-- Recipient Subtext -->
  <text x="600" y="240" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="16" fill="#475569" letter-spacing="1">THIS IS OFFICIALLY PRESENTED AND CONFERRED UPON</text>

  <!-- Student Name -->
  <text x="600" y="320" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-size="48" font-weight="bold" fill="#0f172a">${safeName}</text>
  <line x1="280" y1="345" x2="920" y2="345" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6,4" />

  <!-- Course Completion Narrative -->
  <text x="600" y="395" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="16" fill="#475569">for successfully fulfilling all coursework and mastering the curriculum of the technical program</text>

  <!-- Course Title -->
  <text x="600" y="450" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-size="30" font-weight="bold" fill="#1e3a8a">${safeCourse}</text>
  <text x="600" y="485" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="15" font-weight="bold" fill="#64748b">COURSE CODE: ${safeCode} | GRADE: PASSED WITH ${safeScore}% ON ASSESSMENT</text>

  <!-- Seal / Badge -->
  <g transform="translate(600, 580)">
    <circle cx="0" cy="0" r="48" fill="#fef3c7" stroke="url(#goldBorder)" stroke-width="4" />
    <circle cx="0" cy="0" r="40" fill="none" stroke="#d97706" stroke-width="1.5" stroke-dasharray="4,3" />
    <text x="0" y="-8" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="bold" fill="#b45309" letter-spacing="1">VERIFIED</text>
    <text x="0" y="10" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-size="18" font-weight="bold" fill="#b45309">SEPM</text>
    <text x="0" y="24" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="9" fill="#92400e">CASE 108</text>
  </g>

  <!-- Signatures -->
  <g transform="translate(240, 680)">
    <line x1="0" y1="0" x2="220" y2="0" stroke="#0f172a" stroke-width="1.5" />
    <text x="110" y="-12" text-anchor="middle" font-family="'Brush Script MT', cursive, sans-serif" font-size="28" fill="#1e3a8a">${safeInstructor}</text>
    <text x="110" y="22" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" font-weight="bold" fill="#0f172a">${safeInstructor}</text>
    <text x="110" y="40" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="12" fill="#64748b">Lead Faculty Instructor</text>
  </g>

  <g transform="translate(740, 680)">
    <line x1="0" y1="0" x2="220" y2="0" stroke="#0f172a" stroke-width="1.5" />
    <text x="110" y="-12" text-anchor="middle" font-family="'Brush Script MT', cursive, sans-serif" font-size="28" fill="#1e3a8a">${safeDean}</text>
    <text x="110" y="22" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" font-weight="bold" fill="#0f172a">${safeDean}</text>
    <text x="110" y="40" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="12" fill="#64748b">Dean, Continuing Education</text>
  </g>

  <!-- Footer Verification & ID -->
  <rect x="100" y="745" width="1000" height="34" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
  <text x="120" y="767" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#334155">ID: ${safeId}</text>
  <text x="600" y="767" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="12" fill="#64748b">ISSUED ON: ${safeDate}</text>
  <text x="1080" y="767" text-anchor="end" font-family="'Helvetica Neue', Arial, sans-serif" font-size="12" font-weight="bold" fill="#059669">STATUS: ACCREDITED</text>
</svg>`;
}

/**
 * Uploads certificate to Cloudinary
 */
async function uploadCertificateToCloudinary(certificateData) {
  const config = getCloudinaryConfig();
  const svgContent = generateCertificateSvg(certificateData);

  if (!config.configured) {
    console.warn('[Cloudinary Service] Cloudinary credentials not fully set. Generating base64 data URI fallback.');
    const base64Svg = Buffer.from(svgContent, 'utf8').toString('base64');
    return {
      uploaded: false,
      secure_url: `data:image/svg+xml;base64,${base64Svg}`,
      public_id: certificateData.certificateId,
      error: 'CLOUDINARY_CLOUD_NAME missing'
    };
  }

  try {
    const base64DataUri = `data:image/svg+xml;base64,${Buffer.from(svgContent, 'utf8').toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64DataUri, {
      folder: 'coursecraft_certificates',
      public_id: certificateData.certificateId,
      resource_type: 'image',
      format: 'png',
      overwrite: true
    });

    console.log(`[Cloudinary Service] Certificate ${certificateData.certificateId} uploaded successfully:`, result.secure_url);
    return {
      uploaded: true,
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error(`[Cloudinary Service] Upload error for ${certificateData.certificateId}:`, error);
    const base64Svg = Buffer.from(svgContent, 'utf8').toString('base64');
    return {
      uploaded: false,
      secure_url: `data:image/svg+xml;base64,${base64Svg}`,
      public_id: certificateData.certificateId,
      error: error.message
    };
  }
}

module.exports = {
  getCloudinaryConfig,
  generateCertificateSvg,
  uploadCertificateToCloudinary
};
