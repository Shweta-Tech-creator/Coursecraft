/**
 * CourseCraft — Firebase Admin & Firestore Service
 * Manages full persistence for Courses, Users, Enrollments, and Certificates in Google Cloud Firestore
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
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const localKeyPath = path.join(__dirname, '../data/service-account.json');
    const targetKeyPath = (serviceAccountPath && fs.existsSync(serviceAccountPath))
      ? serviceAccountPath
      : (fs.existsSync(localKeyPath) ? localKeyPath : null);

    if (targetKeyPath) {
      const serviceAccount = JSON.parse(fs.readFileSync(targetKeyPath, 'utf8'));
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
 * Syncs local seed files to Firestore collections
 */
async function syncLocalDataToFirestore() {
  const status = initFirebase();
  if (!status.initialized || !db) {
    console.warn('[Firebase Service] Cannot sync to Firestore: Firebase not initialized.');
    return { success: false, error: status.error };
  }

  const results = { courses: 0, users: 0, certificates: 0 };

  try {
    // 1. Sync Courses
    const coursesPath = path.join(__dirname, '../data/courses.json');
    if (fs.existsSync(coursesPath)) {
      const courses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
      const batch = db.batch();
      for (const course of courses) {
        const ref = db.collection('courses').doc(course.id);
        batch.set(ref, course, { merge: true });
        results.courses++;
      }
      await batch.commit();
      console.log(`[Firebase Service] Synced ${results.courses} courses to Firestore collection 'courses'.`);
    }

    // 2. Sync Users
    const usersPath = path.join(__dirname, '../data/users.json');
    if (fs.existsSync(usersPath)) {
      const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      const batch = db.batch();
      for (const user of users) {
        const ref = db.collection('users').doc(user.uid);
        batch.set(ref, user, { merge: true });
        results.users++;
      }
      await batch.commit();
      console.log(`[Firebase Service] Synced ${results.users} users to Firestore collection 'users'.`);
    }

    // 3. Sync Certificates
    const certsPath = path.join(__dirname, '../data/certificates.json');
    if (fs.existsSync(certsPath)) {
      const certs = JSON.parse(fs.readFileSync(certsPath, 'utf8'));
      const batch = db.batch();
      for (const cert of certs) {
        const ref = db.collection('certificates').doc(cert.certificateId);
        batch.set(ref, cert, { merge: true });
        results.certificates++;
      }
      await batch.commit();
      console.log(`[Firebase Service] Synced ${results.certificates} certificates to Firestore collection 'certificates'.`);
    }

    return { success: true, results };
  } catch (err) {
    console.error('[Firebase Service] Error syncing to Firestore:', err);
    return { success: false, error: err.message };
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
    console.error(`[Firebase Service] Error saving certificate ${certificate.certificateId} to Firestore:`, err.message);
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
  saveCertificateToFirestore,
  getCertificateFromFirestore,
  getDb: () => db
};
