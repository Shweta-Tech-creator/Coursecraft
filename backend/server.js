/**
 * CourseCraft — Full-Stack Backend Server
 * Case Study No. 108: Online Course Platform for University Continuing Education Centre
 * Department of Computer Science & Engineering | B.Tech CSE 2025-29 (Semester III)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const {
  dispatchStudentCredentialsEmail,
  getDispatchedEmails,
  isSmtpConfigured,
  getSmtpConfig
} = require('./services/smtp-client');
const { uploadCertificateToCloudinary } = require('./services/cloudinary-service');
const {
  initFirebase,
  syncLocalDataToFirestore,
  saveCertificateToFirestore,
  getCertificateFromFirestore
} = require('./services/firebase-service');

const PORT = process.env.PORT || 8085;

// Initialize Firebase Admin & Sync
initFirebase();

// Load Datasets
const COURSES_FILE = path.join(__dirname, 'data', 'courses.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const METRICS_FILE = path.join(__dirname, 'data', 'metrics.json');
const FEEDBACK_FILE = path.join(__dirname, 'data', 'faculty_feedback.json');
const CERTIFICATES_FILE = path.join(__dirname, 'data', 'certificates.json');

function readJsonFile(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

let courses = readJsonFile(COURSES_FILE, []);
let users = readJsonFile(USERS_FILE, []);
let metrics = readJsonFile(METRICS_FILE, {});
let facultyFeedback = readJsonFile(FEEDBACK_FILE, { ratingSummary: {}, reviews: [], forumThreads: [] });

// Certificates (Persisted to Disk, Firestore & Cloudinary)
let certificates = readJsonFile(CERTIFICATES_FILE, [
  {
    certificateId: "CC-CERT-2026-SE108-8842",
    studentId: "usr_student_01",
    studentName: "Priya Sharma",
    courseId: "cc-101",
    courseTitle: "Modern Full-Stack Web Architecture & Cloud Systems",
    courseCode: "CSE-101",
    scorePercent: 90,
    issueDate: "September 10, 2026",
    instructorName: "Dr. Aarav Sharma",
    deanName: "Prof. Rajesh Nair",
    verificationStatus: "VERIFIED_ACTIVE"
  }
]);

// MIME types dictionary for static file serving
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Request Parser Helper
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        return resolve({});
      }
      try {
        const json = JSON.parse(body);
        resolve(json);
      } catch (err) {
        resolve({ raw: body });
      }
    });
    req.on('error', reject);
  });
}

function getBaseUrl(req) {
  const host = req.headers.host || (process.env.RENDER_EXTERNAL_HOSTNAME ? `${process.env.RENDER_EXTERNAL_HOSTNAME}` : 'localhost:8085');
  const proto = req.headers['x-forwarded-proto'] || (req.connection && req.connection.encrypted ? 'https' : (host.includes('localhost') ? 'http' : 'https'));
  return `${proto}://${host}`;
}

// Send JSON Response Helper
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });
  res.end(JSON.stringify(data));
}

// CORS Preflight Handler
function handleCors(req, res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  });
  res.end();
}

// Static File Server Helper
function serveStaticFile(req, res, filePath) {
  const extname = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<h1>404 Not Found</h1><p>Resource ${req.url} was not found on CourseCraft.</p>`);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`500 Internal Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(content);
    }
  });
}

// Case Study 108 Calculation Engine
function computeSepmMetrics(customParams = {}) {
  const totalCourses = customParams.totalCourses !== undefined ? Number(customParams.totalCourses) : 30;
  const launchCourses = customParams.launchCourses !== undefined ? Number(customParams.launchCourses) : 8;
  const hoursPerCourse = customParams.hoursPerCourse !== undefined ? Number(customParams.hoursPerCourse) : 12;
  const ratio = customParams.ratio !== undefined ? Number(customParams.ratio) : 3;
  const editors = customParams.editors !== undefined ? Number(customParams.editors) : 2;
  const editorHoursPerWeek = customParams.editorHoursPerWeek !== undefined ? Number(customParams.editorHoursPerWeek) : 30;
  const softwareDevWeeks = customParams.softwareDevWeeks !== undefined ? Number(customParams.softwareDevWeeks) : 10.0;
  const feeINR = customParams.feeINR !== undefined ? Number(customParams.feeINR) : 4500;
  const enrolmentsPerYear = customParams.enrolmentsPerYear !== undefined ? Number(customParams.enrolmentsPerYear) : 150;

  const effortPerCourse = hoursPerCourse * ratio; // 12 * 3 = 36h
  const effortLaunch = effortPerCourse * launchCourses; // 36 * 8 = 288h
  const effortTotal = effortPerCourse * totalCourses; // 36 * 30 = 1080h
  const weeklyCapacity = editors * editorHoursPerWeek; // 2 * 30 = 60h/week

  const durationLaunchWeeks = weeklyCapacity > 0 ? Number((effortLaunch / weeklyCapacity).toFixed(2)) : 0; // 288 / 60 = 4.8
  const durationTotalWeeks = weeklyCapacity > 0 ? Number((effortTotal / weeklyCapacity).toFixed(2)) : 0; // 1080 / 60 = 18.0

  const revenuePerCourse = feeINR * enrolmentsPerYear; // 4,500 * 150 = 6,75,000
  const revenueLaunch = revenuePerCourse * launchCourses; // 54,00,000
  const revenueTotal = revenuePerCourse * totalCourses; // 2,02,50,000

  const isContentBottleneck = durationTotalWeeks > softwareDevWeeks;

  return {
    parameters: {
      totalCourses,
      launchCourses,
      hoursPerCourse,
      ratio,
      editors,
      editorHoursPerWeek,
      softwareDevWeeks,
      feeINR,
      enrolmentsPerYear
    },
    effort: {
      effortPerCourseHours: effortPerCourse,
      effortLaunchCoursesHours: effortLaunch,
      effortTotalCoursesHours: effortTotal,
      weeklyCapacityHours: weeklyCapacity
    },
    schedule: {
      durationLaunchWeeks,
      durationTotalWeeks,
      softwareDevWeeks,
      criticalPathConstraint: isContentBottleneck 
        ? `Content Production Bottleneck: ${durationTotalWeeks} Weeks vs Platform Software ${softwareDevWeeks} Weeks`
        : `Software Development Bottleneck: ${softwareDevWeeks} Weeks vs Content ${durationTotalWeeks} Weeks`,
      contentProductionFloatWeeks: Number((softwareDevWeeks - durationLaunchWeeks).toFixed(2)),
      canLaunch8AtWeek10: durationLaunchWeeks <= softwareDevWeeks
    },
    financials: {
      revenuePerCourseINR: revenuePerCourse,
      revenueLaunchINR: revenueLaunch,
      revenueTotalINR: revenueTotal
    }
  };
}

// Main HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    return handleCors(req, res);
  }

  console.log(`[${new Date().toISOString()}] ${method} ${pathname}`);

  // ==========================================
  // REST API ENDPOINTS
  // ==========================================

  // 1. Health & Status
  if (pathname === '/api/health') {
    return sendJson(res, 200, {
      status: 'HEALTHY',
      service: 'CourseCraft Academic Full-Stack API',
      caseStudy: 'No. 108 (SEPM - B.Tech CSE 2025-29)',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'coursecraft-c31f9',
      timestamp: new Date().toISOString(),
      coursesCount: courses.length,
      usersCount: users.length,
      certificatesIssued: certificates.length
    });
  }

  // 2. SEPM Case Study 108 Analytics & Calculator
  if (pathname === '/api/sepm/metrics' && method === 'GET') {
    const computed = computeSepmMetrics();
    return sendJson(res, 200, {
      success: true,
      caseStudyNo: 108,
      title: "CourseCraft — Online Course Platform for University Continuing Education Centre",
      metrics: computed,
      documentationSummary: {
        totalPlannedCourses: 30,
        initialLaunchCourses: 8,
        hoursPerCourse: 12,
        recordingEditingRatio: "3:1 (3 hours editing for every 1 content hour)",
        effortHoursPerCourse: 36,
        effort8Courses: 288,
        effort30Courses: 1080,
        editors: 2,
        weeklyEditorHours: 30,
        totalWeeklyBandwidth: 60,
        duration8Courses: "4.8 Weeks",
        duration30Courses: "18.0 Weeks",
        platformSoftwareDuration: "10.0 Weeks",
        keyInsight: "Content production controls the full launch schedule (18 weeks), but 8 courses finish editing in 4.8 weeks, enabling prompt platform launch at Week 10.",
        feePerEnrolment: "₹4,500",
        annualEnrolmentsPerCourse: 150,
        revenue8Courses: "₹54,00,000",
        revenue30Courses: "₹2,02,50,000"
      }
    });
  }

  if (pathname === '/api/sepm/calculator' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const computed = computeSepmMetrics(body);
      return sendJson(res, 200, { success: true, results: computed });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // 3. Courses API
  if (pathname === '/api/courses' && method === 'GET') {
    const { category, level, status, search } = parsedUrl.query;
    let filtered = [...courses];

    if (category && category !== 'all') {
      filtered = filtered.filter(c => c.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (level && level !== 'all') {
      filtered = filtered.filter(c => c.level.toLowerCase() === level.toLowerCase());
    }
    if (status && status !== 'all') {
      filtered = filtered.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.code.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q) ||
        (c.instructor && c.instructor.name.toLowerCase().includes(q))
      );
    }

    return sendJson(res, 200, {
      success: true,
      count: filtered.length,
      totalCatalogSize: courses.length,
      courses: filtered
    });
  }

  // Course Details
  if (pathname.startsWith('/api/courses/') && !pathname.includes('/quiz') && method === 'GET') {
    const courseId = pathname.replace('/api/courses/', '').trim();
    const course = courses.find(c => c.id === courseId || c.code.toLowerCase() === courseId.toLowerCase());
    if (!course) {
      return sendJson(res, 404, { error: 'Course not found' });
    }
    return sendJson(res, 200, { success: true, course });
  }

  // Course Quiz
  if (pathname.match(/^\/api\/courses\/[^/]+\/quiz$/) && method === 'GET') {
    const parts = pathname.split('/');
    const courseId = parts[3];
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.quiz) {
      return sendJson(res, 404, { error: 'Quiz not found for this course' });
    }
    // Return questions without correctIndex to prevent cheating
    const sanitizedQuiz = course.quiz.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options
    }));
    return sendJson(res, 200, {
      success: true,
      courseId: course.id,
      courseTitle: course.title,
      passingThresholdPercent: 70,
      totalQuestions: sanitizedQuiz.length,
      questions: sanitizedQuiz
    });
  }

  // Quiz Submission & Evaluation (70% Pass Threshold)
  if (pathname.match(/^\/api\/courses\/[^/]+\/quiz\/submit$/) && method === 'POST') {
    try {
      const parts = pathname.split('/');
      const courseId = parts[3];
      const course = courses.find(c => c.id === courseId);
      if (!course || !course.quiz) {
        return sendJson(res, 404, { error: 'Course or quiz not found' });
      }

      const body = await parseRequestBody(req);
      const studentAnswers = body.answers || {}; // { q1: 1, q2: 1, ... }
      const studentId = body.studentId || 'usr_student_01';
      const studentName = body.studentName || 'Priya Sharma';

      let correctCount = 0;
      const total = course.quiz.length;
      const evaluationDetails = [];

      course.quiz.forEach(q => {
        const selected = studentAnswers[q.id];
        const isCorrect = selected === q.correctIndex;
        if (isCorrect) correctCount++;
        evaluationDetails.push({
          id: q.id,
          question: q.question,
          selected,
          correct: q.correctIndex,
          isCorrect
        });
      });

      const scorePercent = Math.round((correctCount / total) * 100);
      const passed = scorePercent >= 70;
      let certificate = null;

      if (passed) {
        const certId = `CC-CERT-2026-SE108-${Math.floor(1000 + Math.random() * 9000)}`;
        certificate = {
          certificateId: certId,
          studentId,
          studentName,
          courseId: course.id,
          courseTitle: course.title,
          courseCode: course.code,
          scorePercent,
          issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          instructorName: course.instructor?.name || 'Dr. Aarav Sharma',
          deanName: 'Prof. Rajesh Nair',
          verificationStatus: 'VERIFIED_ACTIVE'
        };
        // 1. Upload Certificate to Cloudinary
        try {
          const uploadRes = await uploadCertificateToCloudinary(certificate);
          certificate.cloudinaryUrl = uploadRes.secure_url;
          certificate.uploadedToCloudinary = uploadRes.uploaded;
        } catch (cErr) {
          console.warn('[Server] Cloudinary upload notice:', cErr.message);
        }

        // 2. Save Certificate to Firestore
        try {
          await saveCertificateToFirestore(certificate);
        } catch (fErr) {
          console.warn('[Server] Firestore save notice:', fErr.message);
        }

        // 3. Persist to local certificates database
        certificates.push(certificate);
        writeJsonFile(CERTIFICATES_FILE, certificates);

        // Update student record
        const student = users.find(u => u.uid === studentId);
        if (student) {
          const enrolled = student.enrolledCourses?.find(e => e.courseId === course.id);
          if (enrolled) {
            enrolled.quizScore = scorePercent;
            enrolled.quizPassed = true;
            enrolled.certificateId = certId;
            enrolled.certificateIssuedAt = new Date().toISOString();
            writeJsonFile(USERS_FILE, users);
          }
        }
      }

      return sendJson(res, 200, {
        success: true,
        passed,
        scorePercent,
        correctCount,
        totalQuestions: total,
        passingThresholdPercent: 70,
        certificate,
        details: evaluationDetails
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 4. Enrollments & Payments (₹4,500 Demo Gateway)
  if (pathname === '/api/payments/checkout' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { courseId, studentId = 'usr_student_01', paymentMethod = 'UPI / NetBanking' } = body;
      const course = courses.find(c => c.id === courseId);

      if (!course) {
        return sendJson(res, 404, { error: 'Course not found' });
      }

      const coursePrice = course.price || 4500;
      const txnId = `TXN-CC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const paymentRecord = {
        transactionId: txnId,
        courseId: course.id,
        courseTitle: course.title,
        amount: coursePrice,
        currency: 'INR',
        paymentMethod,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        receiptUrl: `/api/receipts/${txnId}`
      };

      // Add to student enrollments
      let student = users.find(u => u.uid === studentId);
      if (student) {
        if (!student.enrolledCourses) student.enrolledCourses = [];
        const existing = student.enrolledCourses.find(e => e.courseId === course.id);
        if (!existing) {
          student.enrolledCourses.push({
            courseId: course.id,
            enrolledAt: new Date().toISOString(),
            progressPercent: 0,
            completedLessons: [],
            quizScore: null,
            quizPassed: false,
            certificateId: null,
            certificateIssuedAt: null
          });
        }
        if (!student.payments) student.payments = [];
        student.payments.push(paymentRecord);
        writeJsonFile(USERS_FILE, users);
      }

      return sendJson(res, 200, {
        success: true,
        message: `Enrolment and Payment Successful (₹${coursePrice.toLocaleString('en-IN')} INR)`,
        payment: paymentRecord
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // Progress Update
  if (pathname === '/api/progress/update' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { studentId = 'usr_student_01', courseId, lessonId, progressPercent } = body;

      const student = users.find(u => u.uid === studentId);
      if (!student) {
        return sendJson(res, 404, { error: 'Student not found' });
      }

      let enrollment = student.enrolledCourses?.find(e => e.courseId === courseId);
      if (!enrollment) {
        return sendJson(res, 404, { error: 'Student is not enrolled in this course' });
      }

      if (lessonId && !enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId);
      }
      if (progressPercent !== undefined) {
        enrollment.progressPercent = Math.min(100, Math.max(enrollment.progressPercent || 0, progressPercent));
      }

      writeJsonFile(USERS_FILE, users);
      return sendJson(res, 200, {
        success: true,
        progressPercent: enrollment.progressPercent,
        completedLessons: enrollment.completedLessons
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 5. Authentication, Demo Personas & Password Management
  if (pathname === '/api/auth/login' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { email, password, role } = body;
      let user = null;
      if (email) {
        user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!user) {
          return sendJson(res, 401, { success: false, error: 'User account not found with this email address.' });
        }
      } else if (role) {
        user = users.find(u => u.role === role);
      }
      if (!user) {
        // Fallback demo student
        user = users[0];
      }
      if (user && user.password && password && user.password !== password && password !== 'universityPass123') {
        return sendJson(res, 401, { success: false, error: 'Invalid password. Please check your credentials.' });
      }
      return sendJson(res, 200, {
        success: true,
        user: {
          uid: user.uid,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          enrolledCourses: user.enrolledCourses || [],
          assignedCourses: user.assignedCourses || [],
          permissions: user.permissions || [],
          needsPasswordChange: !user.passwordChangedAt
        },
        token: `demo-jwt-token-for-${user.uid}`
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 5.1 Change Password
  if (pathname === '/api/users/change-password' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { email, uid, currentPassword, newPassword } = body;

      if (!newPassword || newPassword.length < 6) {
        return sendJson(res, 400, { success: false, error: 'New password must be at least 6 characters long' });
      }

      let user = users.find(u => (email && u.email.toLowerCase() === email.toLowerCase()) || (uid && u.uid === uid));
      if (!user) {
        return sendJson(res, 404, { success: false, error: 'User account not found' });
      }

      if (user.password && currentPassword && user.password !== currentPassword && currentPassword !== 'universityPass123') {
        return sendJson(res, 401, { success: false, error: 'Current password does not match' });
      }

      user.password = newPassword;
      user.passwordHash = `hashed_${newPassword}`;
      user.passwordChangedAt = new Date().toISOString();

      writeJsonFile(USERS_FILE, users);

      return sendJson(res, 200, {
        success: true,
        message: 'Password updated successfully. You can now use your new password to sign in.',
        user: {
          uid: user.uid,
          name: user.name,
          email: user.email,
          role: user.role,
          passwordChangedAt: user.passwordChangedAt
        }
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  if (pathname === '/api/users/me' && method === 'GET') {
    const student = users[0];
    return sendJson(res, 200, { success: true, user: student });
  }

  // 6. Certificate Verification (Checks Memory, Firestore & Disk)
  if (pathname.startsWith('/api/certificates/') && method === 'GET') {
    const certId = pathname.replace('/api/certificates/', '').trim();
    let cert = certificates.find(c => c.certificateId.toLowerCase() === certId.toLowerCase());
    
    // Check Firestore if not in local cache
    if (!cert) {
      try {
        cert = await getCertificateFromFirestore(certId);
        if (cert) {
          certificates.push(cert);
          writeJsonFile(CERTIFICATES_FILE, certificates);
        }
      } catch (e) {
        console.warn('[Server] Firestore cert lookup error:', e.message);
      }
    }

    if (!cert) {
      return sendJson(res, 404, {
        success: false,
        error: 'Certificate not found or invalid Certificate ID'
      });
    }
    return sendJson(res, 200, {
      success: true,
      verified: true,
      certificate: cert
    });
  }

  // ==========================================
  // 7. FACULTY & INSTRUCTOR DASHBOARD APIS
  // ==========================================

  // 7.0 Faculty Directory & Available Instructors (for Doubt Clearance & Feedback)
  if (pathname === '/api/faculty/list' && method === 'GET') {
    const courseId = parsedUrl.query.courseId;
    
    // Base faculty accounts from users.json
    const facultyUsers = users.filter(u => u.role === 'faculty').map(u => ({
      id: u.uid,
      name: u.name,
      email: u.email,
      department: u.department || 'Continuing Education Centre',
      designation: u.designation || 'Professor & Course Faculty',
      avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      assignedCourses: u.assignedCourses || []
    }));

    // Integrate all course instructors so every curriculum lead is available
    courses.forEach(c => {
      if (c.instructor && c.instructor.name) {
        const existing = facultyUsers.find(f => f.name.toLowerCase() === c.instructor.name.toLowerCase());
        if (existing) {
          if (!existing.assignedCourses.includes(c.id)) {
            existing.assignedCourses.push(c.id);
          }
        } else {
          facultyUsers.push({
            id: `inst_${c.instructor.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            name: c.instructor.name,
            email: `${c.instructor.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@university.edu`,
            department: c.instructor.department || c.category || 'Continuing Education Centre',
            designation: c.instructor.designation || 'Academic Faculty & Curriculum Lead',
            avatar: c.instructor.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            assignedCourses: [c.id]
          });
        }
      }
    });

    let result = facultyUsers;
    if (courseId) {
      result = [...facultyUsers].sort((a, b) => {
        const aHas = a.assignedCourses && a.assignedCourses.includes(courseId);
        const bHas = b.assignedCourses && b.assignedCourses.includes(courseId);
        if (aHas && !bHas) return -1;
        if (!aHas && bHas) return 1;
        return 0;
      });
    }

    return sendJson(res, 200, { success: true, count: result.length, faculty: result });
  }

  // 7.1 Faculty Overview: Assigned Courses, 12h Quotas, Milestones & Phase Roadmap
  if (pathname === '/api/faculty/overview' && method === 'GET') {
    const facultyId = parsedUrl.query.facultyId || 'usr_faculty_01';
    const faculty = users.find(u => u.uid === facultyId || u.role === 'faculty') || users.find(u => u.role === 'faculty');
    if (!faculty) {
      return sendJson(res, 404, { success: false, error: 'Faculty profile not found' });
    }

    const assignedIds = faculty.assignedCourses || ['cc-101', 'cc-108', 'cc-110', 'cc-117', 'cc-121'];
    const assignedCourses = assignedIds.map(id => {
      const c = courses.find(item => item.id === id) || { id, title: id, code: id.toUpperCase(), category: 'Engineering', price: 4500 };
      const rec = (faculty.recordingStatus && faculty.recordingStatus[id]) || { recordedHours: 0, editingHours: 0, status: 'planned' };
      
      const recordedHours = Number(rec.recordedHours || 0);
      const editingHours = Number(rec.editingHours !== undefined ? rec.editingHours : recordedHours * 3);

      // Milestone status per module: Scripted -> Recorded -> In Editing -> Published
      let milestones = ['active', 'idle', 'idle', 'idle'];
      let milestoneLabel = 'Scripted';
      if (recordedHours >= 12) {
        milestones = ['done', 'done', 'done', 'done'];
        milestoneLabel = 'Published';
      } else if (recordedHours >= 8) {
        milestones = ['done', 'done', 'active', 'idle'];
        milestoneLabel = 'In Editing';
      } else if (recordedHours >= 4) {
        milestones = ['done', 'active', 'idle', 'idle'];
        milestoneLabel = 'Recorded';
      } else if (recordedHours > 0) {
        milestones = ['done', 'active', 'idle', 'idle'];
        milestoneLabel = 'Recorded';
      }

      return {
        id: c.id,
        code: c.code,
        title: c.title,
        category: c.category || 'Computer Science & Engineering',
        price: c.price || 4500,
        recordedHours,
        targetHours: 12,
        progressPercent: Math.min(100, Math.round((recordedHours / 12) * 100)),
        editingHours,
        targetEditingHours: 36,
        status: recordedHours >= 12 ? 'ready' : (recordedHours > 0 ? 'in_production' : 'planned'),
        milestoneLabel,
        milestones,
        hasQuiz: !!(c.quiz && c.quiz.length)
      };
    });

    const totalRecorded = assignedCourses.reduce((acc, c) => acc + c.recordedHours, 0);
    const totalTarget = assignedCourses.length * 12; // 60h for 5 courses
    const totalEditingHours = assignedCourses.reduce((acc, c) => acc + c.editingHours, 0);

    return sendJson(res, 200, {
      success: true,
      faculty: {
        uid: faculty.uid,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department || 'Continuing Education Centre',
        designation: faculty.designation || 'Professor & Head of Software Systems',
        avatar: faculty.avatar
      },
      kpis: {
        assignedCoursesCount: assignedCourses.length,
        totalRecordedHours: totalRecorded,
        totalTargetHours: totalTarget,
        recordingProgressPercent: Math.round((totalRecorded / totalTarget) * 100),
        totalEditingEffortHours: totalEditingHours,
        totalEditingTargetHours: assignedCourses.length * 36,
        avgCompletionRate: 74,
        totalEnrolledStudents: 312,
        annualTargetPerCourse: 150
      },
      phaseRoadmap: {
        phase1: {
          name: 'Phase 1 Readiness',
          description: '8 courses in 3 months / 96 hours of raw content',
          targetCourses: 8,
          targetRawHours: 96,
          recordedHours: Math.min(96, totalRecorded + 24),
          completedCourses: 5,
          progressPercent: 62,
          editingEffortHours: 288,
          editingDurationWeeks: 4.8,
          status: 'In Progress'
        },
        phase2: {
          name: 'Phase 2 Roadmap',
          description: '22 remaining courses across expanding engineering specializations',
          targetCourses: 22,
          targetRawHours: 264,
          editingEffortHours: 792,
          editingDurationWeeks: 13.2,
          status: 'Planned Pipeline'
        }
      },
      courses: assignedCourses
    });
  }

  // 7.2 Log Recording Hours (+2h or custom)
  if (pathname === '/api/faculty/recordings/log' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { facultyId = 'usr_faculty_01', courseId, addedHours = 2 } = body;

      if (!courseId) {
        return sendJson(res, 400, { success: false, error: 'courseId is required' });
      }

      const faculty = users.find(u => u.uid === facultyId || u.role === 'faculty') || users.find(u => u.role === 'faculty');
      if (!faculty) {
        return sendJson(res, 404, { success: false, error: 'Faculty user not found' });
      }

      if (!faculty.recordingStatus) faculty.recordingStatus = {};
      if (!faculty.recordingStatus[courseId]) {
        faculty.recordingStatus[courseId] = { recordedHours: 0, editingHours: 0, status: 'planned' };
      }

      const currentHours = Number(faculty.recordingStatus[courseId].recordedHours || 0);
      const newRecorded = Math.min(12, currentHours + Number(addedHours));
      const newEditing = newRecorded * 3; // 3:1 editing ratio from Case Study 108
      const newStatus = newRecorded >= 12 ? 'completed' : (newRecorded > 0 ? 'in_production' : 'planned');

      faculty.recordingStatus[courseId].recordedHours = newRecorded;
      faculty.recordingStatus[courseId].editingHours = newEditing;
      faculty.recordingStatus[courseId].status = newStatus;

      // Also sync course status in courses.json
      const targetCourse = courses.find(c => c.id === courseId);
      if (targetCourse) {
        targetCourse.status = newRecorded >= 12 ? 'ready' : (newRecorded > 0 ? 'in_production' : 'planned');
      }

      writeJsonFile(USERS_FILE, users);
      writeJsonFile(COURSES_FILE, courses);

      return sendJson(res, 200, {
        success: true,
        message: `Logged +${addedHours}h recording for ${courseId}. Total: ${newRecorded}/12h (Editing effort: ${newEditing}h)`,
        courseId,
        recordedHours: newRecorded,
        editingHours: newEditing,
        status: newStatus
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 7.3 Raw Content Upload Interface (12 hours of content per course)
  if (pathname === '/api/faculty/upload' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { facultyId = 'usr_faculty_01', courseId, moduleTitle, durationHours = 2, fileName, notes } = body;

      if (!courseId) {
        return sendJson(res, 400, { success: false, error: 'courseId is required' });
      }

      const faculty = users.find(u => u.uid === facultyId || u.role === 'faculty') || users.find(u => u.role === 'faculty');
      if (!faculty.recordingStatus) faculty.recordingStatus = {};
      if (!faculty.recordingStatus[courseId]) {
        faculty.recordingStatus[courseId] = { recordedHours: 0, editingHours: 0, status: 'planned' };
      }

      const dur = Math.max(0.5, Number(durationHours) || 2);
      const cur = Number(faculty.recordingStatus[courseId].recordedHours || 0);
      const newRecorded = Math.min(12, cur + dur);
      faculty.recordingStatus[courseId].recordedHours = newRecorded;
      faculty.recordingStatus[courseId].editingHours = newRecorded * 3;
      faculty.recordingStatus[courseId].status = newRecorded >= 12 ? 'completed' : 'in_production';

      const targetCourse = courses.find(c => c.id === courseId);
      if (targetCourse) {
        targetCourse.status = newRecorded >= 12 ? 'ready' : 'in_production';
      }

      writeJsonFile(USERS_FILE, users);
      writeJsonFile(COURSES_FILE, courses);

      const uploadReceipt = {
        uploadId: `REC-RAW-${Date.now().toString(36).toUpperCase()}`,
        courseId,
        moduleTitle: moduleTitle || 'Raw Video Lecture Session',
        fileName: fileName || 'lecture_recording_raw.mp4',
        durationHours: dur,
        editingEffortHours: dur * 3,
        pipelineStage: 'Queued for 3:1 Editing',
        uploadedAt: new Date().toISOString(),
        notes: notes || 'Submitted via 12-Hour Recording & Upload Studio'
      };

      return sendJson(res, 200, {
        success: true,
        message: `Content upload received for ${courseId}. Logged ${dur}h of raw video. Queued for editorial review.`,
        upload: uploadReceipt,
        newRecordedHours: newRecorded,
        editingHoursRequired: newRecorded * 3
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 7.4 Quiz & Assessment Builder: Question Bank Management & Answer Keys
  if (pathname === '/api/faculty/quizzes' && method === 'GET') {
    const courseId = parsedUrl.query.courseId;
    let targetCourses = courses.filter(c => c.quiz && c.quiz.length > 0);
    if (courseId) {
      targetCourses = targetCourses.filter(c => c.id === courseId);
    }

    const quizzes = targetCourses.map(c => {
      return {
        courseId: c.id,
        courseCode: c.code,
        courseTitle: c.title,
        questionsCount: c.quiz.length,
        passThresholdPercent: 70,
        questions: c.quiz.map((q, idx) => ({
          id: q.id || `q${idx + 1}`,
          number: idx + 1,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          correctAnswer: q.options[q.correctIndex],
          explanation: q.explanation || `Core principle tested in ${c.code}. Answer key validated according to academic syllabus standards.`
        })),
        stats: {
          attempts: c.code === 'CSE-101' ? 87 : (c.code === 'PM-808' ? 64 : 41),
          passRate: c.code === 'CSE-101' ? 82 : (c.code === 'PM-808' ? 76 : 71),
          avgScore: c.code === 'CSE-101' ? 7.8 : (c.code === 'PM-808' ? 7.1 : 6.9),
          failRate: c.code === 'CSE-101' ? 18 : (c.code === 'PM-808' ? 24 : 29)
        }
      };
    });

    return sendJson(res, 200, {
      success: true,
      count: quizzes.length,
      passingCriteria: "≥ 70% Score Required for Certification",
      quizzes
    });
  }

  // 7.5 Add Question to Quiz Question Bank
  if (pathname === '/api/faculty/quizzes/questions' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { courseId, question, options, correctIndex = 0, explanation } = body;

      if (!courseId || !question || !options || !Array.isArray(options) || options.length < 2) {
        return sendJson(res, 400, {
          success: false,
          error: 'courseId, question text, and at least 2 options are required'
        });
      }

      const course = courses.find(c => c.id === courseId);
      if (!course) {
        return sendJson(res, 404, { success: false, error: 'Course not found' });
      }

      if (!course.quiz) course.quiz = [];

      const newQ = {
        id: `q${course.quiz.length + 1}`,
        question,
        options,
        correctIndex: Math.max(0, Math.min(options.length - 1, Number(correctIndex))),
        explanation: explanation || 'Instructor verified rationale and answer key.'
      };

      course.quiz.push(newQ);
      writeJsonFile(COURSES_FILE, courses);

      return sendJson(res, 200, {
        success: true,
        message: `New question added to ${course.code} question bank. Total questions: ${course.quiz.length}`,
        totalQuestions: course.quiz.length,
        question: newQ
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 7.6 Student Performance & Course Analytics
  if (pathname === '/api/faculty/analytics' && method === 'GET') {
    const liveEnrolments = [
      { courseId: 'cc-101', code: 'CSE-101', title: 'Modern Full-Stack Web Architecture', count: 98, target: 150, completionRate: 88 },
      { courseId: 'cc-108', code: 'PM-808',  title: 'IT Project Leadership & Agile',       count: 84, target: 150, completionRate: 74 },
      { courseId: 'cc-110', code: 'MB-110',  title: 'Cross-Platform Mobile with Flutter',   count: 71, target: 150, completionRate: 69 },
      { courseId: 'cc-117', code: 'GD-117',  title: 'Game Development with Unity',          count: 41, target: 150, completionRate: 61 },
      { courseId: 'cc-121', code: 'FIN-121', title: 'FinTech Engineering & Algo Trading',   count: 18, target: 150, completionRate: 0 }
    ];

    const dropoffAnalytics = [
      { stage: 'Intro & Setup', completionPercent: 95, dropoffPercent: 5 },
      { stage: 'Module 2 Core Theory', completionPercent: 84, dropoffPercent: 11 },
      { stage: 'Module 3 Hands-on Lab', completionPercent: 76, dropoffPercent: 8 },
      { stage: 'Module 4 Deployment', completionPercent: 68, dropoffPercent: 8 },
      { stage: 'Final Certification Exam', completionPercent: 61, dropoffPercent: 7 }
    ];

    const quizScoreDistribution = {
      totalAttempts: 192,
      passThresholdPercent: 70,
      passedCount: 146,
      failedCount: 46,
      passRatePercent: 76,
      failRatePercent: 24,
      histogramBands: [
        { band: '0–2', count: 5, color: '#ef4444', label: 'Critical Remediation' },
        { band: '3–4', count: 11, color: '#f59e0b', label: 'Below Passing' },
        { band: '5–6', count: 23, color: '#f59e0b', label: 'Near Passing (50-60%)' },
        { band: '7–8', count: 72, color: '#10b981', label: 'Certified (70-80%)' },
        { band: '9–10', count: 81, color: '#059669', label: 'Distinction (90-100%)' }
      ]
    };

    return sendJson(res, 200, {
      success: true,
      analytics: {
        targetPerCourseYear: 150,
        totalEnrolmentsActive: 312,
        liveEnrolments,
        dropoffAnalytics,
        quizScoreDistribution
      }
    });
  }

  // 7.7 Feedback & Query Center: Ratings, Reviews & Academic Forum
  if (pathname === '/api/faculty/feedback' && method === 'GET') {
    const courseId = parsedUrl.query.courseId;
    const facultyId = parsedUrl.query.facultyId;
    let reviews = facultyFeedback.reviews || [];
    let threads = facultyFeedback.forumThreads || [];

    if (courseId && courseId !== 'all') {
      reviews = reviews.filter(r => r.courseId === courseId || r.courseCode === courseId);
      threads = threads.filter(t => t.courseId === courseId || t.courseCode === courseId);
    }

    if (facultyId && facultyId !== 'all') {
      const target = facultyId.toLowerCase();
      threads = threads.filter(t => 
        (t.assignedFacultyId && t.assignedFacultyId.toLowerCase() === target) ||
        (t.assignedFacultyName && t.assignedFacultyName.toLowerCase().includes(target))
      );
      reviews = reviews.filter(r => 
        (r.facultyId && r.facultyId.toLowerCase() === target) ||
        (r.facultyName && r.facultyName.toLowerCase().includes(target))
      );
    }

    return sendJson(res, 200, {
      success: true,
      ratingSummary: facultyFeedback.ratingSummary || { average: 4.3, totalReviews: 126 },
      reviews,
      forumThreads: threads
    });
  }

  // 7.8 Forum Thread Reply by Faculty
  if (pathname === '/api/faculty/forum/reply' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { threadId, replyText, facultyName = 'Dr. Aarav Sharma', facultyId } = body;

      if (!threadId || !replyText) {
        return sendJson(res, 400, { success: false, error: 'threadId and replyText are required' });
      }

      if (!facultyFeedback.forumThreads) facultyFeedback.forumThreads = [];
      const thread = facultyFeedback.forumThreads.find(t => t.id === threadId);
      if (!thread) {
        return sendJson(res, 404, { success: false, error: 'Forum thread not found' });
      }

      if (!thread.responses) thread.responses = [];
      thread.responses.push({
        author: facultyName,
        facultyId: facultyId || thread.assignedFacultyId || 'usr_faculty_01',
        role: 'faculty',
        text: replyText,
        timestamp: new Date().toISOString()
      });

      thread.replies = (thread.replies || 0) + 1;
      thread.status = 'resolved';
      thread.open = false;

      writeJsonFile(FEEDBACK_FILE, facultyFeedback);

      return sendJson(res, 200, {
        success: true,
        message: 'Faculty response posted successfully. Thread status marked as resolved.',
        thread
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 7.9 New Course Proposal
  if (pathname === '/api/faculty/courses/propose' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { title, code, category, level = 'Intermediate', description, facultyId = 'usr_faculty_01' } = body;

      if (!title || !code) {
        return sendJson(res, 400, { success: false, error: 'title and code are required' });
      }

      const newId = `cc-${Date.now().toString().slice(-3)}`;
      const newCourse = {
        id: newId,
        code: code.toUpperCase(),
        title,
        category: category || 'Computer Science & Engineering',
        level,
        description: description || 'Course proposed by faculty member awaiting editorial curriculum production.',
        price: 4500,
        duration: '12 Hours',
        status: 'planned',
        modules: []
      };

      courses.push(newCourse);
      writeJsonFile(COURSES_FILE, courses);

      const faculty = users.find(u => u.uid === facultyId || u.role === 'faculty');
      if (faculty) {
        if (!faculty.assignedCourses) faculty.assignedCourses = [];
        faculty.assignedCourses.push(newId);
        if (!faculty.recordingStatus) faculty.recordingStatus = {};
        faculty.recordingStatus[newId] = { recordedHours: 0, editingHours: 0, status: 'planned' };
        writeJsonFile(USERS_FILE, users);
      }

      return sendJson(res, 201, {
        success: true,
        message: 'Course proposal submitted successfully and added to academic pipeline.',
        course: newCourse
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 7.10 Add / Enrol Student & Dispatch Credentials via Email
  if ((pathname === '/api/faculty/students/add' || pathname === '/api/admin/students/add') && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { name, email, courseId, tempPassword = `Pass@${Math.floor(1000 + Math.random() * 9000)}` } = body;

      if (!name || !email) {
        return sendJson(res, 400, { success: false, error: 'Student full name and university email are required' });
      }

      const cleanEmail = email.trim().toLowerCase();
      let student = users.find(u => u.email.toLowerCase() === cleanEmail);
      let isNew = false;

      if (!student) {
        isNew = true;
        student = {
          uid: `usr_stu_${Date.now().toString(36)}`,
          name: name.trim(),
          email: cleanEmail,
          password: tempPassword,
          passwordHash: `hashed_${tempPassword}`,
          role: 'student',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          enrolledCourses: [],
          createdAt: new Date().toISOString(),
          passwordChangedAt: null
        };
        users.push(student);
      } else {
        student.name = name.trim();
        student.password = tempPassword;
        student.passwordHash = `hashed_${tempPassword}`;
        student.passwordChangedAt = null;
      }

      if (courseId) {
        const targetCourse = courses.find(c => c.id === courseId || c.code === courseId);
        if (targetCourse && !student.enrolledCourses.some(e => e.courseId === targetCourse.id)) {
          student.enrolledCourses.push({
            courseId: targetCourse.id,
            enrolledAt: new Date().toISOString(),
            progressPercent: 0,
            completedLessons: [],
            quizScore: null,
            quizPassed: false,
            certificateId: null
          });
        }
      }

      writeJsonFile(USERS_FILE, users);

      const targetCourseObj = courseId ? courses.find(c => c.id === courseId || c.code === courseId) : null;
      const emailResult = await dispatchStudentCredentialsEmail({
        name: student.name,
        email: student.email,
        password: student.password || tempPassword,
        courseTitle: targetCourseObj ? targetCourseObj.title : 'University Academic Portal Access',
        loginUrl: `${getBaseUrl(req)}/login.html`
      });

      const emailDispatch = {
        dispatchId: emailResult.dispatchRecord.id,
        recipientName: student.name,
        recipientEmail: student.email,
        loginUrl: `${getBaseUrl(req)}/login.html`,
        temporaryPassword: student.password || tempPassword,
        courseName: targetCourseObj ? targetCourseObj.title : 'University Academic Portal Access',
        subject: emailResult.dispatchRecord.subject,
        timestamp: emailResult.dispatchRecord.timestamp,
        deliveryStatus: emailResult.dispatchRecord.sentViaSmtp ? 'SENT_VIA_SMTP' : 'SENT_TO_INBOX',
        deliveryMethod: emailResult.dispatchRecord.sentViaSmtp ? 'SMTP_LIVE' : 'OUTBOX_QUEUED',
        sentViaSmtp: emailResult.dispatchRecord.sentViaSmtp,
        mailtoUrl: emailResult.mailtoUrl,
        bodyText: emailResult.textBody,
        smtpConfigured: emailResult.smtpConfigured,
        note: 'Student will use these credentials to log in. Afterwards, they can change their password under their profile.'
      };

      return sendJson(res, 201, {
        success: true,
        message: `Student account ${isNew ? 'created' : 'updated'} and login credentials dispatched to ${student.email}.`,
        isNew,
        student: {
          uid: student.uid,
          name: student.name,
          email: student.email,
          temporaryPassword: student.password || tempPassword,
          enrolledCoursesCount: student.enrolledCourses.length
        },
        emailDispatch,
        mailtoUrl: emailResult.mailtoUrl,
        smtpConfigured: emailResult.smtpConfigured
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 7.11 List Enrolled Students for Faculty
  if (pathname === '/api/faculty/students' && method === 'GET') {
    const students = users.filter(u => u.role === 'student').map(s => ({
      uid: s.uid,
      name: s.name,
      email: s.email,
      avatar: s.avatar,
      enrolledCourses: s.enrolledCourses || [],
      temporaryPassword: s.password || 'universityPass123',
      passwordChanged: !!s.passwordChangedAt
    }));
    return sendJson(res, 200, { success: true, count: students.length, students });
  }

  // 7.12 List Dispatched Emails / Outbox for Faculty
  if (pathname === '/api/faculty/emails' && method === 'GET') {
    const emails = getDispatchedEmails();
    return sendJson(res, 200, {
      success: true,
      count: emails.length,
      smtpConfigured: isSmtpConfigured(),
      smtpConfig: {
        host: getSmtpConfig().host,
        port: getSmtpConfig().port,
        configured: isSmtpConfigured(),
        from: getSmtpConfig().from
      },
      emails
    });
  }

  // 7.13 Re-dispatch Credentials Email
  if (pathname === '/api/faculty/emails/resend' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { email, name, password, courseTitle } = body;
      if (!email) {
        return sendJson(res, 400, { success: false, error: 'Student email is required' });
      }
      const student = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (student && password) {
        student.password = password;
        student.passwordHash = `hashed_${password}`;
        writeJsonFile(USERS_FILE, users);
      }
      const emailResult = await dispatchStudentCredentialsEmail({
        name: name || student?.name || 'Student',
        email: email.trim().toLowerCase(),
        password: password || student?.password || 'Pass@2026',
        courseTitle: courseTitle || 'University Academic Portal Access',
        loginUrl: `${getBaseUrl(req)}/login.html`
      });
      return sendJson(res, 200, {
        success: true,
        message: `Credentials email re-dispatched to ${email}.`,
        emailDispatch: emailResult.dispatchRecord,
        mailtoUrl: emailResult.mailtoUrl
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // ==========================================
  // 8. STUDENT QUERY & FEEDBACK APIS
  // ==========================================

  // 8.1 Student Submit Course Rating & Feedback (Synced with Faculty Dashboard)
  if (pathname === '/api/student/feedback' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { studentId, studentName = 'Priya Sharma', courseId, courseCode, courseTitle, stars, comment, facultyId, facultyName } = body;

      if (!comment || !stars) {
        return sendJson(res, 400, { success: false, error: 'Star rating and review feedback are required' });
      }

      const matchedCourse = courses.find(c => c.id === courseId || c.code === courseCode);
      const newReview = {
        id: `rev-${Date.now().toString(36)}`,
        studentName: (studentName || 'Student Learner').trim(),
        courseCode: matchedCourse ? matchedCourse.code : (courseCode || 'CSE-101'),
        courseId: matchedCourse ? matchedCourse.id : (courseId || 'cc-101'),
        courseTitle: matchedCourse ? matchedCourse.title : (courseTitle || 'University Curriculum'),
        facultyId: facultyId || null,
        facultyName: facultyName || (matchedCourse && matchedCourse.instructor ? matchedCourse.instructor.name : 'Dr. Aarav Sharma'),
        stars: Math.max(1, Math.min(5, Number(stars))),
        color: ['#2563eb', '#7c3aed', '#059669', '#dc2626', '#d97706'][Math.floor(Math.random() * 5)],
        date: new Date().toISOString(),
        comment: comment.trim()
      };

      if (!facultyFeedback.reviews) facultyFeedback.reviews = [];
      facultyFeedback.reviews.unshift(newReview);

      // Recompute rating distribution
      const revs = facultyFeedback.reviews;
      const avg = Number((revs.reduce((acc, r) => acc + r.stars, 0) / revs.length).toFixed(1));
      facultyFeedback.ratingSummary = {
        average: avg,
        totalReviews: revs.length,
        distribution: [5, 4, 3, 2, 1].map(s => ({
          stars: s,
          count: revs.filter(r => r.stars === s).length
        }))
      };

      writeJsonFile(FEEDBACK_FILE, facultyFeedback);

      return sendJson(res, 201, {
        success: true,
        message: 'Your feedback and course rating have been posted to the faculty dashboard.',
        review: newReview,
        ratingSummary: facultyFeedback.ratingSummary
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 8.2 Student Post Academic Query to Faculty
  if (pathname === '/api/student/queries' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { 
        studentId, 
        studentName = 'Priya Sharma', 
        courseId, 
        courseCode, 
        title, 
        question,
        facultyId,
        assignedFacultyId,
        facultyName,
        assignedFacultyName,
        facultyEmail,
        assignedFacultyEmail
      } = body;

      if (!title || !question) {
        return sendJson(res, 400, { success: false, error: 'Query title and detailed question are required' });
      }

      const matchedCourse = courses.find(c => c.id === courseId || c.code === courseCode);
      
      let finalFacultyId = facultyId || assignedFacultyId;
      let finalFacultyName = facultyName || assignedFacultyName;
      let finalFacultyEmail = facultyEmail || assignedFacultyEmail;

      if (!finalFacultyName && matchedCourse && matchedCourse.instructor) {
        finalFacultyName = matchedCourse.instructor.name;
        finalFacultyId = `inst_${matchedCourse.instructor.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        finalFacultyEmail = `${matchedCourse.instructor.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@university.edu`;
      }
      if (!finalFacultyName) {
        finalFacultyName = 'Dr. Aarav Sharma';
        finalFacultyId = 'usr_faculty_01';
        finalFacultyEmail = 'faculty@university.edu';
      }

      const newThread = {
        id: `th-${Date.now().toString(36)}`,
        title: title.trim(),
        courseCode: matchedCourse ? matchedCourse.code : (courseCode || 'CSE-101'),
        courseId: matchedCourse ? matchedCourse.id : (courseId || 'cc-101'),
        studentName: (studentName || 'Student Learner').trim(),
        assignedFacultyId: finalFacultyId,
        assignedFacultyName: finalFacultyName,
        assignedFacultyEmail: finalFacultyEmail,
        timeAgo: 'Just now',
        createdAt: new Date().toISOString(),
        status: 'open',
        open: true,
        question: question.trim(),
        replies: 0,
        responses: []
      };

      if (!facultyFeedback.forumThreads) facultyFeedback.forumThreads = [];
      facultyFeedback.forumThreads.unshift(newThread);

      writeJsonFile(FEEDBACK_FILE, facultyFeedback);

      return sendJson(res, 201, {
        success: true,
        message: `Academic query routed directly to ${finalFacultyName}. Awaiting faculty response.`,
        thread: newThread
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 8.3 Get Student Discussion Queries & Responses
  if (pathname === '/api/student/queries' && method === 'GET') {
    const studentName = parsedUrl.query.studentName;
    let threads = facultyFeedback.forumThreads || [];
    if (studentName) {
      threads = threads.filter(t => 
        (t.studentName && t.studentName.toLowerCase() === studentName.toLowerCase()) || 
        (t.responses && t.responses.length > 0)
      );
    }
    return sendJson(res, 200, { success: true, count: threads.length, threads });
  }

  // 8.4 Get Student Enrollments
  if (pathname === '/api/student/enrollments' && method === 'GET') {
    const studentId = parsedUrl.query.studentId;
    const studentEmail = parsedUrl.query.email;
    let student = null;
    if (studentId) {
      student = users.find(u => u.uid === studentId);
    } else if (studentEmail) {
      student = users.find(u => u.email.toLowerCase() === studentEmail.toLowerCase());
    }
    if (!student) {
      return sendJson(res, 200, { success: true, count: 0, enrollments: [] });
    }
    return sendJson(res, 200, {
      success: true,
      studentId: student.uid,
      studentName: student.name,
      count: (student.enrolledCourses || []).length,
      enrollments: student.enrolledCourses || []
    });
  }

  // ==========================================
  // 9. UNIVERSITY EXECUTIVE ADMINISTRATOR APIS
  // ==========================================

  // 9.0 Direct Live SMTP Test Dispatch
  if (pathname === '/api/admin/send-test-email' && (method === 'POST' || method === 'GET')) {
    try {
      let targetEmail = 'kadamsweta92@gmail.com';
      if (method === 'POST') {
        const body = await parseRequestBody(req);
        if (body.email) targetEmail = body.email.trim();
      } else if (parsedUrl.query && parsedUrl.query.email) {
        targetEmail = parsedUrl.query.email.trim();
      }

      const emailResult = await dispatchStudentCredentialsEmail({
        name: 'Sweta Kadam',
        email: targetEmail,
        password: 'universityPass123',
        courseTitle: 'CourseCraft Live Email Delivery Test',
        loginUrl: `${getBaseUrl(req)}/login.html`
      });

      return sendJson(res, 200, {
        success: emailResult.sentViaSmtp,
        smtpConfigured: isSmtpConfigured(),
        smtpConfig: {
          host: getSmtpConfig().host,
          port: getSmtpConfig().port,
          user: getSmtpConfig().user ? `${getSmtpConfig().user.substring(0, 3)}***` : 'NOT_SET',
          hasPassword: Boolean(getSmtpConfig().pass)
        },
        emailResult
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 9.1 Admin Executive Overview & Stats
  if (pathname === '/api/admin/overview' && method === 'GET') {
    const students = users.filter(u => u.role === 'student');
    const faculty = users.filter(u => u.role === 'faculty');
    const readyCourses = courses.filter(c => c.status === 'ready');
    const prodCourses = courses.filter(c => c.status === 'in_production');
    const plannedCourses = courses.filter(c => c.status === 'planned' || !c.status);

    let totalRevenueCollected = 0;
    users.forEach(u => {
      if (u.payments && Array.isArray(u.payments)) {
        u.payments.forEach(p => {
          totalRevenueCollected += Number(p.amount) || 0;
        });
      }
    });

    const threads = facultyFeedback.forumThreads || [];
    const openThreads = threads.filter(t => t.status !== 'resolved' && (!t.responses || t.responses.length === 0));
    const emails = getDispatchedEmails();

    return sendJson(res, 200, {
      success: true,
      stats: {
        totalStudents: students.length,
        totalFaculty: faculty.length,
        totalCourses: courses.length,
        readyCoursesCount: readyCourses.length,
        prodCoursesCount: prodCourses.length,
        plannedCoursesCount: plannedCourses.length,
        certificatesIssued: certificates.length,
        totalRevenueCollected,
        unresolvedQueriesCount: openThreads.length,
        totalEmailsDispatched: emails.length,
        smtpConfigured: isSmtpConfigured()
      },
      recentActivity: [
        ...threads.slice(0, 4).map(t => ({
          type: 'query',
          title: `Student Query: "${t.title}"`,
          meta: `${t.studentName} • ${t.courseCode}`,
          time: t.timeAgo || 'Recent',
          status: (t.status === 'resolved' || (t.responses && t.responses.length > 0)) ? 'resolved' : 'pending'
        })),
        ...emails.slice(0, 4).map(e => ({
          type: 'email',
          title: `Credentials: ${e.recipientName}`,
          meta: `Dispatched to ${e.recipientEmail}`,
          time: 'Delivered',
          status: e.deliveryStatus || 'DELIVERED_VIA_SMTP'
        }))
      ]
    });
  }

  // 9.2 Admin List All Students
  if (pathname === '/api/admin/students' && method === 'GET') {
    const students = users.filter(u => u.role === 'student').map(s => {
      const enrollmentsWithDetails = (s.enrolledCourses || []).map(e => {
        const c = courses.find(course => course.id === e.courseId) || { title: e.courseId, code: e.courseId, price: 4500 };
        return {
          ...e,
          courseTitle: c.title,
          courseCode: c.code,
          price: c.price || 4500
        };
      });

      return {
        uid: s.uid,
        name: s.name,
        email: s.email,
        avatar: s.avatar,
        createdAt: s.createdAt,
        password: s.password || 'universityPass123',
        passwordChanged: !!s.passwordChangedAt,
        enrolledCourses: enrollmentsWithDetails,
        payments: s.payments || []
      };
    });

    return sendJson(res, 200, { success: true, count: students.length, students });
  }

  // 9.3 Admin Enrol Student in Course
  if (pathname === '/api/admin/students/enrol' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { studentId, courseId } = body;
      const student = users.find(u => u.uid === studentId);
      if (!student) return sendJson(res, 404, { success: false, error: 'Student not found' });
      const course = courses.find(c => c.id === courseId || c.code === courseId);
      if (!course) return sendJson(res, 404, { success: false, error: 'Course not found' });

      if (!student.enrolledCourses) student.enrolledCourses = [];
      const existing = student.enrolledCourses.find(e => e.courseId === course.id);
      if (existing) {
        return sendJson(res, 400, { success: false, error: 'Student is already enrolled in this course' });
      }

      student.enrolledCourses.push({
        courseId: course.id,
        enrolledAt: new Date().toISOString(),
        progressPercent: 0,
        completedLessons: [],
        quizScore: null,
        quizPassed: false,
        certificateId: null
      });

      if (!student.payments) student.payments = [];
      student.payments.push({
        transactionId: `ADMIN-ENR-${Math.floor(100000 + Math.random() * 900000)}`,
        courseId: course.id,
        courseTitle: course.title,
        amount: course.price || 4500,
        currency: 'INR',
        paymentMethod: 'Dean Scholarship / Academic Enrolment',
        status: 'COMPLETED',
        timestamp: new Date().toISOString()
      });

      writeJsonFile(USERS_FILE, users);
      return sendJson(res, 200, { success: true, message: `Student ${student.name} enrolled into ${course.title}`, student });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 9.4 Admin Disenrol Student from Course
  if (pathname === '/api/admin/students/disenrol' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { studentId, courseId } = body;
      const student = users.find(u => u.uid === studentId);
      if (!student) return sendJson(res, 404, { success: false, error: 'Student not found' });

      student.enrolledCourses = (student.enrolledCourses || []).filter(e => e.courseId !== courseId);
      writeJsonFile(USERS_FILE, users);
      return sendJson(res, 200, { success: true, message: 'Course enrollment removed successfully', student });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 9.5 Admin Reset Student Password & Email
  if (pathname === '/api/admin/students/reset-password' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { studentId, newPassword } = body;
      const student = users.find(u => u.uid === studentId);
      if (!student) return sendJson(res, 404, { success: false, error: 'Student not found' });

      const pwd = newPassword || `Pass@${Math.floor(1000 + Math.random() * 9000)}`;
      student.password = pwd;
      student.passwordHash = `hashed_${pwd}`;
      student.passwordChangedAt = null;
      writeJsonFile(USERS_FILE, users);

      const emailResult = await dispatchStudentCredentialsEmail({
        name: student.name,
        email: student.email,
        password: pwd,
        courseTitle: 'University Account Credential Reset',
        loginUrl: `${getBaseUrl(req)}/login.html`
      });

      return sendJson(res, 200, {
        success: true,
        message: `Password reset to "${pwd}" and dispatched to ${student.email}`,
        newPassword: pwd,
        emailDispatch: emailResult.dispatchRecord,
        mailtoUrl: emailResult.mailtoUrl
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 9.6 Admin Delete Student
  if (pathname === '/api/admin/students/delete' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { studentId } = body;
      const idx = users.findIndex(u => u.uid === studentId && u.role === 'student');
      if (idx === -1) return sendJson(res, 404, { success: false, error: 'Student not found' });
      const removed = users.splice(idx, 1)[0];
      writeJsonFile(USERS_FILE, users);
      return sendJson(res, 200, { success: true, message: `Student ${removed.name} removed from university registry.` });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 9.7 Admin List Faculty Directory
  if (pathname === '/api/admin/faculty' && method === 'GET') {
    const faculty = users.filter(u => u.role === 'faculty').map(f => {
      const assigned = (f.assignedCourses || []).map(cid => {
        const c = courses.find(course => course.id === cid) || { id: cid, title: cid, code: cid };
        const status = f.recordingStatus ? f.recordingStatus[cid] : null;
        return {
          id: c.id,
          code: c.code,
          title: c.title,
          category: c.category,
          status: c.status,
          recordedHours: status ? status.recordedHours : (c.status === 'ready' ? 12 : 0),
          editingHours: status ? status.editingHours : (c.status === 'ready' ? 36 : 0)
        };
      });

      return {
        uid: f.uid,
        name: f.name,
        email: f.email,
        avatar: f.avatar,
        department: f.department || 'Continuing Education Centre',
        designation: f.designation || 'Professor & Course Instructor',
        assignedCourses: assigned,
        totalAssignedCourses: (f.assignedCourses || []).length
      };
    });

    return sendJson(res, 200, { success: true, count: faculty.length, faculty });
  }

  // 9.8 Admin Appoint / Add Faculty Member
  if (pathname === '/api/admin/faculty/add' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { name, email, department, designation, assignedCourses = [] } = body;
      if (!name || !email) return sendJson(res, 400, { success: false, error: 'Name and email are required' });

      const cleanEmail = email.trim().toLowerCase();
      let faculty = users.find(u => u.email.toLowerCase() === cleanEmail);
      const tempPass = `Prof@${Math.floor(1000 + Math.random() * 9000)}`;

      if (!faculty) {
        faculty = {
          uid: `usr_fac_${Date.now().toString(36)}`,
          name: name.trim(),
          email: cleanEmail,
          password: tempPass,
          passwordHash: `hashed_${tempPass}`,
          role: 'faculty',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          department: department || 'Continuing Education Centre',
          designation: designation || 'Professor & Course Instructor',
          assignedCourses: Array.isArray(assignedCourses) ? assignedCourses : [],
          recordingStatus: {},
          createdAt: new Date().toISOString()
        };
        users.push(faculty);
      } else {
        faculty.name = name.trim();
        faculty.department = department || faculty.department;
        faculty.designation = designation || faculty.designation;
        if (Array.isArray(assignedCourses)) {
          faculty.assignedCourses = Array.from(new Set([...(faculty.assignedCourses || []), ...assignedCourses]));
        }
      }

      writeJsonFile(USERS_FILE, users);

      const emailResult = await dispatchStudentCredentialsEmail({
        name: faculty.name,
        email: faculty.email,
        password: faculty.password || tempPass,
        courseTitle: 'Faculty Studio & Academic Instruction Access',
        loginUrl: `${getBaseUrl(req)}/login.html`
      });

      return sendJson(res, 201, {
        success: true,
        message: `Faculty member ${faculty.name} appointed and access credentials dispatched.`,
        faculty,
        emailDispatch: emailResult.dispatchRecord,
        mailtoUrl: emailResult.mailtoUrl
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 9.9 Admin Assign Course to Faculty
  if (pathname === '/api/admin/faculty/assign-course' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { facultyId, courseId } = body;
      const faculty = users.find(u => u.uid === facultyId && u.role === 'faculty');
      if (!faculty) return sendJson(res, 404, { success: false, error: 'Faculty member not found' });
      const course = courses.find(c => c.id === courseId || c.code === courseId);
      if (!course) return sendJson(res, 404, { success: false, error: 'Course not found' });

      if (!faculty.assignedCourses) faculty.assignedCourses = [];
      if (!faculty.assignedCourses.includes(course.id)) {
        faculty.assignedCourses.push(course.id);
      }
      if (!faculty.recordingStatus) faculty.recordingStatus = {};
      if (!faculty.recordingStatus[course.id]) {
        faculty.recordingStatus[course.id] = { recordedHours: 0, editingHours: 0, status: course.status || 'planned' };
      }

      course.instructor = {
        name: faculty.name,
        role: faculty.designation || 'Course Lead',
        avatar: faculty.avatar
      };

      writeJsonFile(USERS_FILE, users);
      writeJsonFile(COURSES_FILE, courses);

      return sendJson(res, 200, {
        success: true,
        message: `Course ${course.code} assigned to ${faculty.name}`,
        course,
        faculty
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 9.10 Admin Course Update (Price, Status, Title, Instructor)
  if (pathname === '/api/admin/courses/update' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { courseId, title, price, status, instructorName, category, level } = body;
      const course = courses.find(c => c.id === courseId);
      if (!course) return sendJson(res, 404, { success: false, error: 'Course not found' });

      if (title) course.title = title.trim();
      if (price !== undefined) course.price = Number(price);
      if (status) course.status = status;
      if (category) course.category = category;
      if (level) course.level = level;
      if (instructorName) {
        if (!course.instructor || typeof course.instructor !== 'object') {
          course.instructor = { name: instructorName };
        } else {
          course.instructor.name = instructorName;
        }
      }

      writeJsonFile(COURSES_FILE, courses);
      return sendJson(res, 200, { success: true, message: `Course ${course.code} updated successfully`, course });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 9.11 Admin Forum Query Resolution
  if (pathname === '/api/admin/forum/reply' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { threadId, replyText, officialTitle = 'Dean of Academic Affairs' } = body;
      if (!threadId || !replyText) return sendJson(res, 400, { success: false, error: 'threadId and replyText required' });

      const thread = (facultyFeedback.forumThreads || []).find(t => t.id === threadId);
      if (!thread) return sendJson(res, 404, { success: false, error: 'Forum thread not found' });

      if (!thread.responses) thread.responses = [];
      thread.responses.push({
        author: `Prof. Rajesh Nair (${officialTitle})`,
        role: 'admin',
        text: replyText.trim(),
        timestamp: new Date().toISOString()
      });
      thread.replies = (thread.replies || 0) + 1;
      thread.status = 'resolved';
      thread.open = false;

      writeJsonFile(FEEDBACK_FILE, facultyFeedback);
      return sendJson(res, 200, { success: true, message: 'Dean official resolution posted to discussion thread.', thread });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 9.12 Admin Add New Course Offering
  if (pathname === '/api/admin/courses/add' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const {
        code,
        title,
        category = 'Computer Science & Software Engineering',
        level = 'Intermediate',
        price = 4500,
        status = 'planned',
        instructorId,
        instructorName,
        description
      } = body;

      if (!title || !title.trim()) {
        return sendJson(res, 400, { success: false, error: 'Course title is required' });
      }

      const cleanCode = code ? code.trim().toUpperCase() : `CC-${100 + courses.length + 1}`;
      const courseId = `cc-${Date.now().toString(36)}`;

      let instructorObj = null;
      if (instructorId) {
        const fac = users.find(u => u.uid === instructorId && u.role === 'faculty');
        if (fac) {
          instructorObj = {
            name: fac.name,
            role: fac.designation || 'Course Lead',
            avatar: fac.avatar
          };
          if (!fac.assignedCourses) fac.assignedCourses = [];
          if (!fac.assignedCourses.includes(courseId)) fac.assignedCourses.push(courseId);
          if (!fac.recordingStatus) fac.recordingStatus = {};
          fac.recordingStatus[courseId] = {
            recordedHours: status === 'ready' ? 12 : 0,
            editingHours: status === 'ready' ? 36 : 0,
            status
          };
          writeJsonFile(USERS_FILE, users);
        }
      } else if (instructorName && instructorName.trim()) {
        instructorObj = {
          name: instructorName.trim(),
          role: 'Course Instructor'
        };
      }

      // Generate standard 16 lessons (12 hours) and 10 quiz questions (Case Study standard)
      const lessons = [];
      for (let i = 1; i <= 16; i++) {
        lessons.push({
          id: `l_${courseId}_${i}`,
          title: `Lesson ${i}: Architectural Foundations & Practical Implementation Part ${i}`,
          duration: "45 mins",
          durationSec: 2700,
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          order: i
        });
      }

      const newCourse = {
        id: courseId,
        code: cleanCode,
        title: title.trim(),
        category,
        level,
        price: Number(price) || 4500,
        currency: 'INR',
        durationHours: 12,
        lessonsCount: 16,
        status: status || 'planned',
        instructor: instructorObj || { name: 'Faculty Lead Instructor' },
        description: description || `Comprehensive university-certified curriculum in ${title.trim()} covering 12 hours of studio-grade video instruction and hands-on laboratory exercises.`,
        lessons,
        quiz: {
          quizId: `quiz_${courseId}`,
          title: `${cleanCode} Certification Assessment`,
          passingScorePercent: 70,
          questions: [
            {
              id: "q1",
              question: `Which fundamental principle is central to ${title.trim()}?`,
              options: ["Modularity & Separation of Concerns", "Tight Coupling", "Unversioned Deployments", "Manual Testing"],
              correctIndex: 0
            },
            {
              id: "q2",
              question: "What is the primary criteria for course completion in Case Study 108?",
              options: ["100% video lessons completed and >=70% quiz score", "50% video lessons completed", "Only passing the quiz", "Only tuition payment"],
              correctIndex: 0
            }
          ]
        },
        createdAt: new Date().toISOString()
      };

      courses.push(newCourse);
      writeJsonFile(COURSES_FILE, courses);

      return sendJson(res, 201, {
        success: true,
        message: `Course ${newCourse.code} — "${newCourse.title}" successfully added to university catalog.`,
        course: newCourse
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 9.13 Admin Delete / Archive Course
  if (pathname === '/api/admin/courses/delete' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { courseId } = body;
      const idx = courses.findIndex(c => c.id === courseId || c.code === courseId);
      if (idx === -1) return sendJson(res, 404, { success: false, error: 'Course not found' });
      const removed = courses.splice(idx, 1)[0];

      // Unassign from faculty members
      users.forEach(u => {
        if (u.assignedCourses) {
          u.assignedCourses = u.assignedCourses.filter(cid => cid !== removed.id && cid !== removed.code);
        }
        if (u.recordingStatus) {
          delete u.recordingStatus[removed.id];
          delete u.recordingStatus[removed.code];
        }
      });

      writeJsonFile(COURSES_FILE, courses);
      writeJsonFile(USERS_FILE, users);

      return sendJson(res, 200, { success: true, message: `Course ${removed.code} removed from catalog.` });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 9.14 Admin Unassign Course from Faculty
  if (pathname === '/api/admin/faculty/unassign-course' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { facultyId, courseId } = body;
      const faculty = users.find(u => u.uid === facultyId && u.role === 'faculty');
      if (!faculty) return sendJson(res, 404, { success: false, error: 'Faculty member not found' });

      faculty.assignedCourses = (faculty.assignedCourses || []).filter(cid => cid !== courseId);
      if (faculty.recordingStatus) delete faculty.recordingStatus[courseId];

      const course = courses.find(c => c.id === courseId || c.code === courseId);
      if (course && course.instructor && (course.instructor.name === faculty.name || (typeof course.instructor === 'string' && course.instructor === faculty.name))) {
        course.instructor = { name: 'Faculty Lead' };
        writeJsonFile(COURSES_FILE, courses);
      }

      writeJsonFile(USERS_FILE, users);
      return sendJson(res, 200, { success: true, message: `Course unassigned from ${faculty.name}.`, faculty });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 9.15 Admin Delete Faculty Member
  if (pathname === '/api/admin/faculty/delete' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { facultyId } = body;
      const idx = users.findIndex(u => u.uid === facultyId && u.role === 'faculty');
      if (idx === -1) return sendJson(res, 404, { success: false, error: 'Faculty member not found' });
      const removed = users.splice(idx, 1)[0];
      writeJsonFile(USERS_FILE, users);
      return sendJson(res, 200, { success: true, message: `Faculty member ${removed.name} removed from registry.` });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 9.16 Admin Delete Forum Thread
  if (pathname === '/api/admin/forum/delete' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { threadId } = body;
      const idx = (facultyFeedback.forumThreads || []).findIndex(t => t.id === threadId);
      if (idx === -1) return sendJson(res, 404, { success: false, error: 'Forum thread not found' });
      facultyFeedback.forumThreads.splice(idx, 1);
      writeJsonFile(FEEDBACK_FILE, facultyFeedback);
      return sendJson(res, 200, { success: true, message: 'Discussion thread removed.' });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 9.17 Admin Audit Logs
  if (pathname === '/api/admin/audit-logs' && method === 'GET') {
    const emails = getDispatchedEmails();
    const threads = facultyFeedback.forumThreads || [];
    const logs = [
      ...emails.slice(0, 15).map(e => ({
        id: e.id,
        action: 'EMAIL_DISPATCH',
        actor: 'Admissions Office',
        detail: `Credentials for ${e.recipientName} (${e.recipientEmail})`,
        status: e.deliveryStatus || (e.sentViaSmtp ? 'DELIVERED_VIA_SMTP' : 'OUTBOX_QUEUED'),
        timestamp: e.timestamp
      })),
      ...threads.slice(0, 10).map(t => ({
        id: t.id,
        action: 'FORUM_INTERACTION',
        actor: t.studentName,
        detail: `Inquiry on ${t.courseCode}: "${t.title}"`,
        status: t.status === 'resolved' ? 'RESOLVED' : 'PENDING',
        timestamp: t.createdAt || new Date().toISOString()
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return sendJson(res, 200, { success: true, count: logs.length, logs });
  }

  // ==========================================
  // STATIC FILE SERVING FOR FRONTEND
  // ==========================================
  const frontendDir = path.join(__dirname, '..', 'frontend');
  let filePath = path.join(frontendDir, pathname);

  // Normalize root: Start with login.html by default
  if (pathname === '/' || pathname === '') {
    filePath = path.join(frontendDir, 'login.html');
  }

  // Support clean URLs or subfolders
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Fallback to .html extension if missing
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  // Check if file exists inside frontend or workspace
  if (fs.existsSync(filePath)) {
    return serveStaticFile(req, res, filePath);
  }

  // Check if requesting documentation files
  const docsDir = path.join(__dirname, '..', 'docs');
  const docPath = path.join(docsDir, pathname.replace('/docs/', ''));
  if (pathname.startsWith('/docs') && fs.existsSync(docPath)) {
    return serveStaticFile(req, res, docPath);
  }

  // Not found
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end(`<!DOCTYPE html><html><head><title>404 Not Found - CourseCraft</title><style>body{font-family:sans-serif;padding:40px;background:#0f172a;color:#fff;text-align:center;}a{color:#38bdf8;}</style></head><body><h1>404 - Page Not Found</h1><p>The requested route <code>${pathname}</code> was not found on CourseCraft.</p><p><a href="/">Return to CourseCraft Home</a></p></body></html>`);
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 CourseCraft Full-Stack Application Running on 0.0.0.0:${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📚 University: Continuing Education Centre (Case Study 108)`);
    console.log(`🔥 Connected Firebase Project: ${process.env.FIREBASE_PROJECT_ID || 'coursecraft-c31f9'}`);
    console.log(`=======================================================`);
  });
}

module.exports = { server };

