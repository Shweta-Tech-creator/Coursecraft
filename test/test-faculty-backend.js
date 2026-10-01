/**
 * Direct In-Memory Test Suite for CourseCraft Faculty Backend
 * Dispatches HTTP requests directly to the server request handler.
 * Verifies all 7 endpoints:
 * 1. GET  /api/faculty/overview
 * 2. POST /api/faculty/recordings/log
 * 3. POST /api/faculty/upload
 * 4. GET  /api/faculty/quizzes
 * 5. POST /api/faculty/quizzes/questions
 * 6. GET  /api/faculty/analytics
 * 7. GET  /api/faculty/feedback
 * 8. POST /api/faculty/forum/reply
 * 9. POST /api/faculty/courses/propose
 */

const { Readable, Writable } = require('stream');
const assert = require('assert');

// Stop background listen collision if any
process.env.PORT = '8099';
const { server } = require('../backend/server.js');

function dispatchRequest(method, urlPath, body = null) {
  return new Promise((resolve) => {
    const req = new Readable({
      read() {
        if (body) {
          this.push(JSON.stringify(body));
        }
        this.push(null);
      }
    });

    req.method = method;
    req.url = urlPath;
    req.headers = {
      host: 'localhost:8085',
      'content-type': 'application/json'
    };

    let statusCode = 200;
    const headers = {};
    let responseBody = '';

    const res = new Writable({
      write(chunk, encoding, callback) {
        responseBody += chunk.toString();
        callback();
      }
    });

    res.writeHead = function(code, h) {
      statusCode = code;
      if (h) Object.assign(headers, h);
    };

    res.setHeader = function(key, val) {
      headers[key.toLowerCase()] = val;
    };

    res.on('finish', () => {
      let parsed = responseBody;
      try {
        parsed = JSON.parse(responseBody);
      } catch (e) {}
      resolve({ status: statusCode, headers, body: parsed });
    });

    server.emit('request', req, res);
  });
}

