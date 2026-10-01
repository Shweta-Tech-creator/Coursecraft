# Requirements Traceability Matrix (RTM)
## CourseCraft — Case Study No. 108

The RTM establishes bidirectional traceability between business goals, functional requirements, architectural components, database collections, and test suites.

| Req ID | Business Goal | System Component | Database / Persistence | Test Case Reference | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Public discovery of 30 courses | `frontend/index.html`, `backend/routes/api.js` | `courses.json` / Firestore `courses` | `TC-CAT-01`, `TC-CAT-02` | **Verified** |
| **FR-02** | Secure multi-role access & test personas | `frontend/js/auth.js`, `frontend/js/auth-guard.js` | `users.json` / Firebase Auth | `TC-AUTH-01`, `TC-AUTH-02` | **Verified** |
| **FR-03** | Course monetization (₹4,500 fee) | `frontend/js/course-service.js`, `/api/payments/checkout` | `users.payments` / Firestore `payments` | `TC-PAY-01`, `TC-PAY-02` | **Verified** |
| **FR-04** | 12-hour video curriculum delivery | `frontend/student/learn.html`, `frontend/css/learn.css` | `courses.modules` / Cloud Storage | `TC-VID-01`, `TC-VID-02` | **Verified** |
| **FR-05** | Lesson completion telemetry | `frontend/js/course-service.js`, `/api/progress/update` | `users.enrolledCourses.progressPercent` | `TC-PROG-01`, `TC-PROG-02` | **Verified** |
| **FR-06** | 10-question certification exams | `frontend/student/quiz.html`, `/api/courses/:id/quiz` | `courses.quiz` / Firestore `quizzes` | `TC-QZ-01`, `TC-QZ-02` | **Verified** |
| **FR-07** | 70% passing threshold scoring | `backend/server.js` (`/quiz/submit`), `course-service.js` | `quiz_results` / `users.quizScore` | `TC-BVA-01`, `TC-BVA-02` | **Verified** |
| **FR-08** | Digital credential issuance | `frontend/student/certificate.html`, `certificate.css` | `certificates` array / Firestore `certificates` | `TC-CERT-01`, `TC-CERT-02` | **Verified** |
| **FR-09** | Public certificate verification | `backend/server.js` (`/api/certificates/:id`) | `certificates` collection | `TC-CERT-03` | **Verified** |
| **FR-10** | Faculty 12h recording & 36h ratio tracking | `frontend/faculty/dashboard.html` | `users.recordingStatus` | `TC-FAC-01` | **Verified** |
| **FR-11** | Dual-track CPM schedule comparison | `frontend/administrator/dashboard.html`, `sepm-calculator.js` | `metrics.json` | `TC-CPM-01`, `TC-CPM-02` | **Verified** |
| **FR-12** | Annual revenue tracking (₹2.02 Cr target) | `frontend/administrator/dashboard.html`, `/api/sepm/metrics` | `metrics.json` | `TC-FIN-01` | **Verified** |
