/**
 * CourseCraft — Firebase Admin & Firestore Multi-Collection Architecture
 * Stores dedicated, organized collections for:
 *  - `students`: individual student accounts, enrollments, quizzes, payments & dashboard summaries
 *  - `faculty`: faculty accounts, assigned courses, recording hours & production status
 *  - `admin`: administrator account, platform telemetry, Case Study 108 calculations & overall stats
 *  - `courses`: full 30-course university catalog
 *  - `certificates`: verified certificates with Cloudinary URLs
 */

const fs = require('fs');
const path = require('path');
let admin = null;
let getFirestore = null;

try {
  admin = require('firebase-admin');
  const firestoreModule = require('firebase-admin/firestore');
  getFirestore = firestoreModule.getFirestore;
} catch (e) {
  console.warn('[Firebase Service] firebase-admin package not available:', e.message);
}

let db = null;
let initialized = false;

function initFirebase() {
  if (initialized && db) return { initialized: true, db };
  if (!admin || !getFirestore) return { initialized: false, error: 'firebase-admin not installed' };

  try {
    let serviceAccount = null;

    // 1. Direct JSON string in environment variable (Ideal for Render / Heroku / Cloud)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      } catch (pErr) {
        console.warn('[Firebase Service] Could not parse FIREBASE_SERVICE_ACCOUNT_JSON:', pErr.message);
      }
    }

    // 2. Base64 encoded JSON in environment variable
    if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      try {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);
      } catch (bErr) {
        console.warn('[Firebase Service] Could not parse FIREBASE_SERVICE_ACCOUNT_BASE64:', bErr.message);
      }
    }

    // 3. File path (Render secret files or local development)
    if (!serviceAccount) {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      const localKeyPath = path.join(__dirname, '../data/service-account.json');
      const targetKeyPath = (serviceAccountPath && fs.existsSync(serviceAccountPath))
        ? serviceAccountPath
        : (fs.existsSync(localKeyPath) ? localKeyPath : null);

      if (targetKeyPath) {
        serviceAccount = JSON.parse(fs.readFileSync(targetKeyPath, 'utf8'));
      }
    }

    if (serviceAccount) {
      if (!admin.getApps().length) {
        admin.initializeApp({
          credential: admin.cert(serviceAccount),
          projectId: serviceAccount.project_id || 'coursecraft-c31f9'
        });
      }
      db = getFirestore();
      initialized = true;
      console.log('✅ [Firebase Service] Initialized with Service Account JSON for project:', serviceAccount.project_id);
      return { initialized: true, db };
    }

    // Fallback: Initialize with project ID
    const projectId = process.env.FIREBASE_PROJECT_ID || 'coursecraft-c31f9';
    if (!admin.getApps().length) {
      admin.initializeApp({
        projectId
      });
    }
    db = getFirestore();
    initialized = true;
    console.log('ℹ️ [Firebase Service] Initialized with Project ID:', projectId);
    return { initialized: true, db };
  } catch (err) {
    console.warn('⚠️ [Firebase Service] Firebase Admin init notice:', err.message);
    return { initialized: false, error: err.message };
  }
}

/**
 * Builds a clean student document with dashboard calculations
 */
function buildStudentDoc(user) {
  const enrollments = user.enrolledCourses || [];
  const payments = user.payments || [];
  const completedCount = enrollments.filter(e => e.progressPercent === 100 || e.quizPassed).length;
  const inProgressCount = enrollments.filter(e => (e.progressPercent || 0) < 100 && !e.quizPassed).length;
  const certCount = enrollments.filter(e => e.certificateId).length;
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((sum, e) => sum + (Number(e.progressPercent) || 0), 0) / enrollments.length)
    : 0;

  return {
    uid: user.uid,
    name: user.name,
    email: user.email,
    role: 'student',
    avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    createdAt: user.createdAt || new Date().toISOString(),
    passwordChangedAt: user.passwordChangedAt || null,
    enrolledCourses: enrollments,
    payments: payments,
    dashboardSummary: {
      totalEnrolledCourses: enrollments.length,
      completedCoursesCount: completedCount,
      inProgressCoursesCount: inProgressCount,
      certificatesEarnedCount: certCount,
      averageProgressPercent: avgProgress,
      totalFeesInvestedINR: totalPaid
    },
    updatedAt: new Date().toISOString()
  };
}

/**
 * Builds a clean faculty document with dashboard calculations
 */
