/**
 * CourseCraft Course Service Layer
 * Clean, loosely coupled service connecting Frontend UI to REST API and Firebase Firestore
 */

window.CourseService = (function() {
  const API_BASE = '/api';

  // Local Storage Keys
  const STORAGE_KEYS = {
    ENROLLMENTS: 'coursecraft_enrollments_data',
    CERTIFICATES: 'coursecraft_certificates_data',
    CUSTOM_COURSES: 'coursecraft_custom_courses'
  };

  // Helper to get local enrollments
  function getLocalEnrollments() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function saveLocalEnrollments(data) {
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(data));
  }

  function getLocalCertificates() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalCertificates(data) {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(data));
  }

  // 1. Fetch All Courses (30 Courses)
  async function getAllCourses(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await fetch(`${API_BASE}/courses?${queryParams}`);
      if (res.ok) {
        const json = await res.json();
        return json.courses;
      }
    } catch (err) {
      console.warn('API error fetching courses, using local fallback:', err);
    }
    // Fallback: Check window.CourseCraftData or default seed
    return [];
  }

  // 2. Fetch Single Course by ID
  async function getCourseById(courseId) {
    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}`);
      if (res.ok) {
        const json = await res.json();
        return json.course;
      }
    } catch (err) {
      console.warn('API error fetching single course:', err);
    }
    return null;
  }

  // 3. Get Student Enrollments
  async function getStudentEnrollments(studentId) {
    if (!studentId) {
      const u = window.CourseCraftAuth ? window.CourseCraftAuth.getCurrentUser() : null;
      studentId = u ? u.uid : 'usr_student_01';
    }

    // For any real enrolled student (not the static demo student usr_student_01), fetch from backend
    if (studentId !== 'usr_student_01') {
      try {
        const res = await fetch(`${API_BASE}/student/enrollments?studentId=${encodeURIComponent(studentId)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.enrollments)) {
            const local = getLocalEnrollments();
            local[studentId] = json.enrollments;
            saveLocalEnrollments(local);
            return json.enrollments;
          }
        }
      } catch (err) {
        console.warn('API error fetching student enrollments:', err);
      }

      // Check user session object if available
      const curUser = window.CourseCraftAuth ? window.CourseCraftAuth.getCurrentUser() : null;
      if (curUser && curUser.uid === studentId && Array.isArray(curUser.enrolledCourses)) {
        return curUser.enrolledCourses;
      }

      const local = getLocalEnrollments();
      if (local[studentId]) {
        return local[studentId];
      }

      // Brand new students start with 0 enrollments
      return [];
    }

    // Default seed enrollments ONLY for demo student (Priya Sharma)
    const local = getLocalEnrollments();
    if (local[studentId]) {
      return local[studentId];
    }
    const defaultEnrollments = [
      {
        courseId: "cc-101",
        enrolledAt: "2026-08-15T10:00:00Z",
        progressPercent: 100,
        completedLessons: ["l101", "l102", "l103", "l104", "l105", "l106", "l107", "l108", "l109", "l110", "l111", "l112", "l113", "l114", "l115", "l116"],
        quizScore: 90,
        quizPassed: true,
        certificateId: "CC-CERT-2026-SE108-8842",
        certificateIssuedAt: "2026-09-10T14:30:00Z"
      },
      {
        courseId: "cc-102",
        enrolledAt: "2026-09-15T09:00:00Z",
        progressPercent: 50,
        completedLessons: ["l201", "l202", "l203", "l204", "l205", "l206", "l207", "l208"],
        quizScore: null,
        quizPassed: false,
        certificateId: null,
        certificateIssuedAt: null
      },
      {
        courseId: "cc-103",
        enrolledAt: "2026-09-20T11:00:00Z",
        progressPercent: 25,
        completedLessons: ["l301", "l302", "l303", "l304"],
        quizScore: null,
        quizPassed: false,
        certificateId: null,
        certificateIssuedAt: null
      }
    ];
    local[studentId] = defaultEnrollments;
    saveLocalEnrollments(local);
    return defaultEnrollments;
  }

  // 4. Enroll & Checkout (Dynamic Course Fee Gateway)
  async function enrollInCourse(courseId, paymentDetails = {}) {
    const user = window.CourseCraftAuth ? window.CourseCraftAuth.getCurrentUser() : { uid: 'usr_student_01', name: 'Priya Sharma' };
    const studentId = user.uid;

    try {
      const res = await fetch(`${API_BASE}/payments/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          studentId,
          paymentMethod: paymentDetails.method || 'UPI / NetBanking'
        })
      });

      if (res.ok) {
        const json = await res.json();
        // Update local state
        const local = getLocalEnrollments();
        if (!local[studentId]) local[studentId] = [];
        const existing = local[studentId].find(e => e.courseId === courseId);
        if (!existing) {
          local[studentId].push({
            courseId,
            enrolledAt: new Date().toISOString(),
            progressPercent: 0,
            completedLessons: [],
            quizScore: null,
            quizPassed: false,
            certificateId: null,
            certificateIssuedAt: null
          });
          saveLocalEnrollments(local);
        }
        return json;
      }
    } catch (err) {
      console.warn('Backend payment endpoint unreachable, recording offline enrolment:', err);
    }

    // Offline fallback enrolment
    const local = getLocalEnrollments();
    if (!local[studentId]) local[studentId] = [];
    const existing = local[studentId].find(e => e.courseId === courseId);
    if (!existing) {
      local[studentId].push({
        courseId,
        enrolledAt: new Date().toISOString(),
        progressPercent: 0,
        completedLessons: [],
        quizScore: null,
        quizPassed: false,
        certificateId: null,
        certificateIssuedAt: null
      });
      saveLocalEnrollments(local);
    }
    return {
      success: true,
      message: 'Enrolment completed successfully (Demo Mode)',
      payment: {
        transactionId: `TXN-LOCAL-${Date.now()}`,
        amount: paymentDetails.amount || 4500,
        currency: 'INR',
        status: 'COMPLETED'
      }
    };
  }

  // 5. Update Lesson Progress
  async function updateProgress(courseId, lessonId, progressPercent) {
    const user = window.CourseCraftAuth ? window.CourseCraftAuth.getCurrentUser() : { uid: 'usr_student_01' };
    const studentId = user.uid;

    // Local update
    const local = getLocalEnrollments();
    if (local[studentId]) {
      const enrollment = local[studentId].find(e => e.courseId === courseId);
      if (enrollment) {
        if (lessonId && !enrollment.completedLessons.includes(lessonId)) {
          enrollment.completedLessons.push(lessonId);
        }
        if (progressPercent !== undefined) {
          enrollment.progressPercent = Math.min(100, Math.max(enrollment.progressPercent || 0, progressPercent));
        }
        saveLocalEnrollments(local);
      }
    }

    try {
      await fetch(`${API_BASE}/progress/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, courseId, lessonId, progressPercent })
      });
    } catch (err) {
      // Ignore network failure, local is preserved
    }
  }

  // 6. Get Course Quiz
  async function getQuiz(courseId) {
    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}/quiz`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Could not fetch quiz from API:', err);
    }
    return null;
  }

  // 7. Submit Quiz & Check 70% Pass Threshold
  async function submitQuiz(courseId, answers) {
    const user = window.CourseCraftAuth ? window.CourseCraftAuth.getCurrentUser() : { uid: 'usr_student_01', name: 'Priya Sharma' };
    const studentId = user.uid;
    const studentName = user.name;

    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, answers, studentId, studentName })
      });

      if (res.ok) {
        const result = await res.json();
        if (result.passed && result.certificate) {
          const certs = getLocalCertificates();
          certs.push(result.certificate);
          saveLocalCertificates(certs);

          // Update local enrollment
          const local = getLocalEnrollments();
          if (local[studentId]) {
            const enr = local[studentId].find(e => e.courseId === courseId);
            if (enr) {
              enr.quizScore = result.scorePercent;
              enr.quizPassed = true;
              enr.certificateId = result.certificate.certificateId;
              enr.progressPercent = 100;
              saveLocalEnrollments(local);
            }
          }
        }
        return result;
      }
    } catch (err) {
      console.warn('API quiz submission failed:', err);
    }

    return { error: 'Failed to evaluate quiz. Please retry.' };
  }

  // 8. Fetch Certificate by ID
  async function getCertificate(certificateId) {
    try {
      const res = await fetch(`${API_BASE}/certificates/${certificateId}`);
      if (res.ok) {
        const json = await res.json();
        return json.certificate;
      }
    } catch (err) {
      console.warn('Error fetching certificate from backend:', err);
    }
    const certs = getLocalCertificates();
    return certs.find(c => c.certificateId.toLowerCase() === (certificateId || '').toLowerCase()) || null;
  }

  // 9. Faculty Operations
  async function getFacultyOverview(facultyId = 'usr_faculty_01') {
    try {
      const res = await fetch(`${API_BASE}/faculty/overview?facultyId=${facultyId}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error in getFacultyOverview:', err);
    }
    return { success: false };
  }

  async function logRecordingHours(courseId, addedHours = 2) {
    try {
      const res = await fetch(`${API_BASE}/faculty/recordings/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, addedHours })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error in logRecordingHours:', err);
    }
    return { success: false };
  }

  async function getFacultyQuizzes(courseId) {
    try {
      const q = courseId ? `?courseId=${courseId}` : '';
      const res = await fetch(`${API_BASE}/faculty/quizzes${q}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error in getFacultyQuizzes:', err);
    }
    return { success: false, quizzes: [] };
  }

  async function getFacultyAnalytics() {
    try {
      const res = await fetch(`${API_BASE}/faculty/analytics`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error in getFacultyAnalytics:', err);
    }
    return { success: false };
  }

  async function getFacultyFeedback(courseId) {
    try {
      const q = courseId ? `?courseId=${courseId}` : '';
      const res = await fetch(`${API_BASE}/faculty/feedback${q}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error in getFacultyFeedback:', err);
    }
    return { success: false };
  }

  return {
    getAllCourses,
    getCourseById,
    getStudentEnrollments,
    enrollInCourse,
    updateProgress,
    getQuiz,
    submitQuiz,
    getCertificate,
    getFacultyOverview,
    logRecordingHours,
    getFacultyQuizzes,
    getFacultyAnalytics,
    getFacultyFeedback
  };
})();