async function runFacultyTests() {
  console.log('=======================================================');
  console.log('🧪 Testing CourseCraft Faculty Backend Endpoints (In-Memory)');
  console.log('=======================================================');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✕ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Health check
  await test('GET /api/health returns healthy', async () => {
    const res = await dispatchRequest('GET', '/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'HEALTHY');
  });

  // 2. Faculty Overview
  await test('GET /api/faculty/overview returns assigned courses, quotas & phase roadmap', async () => {
    const res = await dispatchRequest('GET', '/api/faculty/overview?facultyId=usr_faculty_01');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.faculty, 'Faculty object missing');
    assert.strictEqual(res.body.faculty.name, 'Dr. Aarav Sharma');
    assert.ok(Array.isArray(res.body.courses), 'Courses array missing');
    assert.ok(res.body.courses.length >= 5, 'Should have at least 5 assigned courses');
    assert.ok(res.body.phaseRoadmap.phase1, 'Phase 1 missing');
    assert.ok(res.body.phaseRoadmap.phase2, 'Phase 2 missing');
    assert.strictEqual(res.body.kpis.annualTargetPerCourse, 150);
  });

  // 3. Log recording hours
  await test('POST /api/faculty/recordings/log increments hours and enforces 3:1 editing ratio', async () => {
    const res = await dispatchRequest('POST', '/api/faculty/recordings/log', {
      courseId: 'cc-110',
      addedHours: 2
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.recordedHours >= 2, 'Recorded hours not updated');
    assert.strictEqual(res.body.editingHours, res.body.recordedHours * 3, '3:1 editing ratio violated');
  });

  // 4. Raw upload interface
  await test('POST /api/faculty/upload submits raw recording and creates receipt', async () => {
    const res = await dispatchRequest('POST', '/api/faculty/upload', {
      courseId: 'cc-117',
      moduleTitle: 'Module 3: Shaders and Lighting',
      durationHours: 2,
      fileName: 'module3_unity_shaders.mp4'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.upload.uploadId.startsWith('REC-RAW-'));
    assert.strictEqual(res.body.upload.editingEffortHours, 6);
  });

  // 5. Question bank retrieval
  await test('GET /api/faculty/quizzes returns quizzes with answer keys, explanations and pass threshold', async () => {
    const res = await dispatchRequest('GET', '/api/faculty/quizzes?courseId=cc-101');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.quizzes.length >= 1);
    const quiz = res.body.quizzes[0];
    assert.strictEqual(quiz.passThresholdPercent, 70);
    assert.ok(quiz.questions.length >= 10, 'Expected 10-question MCQ');
    assert.ok(quiz.questions[0].explanation, 'Question explanation missing');
    assert.ok(quiz.questions[0].correctAnswer, 'Answer key missing');
  });

  // 6. Add question to question bank
  await test('POST /api/faculty/quizzes/questions adds a validated MCQ question', async () => {
    const res = await dispatchRequest('POST', '/api/faculty/quizzes/questions', {
      courseId: 'cc-101',
      question: 'What is the primary benefit of containerizing a microservice with Docker?',
      options: [
        'Direct kernel level hardware override',
        'Consistent execution environment across development and production',
        'Elimination of network latency',
        'Automatic SQL query optimization'
      ],
      correctIndex: 1,
      explanation: 'Containers package the application and its dependencies together, guaranteeing consistency.'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.totalQuestions >= 11);
  });

  // 7. Student Analytics
  await test('GET /api/faculty/analytics returns live enrolments, dropoff, and pass/fail distribution', async () => {
    const res = await dispatchRequest('GET', '/api/faculty/analytics');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.analytics.targetPerCourseYear, 150);
    assert.ok(Array.isArray(res.body.analytics.liveEnrolments));
    assert.ok(Array.isArray(res.body.analytics.dropoffAnalytics));
    assert.strictEqual(res.body.analytics.quizScoreDistribution.passThresholdPercent, 70);
    assert.ok(Array.isArray(res.body.analytics.quizScoreDistribution.histogramBands));
  });

  // 8. Feedback & Query Center
  await test('GET /api/faculty/feedback returns reviews and academic forum threads', async () => {
    const res = await dispatchRequest('GET', '/api/faculty/feedback');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.reviews.length > 0);
    assert.ok(res.body.forumThreads.length > 0);
  });

  // 9. Forum reply by faculty
  await test('POST /api/faculty/forum/reply posts instructor response and resolves thread', async () => {
    const res = await dispatchRequest('POST', '/api/faculty/forum/reply', {
      threadId: 'th-101',
      replyText: 'Kubernetes becomes beneficial when managing clusters of 5+ microservices across multiple availability zones.',
      facultyName: 'Dr. Aarav Sharma'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.thread.status, 'resolved');
    assert.strictEqual(res.body.thread.open, false);
  });

  // 10. Propose new course
  await test('POST /api/faculty/courses/propose submits proposal and registers planned course', async () => {
    const res = await dispatchRequest('POST', '/api/faculty/courses/propose', {
      title: 'DevOps Infrastructure as Code with Terraform & Ansible',
      code: 'DEV-125',
      category: 'Cloud & Infrastructure'
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.course.code, 'DEV-125');
  });

  // 11. Faculty Add Student & Email Dispatch
  await test('POST /api/faculty/students/add creates student and dispatches email credentials', async () => {
    const res = await dispatchRequest('POST', '/api/faculty/students/add', {
      name: 'Rohan Verma',
      email: 'rohan.verma@university.edu',
      courseId: 'cc-101',
      tempPassword: 'TempPass@2026'
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.student.uid);
    assert.strictEqual(res.body.student.email, 'rohan.verma@university.edu');
    assert.strictEqual(res.body.student.temporaryPassword, 'TempPass@2026');
    assert.strictEqual(res.body.emailDispatch.deliveryStatus, 'SENT_TO_INBOX');
  });

  // 12. Faculty View Students
  await test('GET /api/faculty/students returns student roster with credentials status', async () => {
    const res = await dispatchRequest('GET', '/api/faculty/students');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.students.some(s => s.email === 'rohan.verma@university.edu'));
  });

  // 13. Student Login with Generated Temp Password
  await test('POST /api/auth/login succeeds with generated temporary password', async () => {
    const res = await dispatchRequest('POST', '/api/auth/login', {
      email: 'rohan.verma@university.edu',
      password: 'TempPass@2026'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.email, 'rohan.verma@university.edu');
  });

  // 14. Student Change Password
  await test('POST /api/users/change-password updates student password', async () => {
    const res = await dispatchRequest('POST', '/api/users/change-password', {
      email: 'rohan.verma@university.edu',
      currentPassword: 'TempPass@2026',
      newPassword: 'SecureNewPassword@2026'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  // 15. Student Submit Course Rating & Feedback (Synced with Faculty Dashboard)
  await test('POST /api/student/feedback posts review to faculty dashboard', async () => {
    const res = await dispatchRequest('POST', '/api/student/feedback', {
      studentName: 'Rohan Verma',
      courseId: 'cc-101',
      courseCode: 'CSE-101',
      stars: 5,
      comment: 'Excellent hands-on cloud labs and clear architectural breakdown.'
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.review.id);
  });

  // 16. Student Submit Academic Query
  await test('POST /api/student/queries posts question to faculty discussion forum', async () => {
    const res = await dispatchRequest('POST', '/api/student/queries', {
      studentName: 'Rohan Verma',
      courseId: 'cc-101',
      courseCode: 'CSE-101',
      title: 'Clarification on horizontal pod autoscaling',
      question: 'How do we configure metric thresholds for CPU vs custom memory metrics in Kubernetes?'
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.thread.status, 'open');
  });

  // 17. Student Read Queries
  await test('GET /api/student/queries returns student discussion queries', async () => {
    const res = await dispatchRequest('GET', '/api/student/queries?studentName=Rohan%20Verma');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.threads.length > 0);
  });

  // 18. Faculty Email Outbox List
  await test('GET /api/faculty/emails returns dispatched emails list and outbox status', async () => {
    const res = await dispatchRequest('GET', '/api/faculty/emails');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.emails));
    assert.ok(res.body.emails.length >= 1);
  });

  // 19. Faculty Re-dispatch Email
  await test('POST /api/faculty/emails/resend re-dispatches credentials', async () => {
    const res = await dispatchRequest('POST', '/api/faculty/emails/resend', {
      email: 'rohan.verma@university.edu',
      name: 'Rohan Verma',
      password: 'TempPass@2026'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.emailDispatch.id);
  });

  // 20. Student Enrollments Endpoint
  await test('GET /api/student/enrollments returns student enrollments', async () => {
    const res = await dispatchRequest('GET', '/api/student/enrollments?email=kadamsweta92@gmail.com');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.count, 0);
    assert.deepStrictEqual(res.body.enrollments, []);
  });

  console.log('=======================================================');
  console.log(`Results: ${passed}/${total} tests passed`);
  console.log('=======================================================');

  server.close();
  if (passed !== total) {
    process.exit(1);
  }
}

runFacultyTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