function buildFacultyDoc(user) {
  const assigned = user.assignedCourses || [];
  const recording = user.recordingStatus || {};
  let totalRecHours = 0;
  let totalEditHours = 0;
  let completedCount = 0;
  let inProdCount = 0;

  Object.values(recording).forEach(r => {
    totalRecHours += (Number(r.recordedHours) || 0);
    totalEditHours += (Number(r.editingHours) || 0);
    if (r.status === 'completed') completedCount++;
    if (r.status === 'in_production') inProdCount++;
  });

  return {
    uid: user.uid,
    name: user.name,
    email: user.email,
    role: 'faculty',
    avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    department: user.department || 'Continuing Education Centre',
    designation: user.designation || 'Lead Course Faculty',
    assignedCourses: assigned,
    recordingStatus: recording,
    dashboardSummary: {
      totalAssignedCourses: assigned.length,
      recordedHoursLogged: totalRecHours,
      editingHoursRequired: totalEditHours,
      completedCoursesReady: completedCount,
      coursesInProduction: inProdCount,
      targetHoursPerCourse: 12
    },
    updatedAt: new Date().toISOString()
  };
}

/**
 * Builds platform-wide administrator telemetry document
 */
function buildAdminOverviewDoc(users, courses, certificates, metrics) {
  const students = users.filter(u => u.role === 'student');
  const faculty = users.filter(u => u.role === 'faculty');

  let totalEnrollments = 0;
  let totalRevenueCollected = 0;
  students.forEach(s => {
    totalEnrollments += (s.enrolledCourses || []).length;
    (s.payments || []).forEach(p => {
      totalRevenueCollected += (Number(p.amount) || 0);
    });
  });

  return {
    docId: 'dashboard_overview',
    title: 'CourseCraft Academic & Continuing Education Administration',
    caseStudy: {
      id: 108,
      department: 'Computer Science & Engineering',
      subject: 'Software Engineering & Project Management',
      program: 'B.Tech CSE 2025-29 (Semester III)'
    },
    platformStats: {
      totalPlannedCourses: 30,
      initialLaunchCourses: 8,
      totalRegisteredStudents: students.length,
      totalCourseEnrollments: totalEnrollments,
      totalCertificatesIssued: (certificates || []).length,
      totalFacultyMembers: faculty.length,
      actualRevenueCollectedINR: totalRevenueCollected
    },
    caseStudy108Calculations: {
      courseFeeINR: 4500,
      targetEnrolmentsPerCourseYear: 150,
      annualRevenue8CoursesINR: 5400000,   // 8 * 150 * 4500
      annualRevenue30CoursesINR: 20250000, // 30 * 150 * 4500
      contentProduction: {
        videoHoursPerCourse: 12,
        recordingEditingRatio: 3,
        effortHoursPerCourse: 36,
        effortHours8Courses: 288,
        effortHours30Courses: 1080
      },
      capacityAndTimeline: {
        editorsCount: 2,
        weeklyHoursPerEditor: 30,
        combinedBandwidthHoursPerWeek: 60,
        weeksNeeded8Courses: 4.8,          // 288 / 60
        weeksNeeded30Courses: 18.0,        // 1080 / 60
        softwareReadyWeeks: 10.0,
        criticalPathBottleneck: 'Content Production (18.0 Weeks vs Software Dev 10.0 Weeks controls launch)'
      },
      qualityAssurance: {
        quizPassingThresholdPercent: 70,
        testedDREPercent: 94.2,
        defectDensityPerKLOC: 1.2
      }
    },
    updatedAt: new Date().toISOString()
  };
}

/**
 * Syncs all data into role-specific Firestore collections
 */
async function syncLocalDataToFirestore() {
  const status = initFirebase();
  if (!status.initialized || !db) {
    console.warn('[Firebase Service] Cannot sync to Firestore: Firebase not initialized.');
    return { success: false, error: status.error };
  }

  const results = { courses: 0, students: 0, faculty: 0, admin: 0, certificates: 0 };

  try {
    const coursesPath = path.join(__dirname, '../data/courses.json');
    const usersPath = path.join(__dirname, '../data/users.json');
    const certsPath = path.join(__dirname, '../data/certificates.json');
    const metricsPath = path.join(__dirname, '../data/metrics.json');

    const courses = fs.existsSync(coursesPath) ? JSON.parse(fs.readFileSync(coursesPath, 'utf8')) : [];
    const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath, 'utf8')) : [];
    const certs = fs.existsSync(certsPath) ? JSON.parse(fs.readFileSync(certsPath, 'utf8')) : [];
    const metrics = fs.existsSync(metricsPath) ? JSON.parse(fs.readFileSync(metricsPath, 'utf8')) : {};

    // 1. Sync Courses Collection
    if (courses.length) {
      const batch = db.batch();
      courses.forEach(c => {
        const ref = db.collection('courses').doc(c.id);
        batch.set(ref, c, { merge: true });
        results.courses++;
      });
      await batch.commit();
      console.log(`[Firebase Service] Synced ${results.courses} courses to collection 'courses'.`);
    }

    // 2. Sync Students Collection & Faculty Collection & Admin Collection
    for (const u of users) {
      if (u.role === 'student') {
        const doc = buildStudentDoc(u);
        await db.collection('students').doc(u.uid).set(doc, { merge: true });
        results.students++;
      } else if (u.role === 'faculty') {
        const doc = buildFacultyDoc(u);
        await db.collection('faculty').doc(u.uid).set(doc, { merge: true });
        results.faculty++;
      } else if (u.role === 'admin') {
        await db.collection('admin').doc(u.uid).set({
          ...u,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        results.admin++;
      }
    }
    console.log(`[Firebase Service] Synced ${results.students} students, ${results.faculty} faculty, ${results.admin} admin accounts.`);

    // 3. Sync Admin Overall Dashboard Overview Document
    const adminOverview = buildAdminOverviewDoc(users, courses, certs, metrics);
    await db.collection('admin').doc('dashboard_overview').set(adminOverview, { merge: true });

    // 4. Sync Certificates Collection
    if (certs.length) {
      const batch = db.batch();
      certs.forEach(cert => {
        const ref = db.collection('certificates').doc(cert.certificateId);
        batch.set(ref, cert, { merge: true });
        results.certificates++;
      });
      await batch.commit();
      console.log(`[Firebase Service] Synced ${results.certificates} certificates to collection 'certificates'.`);
    }

    return { success: true, results };
  } catch (err) {
    console.error('[Firebase Service] Error syncing multi-collections to Firestore:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Saves or updates a specific student in Firestore
 */
async function saveStudentToFirestore(student) {
  const status = initFirebase();
  if (!status.initialized || !db || !student || !student.uid) return false;
  try {
    const doc = buildStudentDoc(student);
    await db.collection('students').doc(student.uid).set(doc, { merge: true });
    console.log(`[Firebase Service] Student ${student.uid} updated in Firestore collection 'students'.`);
    return true;
  } catch (err) {
    console.error(`[Firebase Service] Error saving student ${student.uid}:`, err.message);
    return false;
  }
}

/**
 * Saves or updates a specific faculty member in Firestore
 */
async function saveFacultyToFirestore(faculty) {
  const status = initFirebase();
  if (!status.initialized || !db || !faculty || !faculty.uid) return false;
  try {
    const doc = buildFacultyDoc(faculty);
    await db.collection('faculty').doc(faculty.uid).set(doc, { merge: true });
    console.log(`[Firebase Service] Faculty ${faculty.uid} updated in Firestore collection 'faculty'.`);
    return true;
  } catch (err) {
    console.error(`[Firebase Service] Error saving faculty ${faculty.uid}:`, err.message);
    return false;
  }
}

/**
 * Saves a certificate to Firestore collection 'certificates'
 */
async function saveCertificateToFirestore(certificate) {
  const status = initFirebase();
  if (!status.initialized || !db) return false;
  try {
    await db.collection('certificates').doc(certificate.certificateId).set(certificate, { merge: true });
    console.log(`[Firebase Service] Certificate ${certificate.certificateId} saved to Firestore.`);
    return true;
  } catch (err) {
    console.error(`[Firebase Service] Error saving certificate ${certificate.certificateId}:`, err.message);
    return false;
  }
}

/**
 * Fetches certificate by ID from Firestore
 */
async function getCertificateFromFirestore(certificateId) {
  const status = initFirebase();
  if (!status.initialized || !db) return null;
  try {
    const doc = await db.collection('certificates').doc(certificateId).get();
    if (doc.exists) {
      return doc.data();
    }
  } catch (err) {
    console.warn(`[Firebase Service] Error fetching certificate from Firestore:`, err.message);
  }
  return null;
}

module.exports = {
  initFirebase,
  syncLocalDataToFirestore,
  saveStudentToFirestore,
  saveFacultyToFirestore,
  saveCertificateToFirestore,
  getCertificateFromFirestore,
  getDb: () => db
};
